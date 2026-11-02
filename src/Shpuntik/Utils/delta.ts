import type { DeltaContentType } from '@modules/Core/Data/DeltaContentType'

function toAbsoluteUrl(src: string): string {
  if (/^(https?:|data:)/.test(src)) {
    return src
  }

  return String(process.env.CDN_URL ?? '') + src
}

/**
 * Converts delta to plain text. Images are replaced with "[Изображение N]"
 * placeholders and their absolute urls are pushed into `images`.
 */
export function deltaToText(
  delta: DeltaContentType | null | undefined,
  images: string[]
): string {
  if (!delta?.ops) {
    return ''
  }

  return delta.ops
    .map((op) => {
      if (typeof op.insert === 'string') {
        return op.insert
      }

      const insert = op.insert as Record<string, unknown> | undefined

      if (typeof insert?.image === 'string') {
        images.push(toAbsoluteUrl(insert.image))
        return `[Изображение ${images.length}]`
      }

      if (typeof insert?.formula === 'string') {
        return `$${insert.formula}$`
      }

      return ''
    })
    .join('')
}
