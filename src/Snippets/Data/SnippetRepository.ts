import { Repository } from '@modules/Core/Data/Repository'
import { Snippet } from './Snippet'
import { SnippetModel } from './SnippetModel'

export class SnippetRepository extends Repository<Snippet> {
  public constructor() {
    super(SnippetModel)
  }
}
