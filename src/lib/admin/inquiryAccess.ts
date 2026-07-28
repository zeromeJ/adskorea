import type { Prisma } from "@prisma/client";

type InquiryAdmin = {
  id: string;
  isSuperAdmin: boolean;
  isAssistantAdmin: boolean;
};

export function inquiryVisibilityWhere(
  admin: InquiryAdmin,
): Prisma.InquiryWhereInput {
  return admin.isSuperAdmin || admin.isAssistantAdmin
    ? {}
    : { assignedAdminId: admin.id };
}
