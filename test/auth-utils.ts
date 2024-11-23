/* eslint-disable */
import request from 'supertest'
import app from '../src/main'
import { UserRoleType } from '../src/Core/Security/roles'

export const Users: Record<
  UserRoleType,
  {
    token: string
    id: string
    username: string
    password: string
  }
> = {
  admin: {
    token: 'token',
    id: '01J6G76JDMH0FP47FW1RDDK1CC',
    username: 'admin',
    password: 'Test1234',
  },
  teacher: {
    token: 'token',
    id: '01JD72R1PZHSX59WBRD1838VWW',
    username: 'teacher',
    password: 'Test1234',
  },
  mentor: {
    token: 'token',
    id: '01JD72RZ41E8M1Q043Y489ER76',
    username: 'mentor',
    password: 'Test1234',
  },
  student: {
    token: 'token',
    id: '01JD72SVAPB8VH5CKDFHX1AY4G',
    username: 'student',
    password: 'Test1234',
  },
}

async function auth(role: UserRoleType): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    request(app)
      .post('/auth/login')
      .send({
        usernameOrEmail: Users[role].username,
        password: Users[role].password,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          reject(err)
        } else {
          Users[role].token = res.body.data.token
          resolve()
        }
      })
  })
}

await auth('admin')
await auth('teacher')
await auth('mentor')
await auth('student')

for (const [role, user] of Object.entries(Users)) {
  if (!user.token || user.token === 'token') {
    console.error(`User ${role} has no token set`)
    process.exit(1)
  }
}

export function getToken(
  role: 'admin' | 'teacher' | 'mentor' | 'student'
): string {
  return Users[role].token
}

export function getUserId(
  role: 'admin' | 'teacher' | 'mentor' | 'student'
): string {
  return Users[role].id
}

export function getUsername(
  role: 'admin' | 'teacher' | 'mentor' | 'student'
): string {
  return Users[role].username
}
