import { axios } from "../config"
import { AxiosResponse } from "axios"
import { IUserEntity, IUserLegalRequest, IUserUpdateRequest } from "../types"

export const getUserHandler = async (): Promise<IUserEntity | null> => {
  try {
    const response: AxiosResponse = await axios({
      url: "/api/user",
      method: "GET",
    })

    const { data }: { data: IUserEntity | null } = response

    return data
  } catch (error: unknown) {
    throw error
  }
}

export const patchUserHandler = async (payload: IUserUpdateRequest): Promise<IUserEntity | null> => {
  try {
    const response: AxiosResponse = await axios({
      url: "/api/user",
      method: "PATCH",
      data: {
        ...payload,
      },
    })

    const { data }: { data: IUserEntity | null } = response

    return data
  } catch (error: unknown) {
    throw error
  }
}

export const acceptUserPolicies = async (payload: IUserLegalRequest): Promise<IUserEntity | null> => {
  try {
    const response: AxiosResponse = await axios({
      url: "/api/user/accept-policies",
      method: "PATCH",
      data: {
        ...payload,
      },
    })

    const { data }: { data: IUserEntity | null } = response

    return data
  } catch (error: unknown) {
    throw error
  }
}
