import { ADVICE_STATUS } from "../types/custom.types"

export interface Advice {
  id: string
  subject: string
  topic: string
  status: ADVICE_STATUS
  advisorId: string
  studentId: string
  startDate: any
  endDate: any
  advisorRating: number
  studentRating: number
  evidencePath: string
}