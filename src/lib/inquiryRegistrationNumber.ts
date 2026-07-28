import type { Prisma } from "@prisma/client";

export async function createInquiryRegistrationNumber(
  tx: Prisma.TransactionClient,
) {
  const [result] = await tx.$queryRaw<
    Array<{ datePart: string; sequenceValue: bigint }>
  >`
    SELECT
      TO_CHAR(
        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Seoul',
        'YYMMDD'
      ) AS "datePart",
      NEXTVAL('"Inquiry_registrationNumber_seq"') AS "sequenceValue"
  `;

  return `${result.datePart}${result.sequenceValue
    .toString()
    .padStart(4, "0")}`;
}
