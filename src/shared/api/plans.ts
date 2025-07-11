import { axios } from "../config"
import { AxiosResponse } from "axios"
import { IPlanEntity } from "../types"

export const getPublicPlanListHandler = async (): Promise<IPlanEntity[]> => {
  try {
    const response: AxiosResponse = await axios({
      url: "/api/plan",
      method: "GET",
    })

    const { data }: { data: IPlanEntity[] } = response

    return data
  } catch (error: unknown) {
    throw error
  }
}

export const getPlanByIdHandler = async (plan_id: string): Promise<IPlanEntity | null> => {
  try {
    const response: AxiosResponse = await axios({
      url: `/api/plan/${plan_id}`,
      method: "GET",
    })

    const { data }: { data: IPlanEntity | null } = response

    return data
  } catch (error: unknown) {
    throw error
  }
}
