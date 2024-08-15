import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Snippet } from './Data/Snippet'
import { SnippetSchema } from './Schemes/SnippetScheme'

@ErrorConverter()
export class SnippetValidator extends Validator {
  public parseSnippet(data: unknown): Snippet {
    return this.parse(data, SnippetSchema)
  }
}
