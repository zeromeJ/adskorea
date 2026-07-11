import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { prisma } from "@/lib/prisma";

const invalidTokenCodes = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
]);

function getFirebaseMessaging() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) return null;

  const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
  const app =
    getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });

  return getMessaging(app);
}

export async function sendNewInquiryPush(inquiryId: string) {
  const messaging = getFirebaseMessaging();

  if (!messaging) {
    console.warn("Inquiry push skipped: FIREBASE_SERVICE_ACCOUNT_JSON is missing.");
    return;
  }

  const devices = await prisma.adminDevice.findMany({
    select: { token: true },
  });

  if (devices.length === 0) return;

  const tokens = devices.map(({ token }) => token);
  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: "ADS 문의관리",
      body: "새로운 문의가 등록되었습니다.",
    },
    data: {
      inquiryId,
      type: "new_inquiry",
    },
    android: {
      priority: "high",
      notification: { channelId: "new_inquiries" },
    },
  });

  const invalidTokens = response.responses.flatMap((result, index) =>
    !result.success && result.error && invalidTokenCodes.has(result.error.code)
      ? [tokens[index]]
      : [],
  );

  if (invalidTokens.length > 0) {
    await prisma.adminDevice.deleteMany({
      where: { token: { in: invalidTokens } },
    });
  }
}
