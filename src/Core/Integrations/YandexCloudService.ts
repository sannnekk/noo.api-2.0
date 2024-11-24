import { CantGetYandexIAMTokenError } from '../Errors/Integrations/CantGetYandexIAMTokenError'

export abstract class YandexCloudService {
  protected readonly serviceAccountKey: string

  protected iamToken: string | undefined

  public constructor(serviceAccountKey: string) {
    this.serviceAccountKey = serviceAccountKey
    this.iamToken = undefined
  }

  protected async setIAMToken(): Promise<void> {
    const url = 'https://iam.api.cloud.yandex.net/iam/v1/tokens'

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const body = {
      yandexPassportOauthToken: this.serviceAccountKey,
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.status > 299 || !data?.iamToken) {
        throw new Error(data?.error || 'Не удалось получить IAM токен')
      }

      this.iamToken = data.iamToken
    } catch (error: any) {
      throw new CantGetYandexIAMTokenError(error.message)
    }
  }

  protected async getIAMToken(): Promise<string> {
    if (!this.iamToken) {
      await this.setIAMToken()
    }

    return this.iamToken as string
  }
}
