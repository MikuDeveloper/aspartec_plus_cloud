import { ROLE } from "../types/custom.types";

export interface AspartecUser {
  role: ROLE
  uid: string
  controlNumber: string
  major: string
  firstname: string
  lastname1: string
  lastname2: string
  gender: string
  phoneNumber: string
  avatarUrl: string
  adviceTaught: string
  enabled: string
}