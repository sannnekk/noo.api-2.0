import bcrypt from 'bcrypt'

export async function hash(value: string): Promise<string> {
	return await bcrypt.hash(value, 10)
}

export async function compare(
	value: string,
	hash: string
): Promise<boolean> {
	return await bcrypt.compare(value, hash)
}
