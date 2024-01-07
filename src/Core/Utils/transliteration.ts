import getSlug from 'speakingurl'

export function sluggify(text: string): string {
	return getSlug(text, { lang: 'ru' })
}
