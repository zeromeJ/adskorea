import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ResponseMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ContactRequestBody,
  normalizeContactBody,
  validateContactBody,
} from "@/lib/contactValidation";
import { isRateLimited } from "@/lib/rateLimit";
import { sendNewInquiryPush } from "@/lib/firebaseAdmin";
import { inquiryTypeLabel } from "@/lib/contactSchema";

const resend = new Resend(process.env.RESEND_API_KEY);

const responseMethodLabels: Record<ResponseMethod, string> = {
  EMAIL: "이메일",
  PHONE: "전화",
  TEXT: "문자",
  BOTH: "상관없음",
  ANY: "상관없음",
};

function getClientKey(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(getClientKey(request))) {
      return NextResponse.json(
        { success: false, message: "잠시 후 다시 시도해 주세요." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as ContactRequestBody;
    const data = normalizeContactBody(body);

    if (data.website) {
      return NextResponse.json({ success: true });
    }

    const validationMessage = validateContactBody(data);

    if (validationMessage) {
      return NextResponse.json(
        { success: false, message: validationMessage },
        { status: 400 },
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email || null,
        phone: data.phone || null,
        responseMethod: data.responseMethod as ResponseMethod,
        inquiryType: data.inquiryType,
        department: data.department || null,
        inquiryDetails: data.details,
        industry: data.industry || null,
        productInterest: data.productInterest || null,
        cargoType: data.details.cargoType || null,
        loadPerPallet: data.details.totalWeight || null,
        estimatedQuantity: data.estimatedQuantity || null,
        requiredPalletSize: data.details.requiredPalletSize || null,
        exportCountry: data.details.deliveryRegion || data.details.exportCountry || null,
        message: data.message || null,
      },
    });

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;
    const senderEmail = process.env.CONTACT_SENDER_EMAIL;

    if (receiverEmail && senderEmail && process.env.RESEND_API_KEY) {
      const submittedAt = new Date(inquiry.createdAt).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      });

      try {
        // To change the inquiry notification receiver, update CONTACT_RECEIVER_EMAIL in .env.local and production environment variables.
        await resend.emails.send({
          from: senderEmail,
          to: receiverEmail,
          ...(data.email ? { replyTo: data.email } : {}),
          subject: `[ADS Website Inquiry] New B2B Inquiry from ${data.companyName}`,
          text: `
새로운 홈페이지 문의가 접수되었습니다.

접수 시간: ${submittedAt}

문의 유형: ${inquiryTypeLabel(data.inquiryType)}
회사명: ${data.companyName}
담당자명: ${data.contactPerson}
부서/직책: ${data.department || "-"}
이메일: ${data.email || "-"}
연락처: ${data.phone || "-"}
회신 방법: ${responseMethodLabels[data.responseMethod as ResponseMethod]}
산업 분야: ${data.industry || "-"}
화물 종류: ${data.details.cargoType || "-"}
팔레트당 화물중량: ${data.details.totalWeight || "-"}
예상 사용수량: ${data.estimatedQuantity}
필요 팔레트 규격: ${data.details.requiredPalletSize || "-"}
관심 제품: ${data.productInterest || "-"}

유형별 상세정보:
${Object.entries(data.details).map(([key, value]) => `${key}: ${value}`).join("\n") || "-"}

문의 내용:
${data.message || "-"}

관리자 앱에서 처리 상태를 확인하고 업데이트하세요.
          `,
        });
      } catch (emailError) {
        console.error("Contact backup email failed:", emailError);
      }
    } else {
      console.warn("Contact backup email skipped: email environment variables are missing.");
    }

    try {
      await sendNewInquiryPush(
        inquiry.id,
        inquiry.companyName,
        inquiry.contactPerson,
      );
    } catch (pushError) {
      console.error("Inquiry push notification failed:", pushError);
    }

    return NextResponse.json({ success: true, inquiryId: inquiry.id });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      { success: false, message: "문의 접수 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
