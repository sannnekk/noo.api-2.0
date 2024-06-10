import bcrypt from 'bcrypt'

export async function hash(value: string): Promise<string> {
  return bcrypt.hash(value, 10)
}

export async function compare(
  value: string,
  hashStr: string
): Promise<boolean> {
  return bcrypt.compare(value, hashStr)
}
