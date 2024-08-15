import { User } from '@modules/Users/Data/User'
import { Snippet } from '../Data/Snippet'
import { SnippetRepository } from '../Data/SnippetRepository'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'

export class SnippetService {
  public readonly snippetRepository: SnippetRepository

  public constructor() {
    this.snippetRepository = new SnippetRepository()
  }

  public async getSnippets(userId: string): Promise<Snippet[]> {
    const { entities: snippets } = await this.snippetRepository.search({
      user: { id: userId },
    })

    return snippets
  }

  public async createSnippet(
    snippet: Snippet,
    userId: User['id']
  ): Promise<Snippet> {
    return this.snippetRepository.create({
      ...snippet,
      user: { id: userId } as User,
    })
  }

  public async updateSnippet(
    snippetId: Snippet['id'],
    snippet: Snippet,
    userId: User['id']
  ): Promise<Snippet> {
    const existingSnippet = await this.snippetRepository.findOne({
      id: snippetId,
      user: {
        id: userId,
      },
    })

    if (!existingSnippet) {
      throw new NotFoundError('Сниппет не найден')
    }

    return this.snippetRepository.update({ ...snippet, id: snippetId })
  }

  public async deleteSnippet(
    snippetId: Snippet['id'],
    userId: User['id']
  ): Promise<void> {
    const snippet = await this.snippetRepository.findOne({
      id: snippetId,
      user: { id: userId },
    })

    if (!snippet) {
      throw new NotFoundError('Сниппет не найден')
    }

    await this.snippetRepository.delete(snippet.id)
  }
}
