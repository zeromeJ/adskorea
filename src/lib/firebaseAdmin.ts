import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { prisma } from "@/lib/prisma";

const invalidTokenCodes = new Set([
  "messaging/invalid-argument",
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
]);

const multicastTokenLimit = 500;

type InquiryPush = {
  inquiryId: string;
  title: string;
  body: string;
  type: "NEW_INQUIRY" | "ASSIGNED_INQUIRY";
};

function getFirebaseMessaging() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) return null;

  const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

  if (typeof serviceAccount.privateKey === "string") {
    serviceAccount.privateKey = serviceAccount.privateKey.replace(/\\n/g, "\n");
  }

  const app =
    getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });

  return getMessaging(app);
}

export async function sendNewInquiryPush(
  inquiryId: string,
  companyName: string,
  contactPerson: string,
) {
  const devices = await prisma.adminDevice.findMany({
    where: {
      adminUser: {
        isActive: true,
        isSuperAdmin: true,
      },
    },
    select: { token: true },
  });

  await sendInquiryPush(
    devices.map(({ token }) => token),
    {
      inquiryId,
      title: "ADS 신규 문의",
      body: `${companyName || "회사명 미입력"} · ${contactPerson ? `${contactPerson}님` : "담당자 미입력"}의 문의가 접수되었습니다.`,
      type: "NEW_INQUIRY",
    },
  );
}

export async function sendInquiryAssignmentPush(
  inquiryId: string,
  assignedAdminId: string,
  companyName: string,
) {
  const devices = await prisma.adminDevice.findMany({
    where: {
      adminUserId: assignedAdminId,
      adminUser: { isActive: true },
    },
    select: { token: true },
  });

  await sendInquiryPush(
    devices.map(({ token }) => token),
    {
      inquiryId,
      title: "ADS 문의 담당 배정",
      body: `${companyName} 문의의 담당자로 배정되었습니다.`,
      type: "ASSIGNED_INQUIRY",
    },
  );
}

async function sendInquiryPush(tokens: string[], push: InquiryPush) {
  if (tokens.length === 0) return;

  const messaging = getFirebaseMessaging();

  if (!messaging) {
    console.warn("Inquiry push skipped: FIREBASE_SERVICE_ACCOUNT_JSON is missing.");
    return;
  }

  const invalidTokens: string[] = [];

  for (let index = 0; index < tokens.length; index += multicastTokenLimit) {
    const tokenChunk = tokens.slice(index, index + multicastTokenLimit);
    const response = await messaging.sendEachForMulticast({
      tokens: tokenChunk,
      notification: {
        title: push.title,
        body: push.body,
      },
      data: {
        inquiryId: push.inquiryId,
        type: push.type,
      },
      android: {
        priority: "high",
        notification: { channelId: "new_inquiries" },
      },
    });

    invalidTokens.push(
      ...response.responses.flatMap((result, tokenIndex) =>
        !result.success && result.error && invalidTokenCodes.has(result.error.code)
          ? [tokenChunk[tokenIndex]]
          : [],
      ),
    );
  }

  if (invalidTokens.length > 0) {
    await prisma.adminDevice.deleteMany({
      where: { token: { in: invalidTokens } },
    });
  }
}
