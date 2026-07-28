CREATE OR REPLACE FUNCTION "ensureInquiryCustomer"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  normalized_phone TEXT;
  normalized_email TEXT;
  normalized_company TEXT;
  linked_company_id TEXT;
  generated_customer_id TEXT;
BEGIN
  IF NEW."customerId" IS NOT NULL THEN
    RETURN NEW;
  END IF;

  normalized_phone :=
    NULLIF(REGEXP_REPLACE(COALESCE(NEW."phone", ''), '[^0-9]', '', 'g'), '');
  normalized_email :=
    NULLIF(LOWER(BTRIM(COALESCE(NEW."email", ''))), '');
  normalized_company :=
    NULLIF(
      LOWER(REGEXP_REPLACE(BTRIM(COALESCE(NEW."companyName", '')), '\s+', '', 'g')),
      ''
    );

  IF normalized_company IS NOT NULL THEN
    SELECT "id"
    INTO linked_company_id
    FROM "Company"
    WHERE "normalizedName" = normalized_company;

    IF linked_company_id IS NULL THEN
      linked_company_id :=
        'company_' || MD5(normalized_company || CLOCK_TIMESTAMP()::TEXT || RANDOM()::TEXT);

      INSERT INTO "Company" (
        "id",
        "name",
        "normalizedName",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        linked_company_id,
        NEW."companyName",
        normalized_company,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT ("normalizedName") DO NOTHING;

      SELECT "id"
      INTO linked_company_id
      FROM "Company"
      WHERE "normalizedName" = normalized_company;
    END IF;
  END IF;

  generated_customer_id :=
    'customer_' || MD5(NEW."id" || CLOCK_TIMESTAMP()::TEXT || RANDOM()::TEXT);

  INSERT INTO "Customer" (
    "id",
    "name",
    "phone",
    "normalizedPhone",
    "email",
    "normalizedEmail",
    "companyId",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    generated_customer_id,
    NEW."contactPerson",
    NEW."phone",
    normalized_phone,
    NEW."email",
    normalized_email,
    linked_company_id,
    COALESCE(NEW."createdAt", CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
  );

  INSERT INTO "CustomerDuplicateReview" (
    "id",
    "newCustomerId",
    "candidateCustomerId",
    "matchedPhone",
    "matchedEmail",
    "matchedCompany",
    "createdAt",
    "updatedAt"
  )
  SELECT
    'review_' || MD5(generated_customer_id || ':' || candidate."id"),
    generated_customer_id,
    candidate."id",
    (
      normalized_phone IS NOT NULL
      AND candidate."normalizedPhone" IS NOT NULL
      AND normalized_phone = candidate."normalizedPhone"
    ),
    (
      normalized_email IS NOT NULL
      AND candidate."normalizedEmail" IS NOT NULL
      AND normalized_email = candidate."normalizedEmail"
    ),
    (
      linked_company_id IS NOT NULL
      AND candidate."companyId" IS NOT NULL
      AND linked_company_id = candidate."companyId"
    ),
    COALESCE(NEW."createdAt", CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
  FROM "Customer" AS candidate
  WHERE candidate."id" <> generated_customer_id
    AND candidate."isArchived" = false
    AND (
      (
        normalized_phone IS NOT NULL
        AND candidate."normalizedPhone" = normalized_phone
      )
      OR (
        normalized_email IS NOT NULL
        AND candidate."normalizedEmail" = normalized_email
      )
      OR (
        linked_company_id IS NOT NULL
        AND candidate."companyId" = linked_company_id
      )
    )
  ON CONFLICT ("newCustomerId", "candidateCustomerId") DO NOTHING;

  NEW."customerId" := generated_customer_id;
  RETURN NEW;
END;
$$;
