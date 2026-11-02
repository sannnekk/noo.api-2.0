import OpenAI from 'openai';
export class AiInteractor {
    openAiInstance;
    apiKey;
    apiUrl;
    model;
    constructor() {
        this.apiKey = String(process.env.DEEPSEEK_API_KEY);
        this.apiUrl = process.env.OPENAI_API_URL || 'https://api.deepseek.com';
        this.model = process.env.OPENAI_MODEL || 'deepseek-v4-flash';
        this.openAiInstance = new OpenAI({
            apiKey: this.apiKey,
            baseURL: this.apiUrl,
            timeout: 15 * 60000,
        });
    }
    async sendRequest(prompt, timeout = 60) {
        const completion = await this.openAiInstance.chat.completions.create({
            messages: [
                { role: 'system', content: prompt.system },
                { role: 'user', content: prompt.user },
            ],
            model: this.model,
            response_format: { type: 'json_object' },
            stream: false,
            // deepseek-specific: disable reasoning
            ...{ thinking: { type: 'enabled' } },
            ...{ reasoning_effort: 'low' },
        }, { timeout: timeout * 1000 });
        return completion.choices[0]?.message?.content ?? '';
    }
}
