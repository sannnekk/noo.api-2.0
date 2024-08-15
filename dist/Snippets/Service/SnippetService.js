import { SnippetRepository } from '../Data/SnippetRepository.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
export class SnippetService {
    snippetRepository;
    constructor() {
        this.snippetRepository = new SnippetRepository();
    }
    async getSnippets(userId) {
        const { entities: snippets } = await this.snippetRepository.search({
            user: { id: userId },
        });
        return snippets;
    }
    async createSnippet(snippet, userId) {
        return this.snippetRepository.create({
            ...snippet,
            user: { id: userId },
        });
    }
    async updateSnippet(snippetId, snippet, userId) {
        const existingSnippet = await this.snippetRepository.findOne({
            id: snippetId,
            user: {
                id: userId,
            },
        });
        if (!existingSnippet) {
            throw new NotFoundError('Сниппет не найден');
        }
        return this.snippetRepository.update({ ...snippet, id: snippetId });
    }
    async deleteSnippet(snippetId, userId) {
        const snippet = await this.snippetRepository.findOne({
            id: snippetId,
            user: { id: userId },
        });
        if (!snippet) {
            throw new NotFoundError('Сниппет не найден');
        }
        await this.snippetRepository.delete(snippet.id);
    }
}
