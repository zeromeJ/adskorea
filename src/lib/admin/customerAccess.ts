import type { Prisma } from "@prisma/client";
import { canManageInquiries, type AdminPermissions } from "@/lib/admin/auth";

type CustomerAdmin = AdminPermissions & {
  id: string;
};

export function customerVisibilityWhere(
  admin: CustomerAdmin,
): Prisma.CustomerWhereInput {
  return canManageInquiries(admin)
    ? { isArchived: false }
    : {
        isArchived: false,
        inquiries: {
          some: { assignedAdminId: admin.id },
        },
      };
}

export function companyVisibilityWhere(
  admin: CustomerAdmin,
): Prisma.CompanyWhereInput {
  return canManageInquiries(admin)
    ? {}
    : {
        customers: {
          some: {
            inquiries: {
              some: { assignedAdminId: admin.id },
            },
          },
        },
      };
}

export function visibleInquiryWhere(admin: CustomerAdmin) {
  return canManageInquiries(admin) ? {} : { assignedAdminId: admin.id };
}
