export enum UserRoleEnum {
  USER = "USER",
  ADMIN = "ADMIN",
  OWNER = "OWNER",
}

export enum UserStatusEnum {
  ACTIVE = "ACTIVE",
  INVITED = "INVITED",
  DEACTIVATED = "DEACTIVATED",
  DELETED = "DELETED",
}

export interface IUserSettings {
  phone?: string
  avatar_url?: string
}

export interface IUserEntity {
  _id: string
  organization_id: string
  email: string
  password: string
  is_email_confirmed: boolean
  first_name: string
  last_name: string
  country: string
  role: UserRoleEnum
  status: UserStatusEnum
  settings?: IUserSettings
  updated_at: Date
  created_at: Date
}

export interface IUserCreateRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  country: string
  role: UserRoleEnum
  organization_id: string
}
