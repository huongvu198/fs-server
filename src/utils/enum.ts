export enum EApiTags {
  HEALTH_CHECK = 'health_check',
  AUTH = 'auth',
  USER = 'users',
  CUSTOMER = 'customers',
  WEBHOOK = 'webhooks',
  PRODUCT = 'products',
}

export enum EApiCmsTags {
  PRODUCT = 'products-cms',
  MASTER_DATA = 'master-data-cms',
}

export enum ERole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
  CUSTOMER = 'CUSTOMER',
}

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
