import { CantGetYandexIAMTokenError } from '../Errors/Integrations/CantGetYandexIAMTokenError.js';
import { createRaw } from '../Security/jwt.js';
export class YandexCloudService {
    serviceAccountKeyId;
    serviceAccountKey;
    serviceAccountId;
    iamToken;
    validUntil;
    constructor(options) {
        this.serviceAccountKey = options.serviceAccountKey.replaceAll('\\n', '\n');
        this.serviceAccountId = options.serviceAccountId;
        this.serviceAccountKeyId = options.serviceAccountKeyId;
        this.iamToken = undefined;
        this.validUntil = undefined;
    }
    async setIAMToken() {
        try {
            const url = new URL('https://iam.api.cloud.yandex.net/iam/v1/tokens');
            const payload = { jwt: this.prepareAuthPayload(url) };
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(5000),
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.status > 299 || !data?.iamToken) {
                throw new Error(data?.error || 'Не удалось получить IAM токен, попробуйте позже');
            }
            this.iamToken = data.iamToken;
            this.validUntil = new Date(data.expiresAt);
        }
        catch (error) {
            throw new CantGetYandexIAMTokenError(error.message);
        }
    }
    async getIAMToken() {
        if (!this.iamExpired() && this.iamToken) {
            return this.iamToken;
        }
        await this.setIAMToken();
        return this.iamToken;
    }
    prepareAuthPayload(url) {
        const payload = {
            aud: url.toString(),
            iss: this.serviceAccountId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 360,
        };
        const jwt = createRaw(payload, this.serviceAccountKey, {
            keyid: this.serviceAccountKeyId,
            algorithm: 'PS256',
        });
        return jwt;
    }
    iamExpired(clockskewSeconds = 60) {
        if (!this.validUntil) {
            return true;
        }
        const now = new Date();
        now.setSeconds(now.getSeconds() + clockskewSeconds);
        return now > this.validUntil;
    }
}
