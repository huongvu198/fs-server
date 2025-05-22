export enum AuthProvidersEnum {
  EMAIL = 'EMAIL',
  AUTH0 = 'AUTH0',
}

export enum VerifyCodeEnum {
  RESEND_CODE = 'RESEND_CODE',
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export enum MasterDataEnum {
  MASTER = 'MASTER',
}

export enum StatusEnum {
  ACTIVE = 1,
  INACTIVE = 2,
}

export enum RoleEnum {
  ADMIN = 1,
  USER = 2,
}

export enum CartItemStatusEnum {
  AVAILABLE = 'AVAILABLE',
  SOLD_OUT = 'SOLD_OUT',
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethodEnum {
  COD = 'COD',
  BANKING = 'BANKING',
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  UNPAID = 'UNPAID',
}

export enum InventoryModeEnum {
  DECREASE = 'DECREASE',
  INCREASE = 'INCREASE',
}

export enum PointModeEnum {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
}

export enum RevenueType {
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  RANGE = 'RANGE',
}

export enum SellerType {
  BEST = 'BEST',
  LEAST = 'LEAST',
}

export enum DiscountEventEnum {
  INVENTORY = 'INVENTORY',
  ALL_SHOP = 'ALL_SHOP',
  SEGMENT = 'SEGMENT',
  CATEGORY = 'CATEGORY',
  SUBCATEGORY = 'SUBCATEGORY',
}

export enum EventStatusEnum {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}
