export interface RequestInfo {
  userAgent: string
  isMobile: boolean
  isApp: boolean
  ipAddress: string
  browser?: string | null
  os?: string | null
  device?: string | null
  location?: string | null
}
