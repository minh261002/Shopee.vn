import { z } from "zod";

export const campaignSchema = z
  .object({
    name: z
      .string()
      .min(1, "Tên chiến dịch là bắt buộc")
      .max(255, "Tên chiến dịch không được quá 255 ký tự"),
    description: z.string().optional(),
    status: z.enum([
      "DRAFT",
      "PUBLISHED",
      "SCHEDULED",
      "ARCHIVED",
      "PAUSED",
      "EXPIRED",
    ]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: z.number().min(0, "Ngân sách phải lớn hơn 0").optional(),
    targetImpressions: z
      .number()
      .min(0, "Mục tiêu hiển thị phải lớn hơn 0")
      .optional(),
    targetClicks: z.number().min(0, "Mục tiêu click phải lớn hơn 0").optional(),
    targetConversions: z
      .number()
      .min(0, "Mục tiêu chuyển đổi phải lớn hơn 0")
      .optional(),
    targetRevenue: z
      .number()
      .min(0, "Mục tiêu doanh thu phải lớn hơn 0")
      .optional(),
    targetAudience: z.enum([
      "ALL_USERS",
      "NEW_USERS",
      "RETURNING_USERS",
      "PREMIUM_USERS",
      "MOBILE_USERS",
      "DESKTOP_USERS",
      "SPECIFIC_LOCATION",
      "SPECIFIC_DEVICE",
    ]),
    geographicTarget: z.enum([
      "ALL_VIETNAM",
      "NORTH_VIETNAM",
      "CENTRAL_VIETNAM",
      "SOUTH_VIETNAM",
      "HANOI",
      "HO_CHI_MINH",
      "DA_NANG",
      "SPECIFIC_CITY",
    ]),
    targetLocations: z.string().optional(),
    targetDevices: z.string().optional(),
    targetCategories: z.string().optional(),
    conditions: z.string().optional(),
    campaignType: z.enum(["FLASH_SALE", "SEASONAL", "BRAND"]).optional(),
    isFeatured: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    }
  );

export const campaignUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Tên chiến dịch là bắt buộc")
    .max(255, "Tên chiến dịch không được quá 255 ký tự")
    .optional(),
  description: z.string().optional(),
  status: z
    .enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED", "PAUSED", "EXPIRED"])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().min(0, "Ngân sách phải lớn hơn 0").optional(),
  targetImpressions: z
    .number()
    .min(0, "Mục tiêu hiển thị phải lớn hơn 0")
    .optional(),
  targetClicks: z.number().min(0, "Mục tiêu click phải lớn hơn 0").optional(),
  targetConversions: z
    .number()
    .min(0, "Mục tiêu chuyển đổi phải lớn hơn 0")
    .optional(),
  targetRevenue: z
    .number()
    .min(0, "Mục tiêu doanh thu phải lớn hơn 0")
    .optional(),
  targetAudience: z
    .enum([
      "ALL_USERS",
      "NEW_USERS",
      "RETURNING_USERS",
      "PREMIUM_USERS",
      "MOBILE_USERS",
      "DESKTOP_USERS",
      "SPECIFIC_LOCATION",
      "SPECIFIC_DEVICE",
    ])
    .optional(),
  geographicTarget: z
    .enum([
      "ALL_VIETNAM",
      "NORTH_VIETNAM",
      "CENTRAL_VIETNAM",
      "SOUTH_VIETNAM",
      "HANOI",
      "HO_CHI_MINH",
      "DA_NANG",
      "SPECIFIC_CITY",
    ])
    .optional(),
  targetLocations: z.string().optional(),
  targetDevices: z.string().optional(),
  targetCategories: z.string().optional(),
  conditions: z.string().optional(),
  campaignType: z.enum(["FLASH_SALE", "SEASONAL", "BRAND"]).optional(),
  isFeatured: z.boolean().optional(),
});

export const campaignFiltersSchema = z.object({
  status: z
    .enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED", "PAUSED", "EXPIRED"])
    .optional(),
  campaignType: z.enum(["FLASH_SALE", "SEASONAL", "BRAND"]).optional(),
  targetAudience: z
    .enum([
      "ALL_USERS",
      "NEW_USERS",
      "RETURNING_USERS",
      "PREMIUM_USERS",
      "MOBILE_USERS",
      "DESKTOP_USERS",
      "SPECIFIC_LOCATION",
      "SPECIFIC_DEVICE",
    ])
    .optional(),
  geographicTarget: z
    .enum([
      "ALL_VIETNAM",
      "NORTH_VIETNAM",
      "CENTRAL_VIETNAM",
      "SOUTH_VIETNAM",
      "HANOI",
      "HO_CHI_MINH",
      "DA_NANG",
      "SPECIFIC_CITY",
    ])
    .optional(),
  isFeatured: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;
export type CampaignUpdateFormData = z.infer<typeof campaignUpdateSchema>;
