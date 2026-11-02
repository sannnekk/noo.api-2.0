import { DeltaScheme } from '../../Core/Schemas/DeltaScheme.js';
import { toDelta } from '../../Core/Utils/delta.js';
// order matters: longer markers must go first
const INLINE_TOKEN_REGEX = /(\$[^$\n]+\$|\*\*\*[^*\n]+\*\*\*|\*\*[^*\n]+\*\*|~~[^~\n]+~~|(?<![\p{L}\p{N}*])\*[^*\s][^*\n]*\*(?![\p{L}\p{N}*]))/u;
function parseBlock(line) {
    const header = line.match(/^(#{1,3})\s+(.*)$/);
    if (header) {
        return { text: header[2], attributes: { header: header[1].length } };
    }
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
        return { text: bullet[1], attributes: { list: 'bullet' } };
    }
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ordered) {
        return { text: ordered[1], attributes: { list: 'ordered' } };
    }
    return { text: line };
}
function parseInline(text) {
    return text
        .split(INLINE_TOKEN_REGEX)
        .filter((part) => part !== '')
        .map((part) => {
        if (/^\$[^$]+\$$/.test(part)) {
            return { insert: { formula: part.slice(1, -1).trim() } };
        }
        if (/^\*\*\*.+\*\*\*$/.test(part)) {
            return {
                insert: part.slice(3, -3),
                attributes: { bold: true, italic: true },
            };
        }
        if (/^\*\*.+\*\*$/.test(part)) {
            return { insert: part.slice(2, -2), attributes: { bold: true } };
        }
        if (/^~~.+~~$/.test(part)) {
            return { insert: part.slice(2, -2), attributes: { strike: true } };
        }
        if (/^\*.+\*$/.test(part)) {
            return { insert: part.slice(1, -1), attributes: { italic: true } };
        }
        return { insert: part };
    });
}
/**
 * Converts a small markdown subset (headers, lists, bold, italic,
 * strike, inline $formulas$) to quill delta.
 * Falls back to plain text if the result is not a valid delta.
 */
export function markdownToDelta(markdown) {
    const ops = [];
    const lines = markdown
        .replace(/\r\n?/g, '\n')
        .trim()
        .replace(/\n{3,}/g, '\n\n')
        .split('\n');
    for (const line of lines) {
        const block = parseBlock(line);
        ops.push(...parseInline(block.text));
        ops.push(block.attributes
            ? { insert: '\n', attributes: block.attributes }
            : { insert: '\n' });
    }
    const delta = { ops };
    if (!DeltaScheme.safeParse(delta).success) {
        return toDelta(`${markdown.trim()}\n`);
    }
    return delta;
}
