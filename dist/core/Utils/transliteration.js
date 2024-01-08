import getSlug from 'speakingurl';
export function sluggify(text) {
    return getSlug(text, { lang: 'ru' });
}
