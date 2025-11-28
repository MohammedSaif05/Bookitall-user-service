export const USER_TYPES = ["vendor", "customer"] as const;
export type UserType = (typeof USER_TYPES)[number];
