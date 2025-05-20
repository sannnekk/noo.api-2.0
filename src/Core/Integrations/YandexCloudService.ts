import { CantGetYandexIAMTokenError } from '../Errors/Integrations/CantGetYandexIAMTokenError'
import { createRaw } from '../Security/jwt'

export interface YandexCloudApiOptions {
  serviceAccountKey: string
  serviceAccountKeyId: string
  serviceAccountId: string
}

export abstract class YandexCloudService {
  private readonly serviceAccountKeyId: string

  private readonly serviceAccountKey: string

  protected readonly serviceAccountId: string

  protected iamToken: string | undefined

  protected validUntil: Date | undefined

  public constructor(options: YandexCloudApiOptions) {
    this.serviceAccountKey = options.serviceAccountKey.replaceAll('\\n', '\n')
    this.serviceAccountId = options.serviceAccountId
    this.serviceAccountKeyId = options.serviceAccountKeyId

    this.iamToken = undefined
    this.validUntil = undefined
  }

  protected async setIAMToken(): Promise<void> {
    try {
      const url = new URL('https://iam.api.cloud.yandex.net/iam/v1/tokens')
      const payload = { jwt: this.prepareAuthPayload(url) }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.status > 299 || !data?.iamToken) {
        throw new Error(
          data?.error || 'Не удалось получить IAM токен, попробуйте позже'
        )
      }

      this.iamToken = data.iamToken
      this.validUntil = new Date(data.expiresAt)
    } catch (error: any) {
      throw new CantGetYandexIAMTokenError(error.message)
    }
  }

  protected async getIAMToken(): Promise<string> {
    if (!this.iamExpired() && this.iamToken) {
      return this.iamToken
    }

    await this.setIAMToken()

    return this.iamToken!
  }

  private prepareAuthPayload(url: URL): string {
    const payload = {
      aud: url.toString(),
      iss: this.serviceAccountId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 360,
    }

    const jwt = createRaw(payload, this.serviceAccountKey, {
      keyid: this.serviceAccountKeyId,
      algorithm: 'PS256',
    })

    return jwt
  }

  private iamExpired(clockskewSeconds: number = 60): boolean {
    if (!this.validUntil) {
      return true
    }

    const now = new Date()
    now.setSeconds(now.getSeconds() + clockskewSeconds)

    return now > this.validUntil
  }
}
