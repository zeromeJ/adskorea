import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isValidEmail } from "@/lib/contactSchema";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      companyName,
      contactPerson,
      email,
      phone,
      country,
      industry,
      currentPalletType,
      productInterest,
      estimatedQuantity,
      exportCountry,
      message,
      privacyAgreed,
      website,
    } = body;

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!privacyAgreed) {
      return NextResponse.json(
        { success: false, message: "Privacy agreement is required." },
        { status: 400 },
      );
    }

    if (!companyName || !contactPerson || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing." },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format." },
        { status: 400 },
      );
    }

    const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;
    const senderEmail = process.env.CONTACT_SENDER_EMAIL;

    if (!receiverEmail || !senderEmail || !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Email environment variables are missing.",
        },
        { status: 500 },
      );
    }

    const submittedAt = new Date().toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
    });

    await resend.emails.send({
      from: senderEmail,
      to: receiverEmail,
      replyTo: email,
      subject: `[ADS Website Inquiry] New B2B Inquiry from ${companyName}`,
      text: `
새로운 문의가 접수되었습니다.

접수 시간: ${submittedAt}

회사명: ${companyName}
담당자명: ${contactPerson}
이메일: ${email}
연락처: ${phone || "-"}
국가/지역: ${country || "-"}
산업 분야: ${industry || "-"}
현재 사용 중인 팔레트: ${currentPalletType || "-"}
관심 제품: ${productInterest || "-"}
예상 수량: ${estimatedQuantity || "-"}
주요 수출 국가: ${exportCountry || "-"}

문의 내용:
${message}
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to send inquiry." },
      { status: 500 },
    );
  }
}
