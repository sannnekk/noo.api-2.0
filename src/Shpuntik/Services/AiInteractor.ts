import OpenAI from 'openai'
import type { AiPrompt } from './AiPromptGenerator'

export class AiInteractor {
  private openAiInstance: OpenAI

  private apiKey: string

  private apiUrl: string

  private model: string

  constructor() {
    this.apiKey = String(process.env.DEEPSEEK_API_KEY)
    this.apiUrl = process.env.OPENAI_API_URL || 'https://api.deepseek.com'
    this.model = process.env.OPENAI_MODEL || 'deepseek-v4-flash'
    this.openAiInstance = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.apiUrl,
      timeout: 15 * 60000,
    })
  }

  public async sendRequest(
    prompt: AiPrompt,
    timeout: number = 60
  ): Promise<string> {
    const completion = await this.openAiInstance.chat.completions.create(
      {
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
        model: this.model,
        response_format: { type: 'json_object' },
        stream: false,
        // deepseek-specific: disable reasoning
        ...({ thinking: { type: 'enabled' } } as object),
        ...{ reasoning_effort: 'low' },
      },
      { timeout: timeout * 1000 }
    )

    return completion.choices[0]?.message?.content ?? ''
  }
}
