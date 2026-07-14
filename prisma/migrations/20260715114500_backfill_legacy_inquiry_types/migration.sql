UPDATE "Inquiry"
SET "inquiryType" = '화물 조건 기반 적용 검토'
WHERE "inquiryType" = '일반 제품 문의'
  AND (
    "cargoType" IS NOT NULL
    OR "loadPerPallet" IS NOT NULL
    OR "requiredPalletSize" IS NOT NULL
  );
