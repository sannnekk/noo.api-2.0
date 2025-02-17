export type UserRolesType = [
  'student',
  'mentor',
  'teacher',
  'admin',
  'assistant',
]

type ArrayToTuple<T extends ReadonlyArray<string>, V = string> = keyof {
  [K in T extends ReadonlyArray<infer U> ? U : never]: V
}

export const UserRoles: Record<
  ArrayToTuple<UserRolesType>,
  number
> = Object.freeze({
  student: 1 << 0,
  mentor: 1 << 1,
  teacher: 1 << 2,
  admin: 1 << 3,
  assistant: 1 << 4,
})

export type UserRoleType = ArrayToTuple<UserRolesType>
