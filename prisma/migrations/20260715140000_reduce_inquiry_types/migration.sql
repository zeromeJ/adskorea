UPDATE "Inquiry"
SET "inquiryType" = CASE
  WHEN "inquiryType" IN ('일반 제품 문의', '제품 사양 문의') THEN 'product'
  WHEN "inquiryType" = '일반 견적 요청' THEN 'quote'
  WHEN "inquiryType" IN ('화물 조건 기반 적용 검토', '주문제작 문의') THEN 'consulting'
  WHEN "inquiryType" IN ('카탈로그·자료 요청', '시험·인증 자료 문의', '파트너십·유통 문의', '기타 문의') THEN 'other'
  ELSE "inquiryType"
END
WHERE "inquiryType" IN (
  '일반 제품 문의',
  '제품 사양 문의',
  '일반 견적 요청',
  '화물 조건 기반 적용 검토',
  '주문제작 문의',
  '카탈로그·자료 요청',
  '시험·인증 자료 문의',
  '파트너십·유통 문의',
  '기타 문의'
);
