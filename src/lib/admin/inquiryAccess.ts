import type { Prisma } from "@prisma/client";

type InquiryAdmin = {
  id: string;
  isSuperAdmin: boolean;
};

export function inquiryVisibilityWhere(
  admin: InquiryAdmin,
): Prisma.InquiryWhereInput {
  return admin.isSuperAdmin ? {} : { assignedAdminId: admin.id };
}
