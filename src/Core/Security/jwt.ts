import jwtlib from 'jsonwebtoken'
import { type ULID } from 'ulidx'
import { type UserRoleType } from './roles'

export interface JWTPayload extends jwtlib.JwtPayload {
  username: string
  userId: ULID
  sessionId: ULID
  role: UserRoleType
  permissions: number
  isBlocked: boolean
}

export type JWT = string

export function parse(jwt: string): JWTPayload | undefined {
  try {
    return jwtlib.verify(jwt, process.env.JWT_SECRET!) as unknown as JWTPayload
  } catch (err) {
    return undefined
  }
}

export function parseHeader(header: string): JWTPayload | undefined {
  const [type, jwt] = header.split(' ')

  if (type !== 'Bearer') {
    return undefined
  }

  return parse(jwt)
}

export function create(payload: JWTPayload): JWT {
  return jwtlib.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

export function createRaw(
  payload: Record<string, any>,
  key: string,
  options: jwtlib.SignOptions
): JWT {
  return jwtlib.sign(payload, key, options)
}
