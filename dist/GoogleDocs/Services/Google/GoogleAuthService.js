import { NoGoogleAuthCredentialsProvidedError } from '../../../GoogleDocs/Errors/NoGoogleAuthCredentialsProvidedError.js';
import { OAuth2Client } from 'google-auth-library';
export class GoogleAuthService {
    clientId;
    clientSecret;
    constructor() {
        this.clientId = process.env.GOOGLE_CLIENT_ID;
        this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    }
    /**
     * Get tokens payload from google id token
     *
     * @param idToken google id token
     * @returns tokens payload
     */
    async getAuthDataFromIdToken(idToken) {
        const client = new OAuth2Client(this.clientId, this.clientSecret);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: this.clientId,
        });
        return ticket.getPayload();
    }
    /**
     * Get tokens from google auth code or refresh token
     *
     * @param googleAuthCode google auth token
     * @param refreshToken google refresh token
     * @returns access and refresh tokens
     */
    async getTokens(googleAuthCode, refreshToken) {
        if (googleAuthCode) {
            return this.exchangeCodeForTokens(googleAuthCode);
        }
        if (refreshToken) {
            return this.reissueRefreshToken(refreshToken);
        }
        throw new NoGoogleAuthCredentialsProvidedError();
    }
    async getAuthObject(googleAuthCode, refreshToken) {
        const tokens = await this.getTokens(googleAuthCode, refreshToken);
        const client = new OAuth2Client(this.clientId, this.clientSecret);
        client.setCredentials(tokens);
        return client;
    }
    /**
     * Method to get google access and refresh token from google auth code
     *
     * @param code Google auth code
     * @returns Google auth response
     */
    async exchangeCodeForTokens(code) {
        const body = {
            grant_type: 'authorization_code',
            redirect_uri: 'postmessage',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
        };
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            return (await response.json());
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Method to get google access and refresh token from google refresh token
     *
     * @param refreshToken google refresh token
     * @returns Google auth response
     */
    async reissueRefreshToken(refreshToken) {
        const body = {
            grant_type: 'refresh_token',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            refresh_token: refreshToken,
        };
        try {
            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    //Authorization: `Basic ${basicAuthStr}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            return (await response.json());
        }
        catch (error) {
            throw error;
        }
    }
}
