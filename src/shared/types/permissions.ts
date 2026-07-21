import { PERMISSIONS } from "../constants/permissions/permissions";

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
