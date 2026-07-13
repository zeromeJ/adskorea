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
  const invalidTokens: string[] = [];

  for (let index = 0; index < tokens.length; index += multicastTokenLimit) {
    const tokenChunk = tokens.slice(index, index + multicastTokenLimit);
    const response = await messaging.sendEachForMulticast({
      tokens: tokenChunk,
      notification: {
        title: "ADS 견적 문의",
        body: `${companyName} · ${contactPerson}님의 견적 문의가 접수되었습니다.`,
      },
      data: {
        inquiryId,
        type: "NEW_INQUIRY",
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
