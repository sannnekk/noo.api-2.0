import { ULID, ulid } from 'ulidx'

export type Ulid = ULID

export function generate(): Ulid {
	return ulid()
}
