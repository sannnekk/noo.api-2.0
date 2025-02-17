import { YandexCloudService, } from '../../../Core/Integrations/YandexCloudService.js';
import { FailedToDeleteYandexVideoError } from '../../../Video/Errors/FailedToDeleteYandexVideoError.js';
import { v4 as uuid } from 'uuid';
export class YandexVideoUploadBus extends YandexCloudService {
    channelId;
    constructor(options) {
        super(options);
        this.channelId = options.channelId;
    }
    async getUploadUrl(video) {
        const { videoId, uploadUrl, url } = await this.registerVideo(video);
        return {
            uniqueIdentifier: videoId,
            uploadUrl,
            url,
        };
    }
    async getVideoDuration(uniqueIdentifier) {
        const videoResponse = await fetch(`https://video.api.cloud.yandex.net/video/v1/videos/${uniqueIdentifier}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${await this.getIAMToken()}`,
            },
        });
        if (!videoResponse.ok) {
            return 0;
        }
        const videoData = await videoResponse.json();
        if (!videoData.duration) {
            return 0;
        }
        // it is now in 23.488s format, converting it to seconds
        return this.parseDuration(videoData.duration);
    }
    async deleteVideo(videoId) {
        const deleteResponse = await fetch(`https://video.api.cloud.yandex.net/video/v1/videos/${videoId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${await this.getIAMToken()}`,
            },
        });
        if (!deleteResponse.ok) {
            throw new FailedToDeleteYandexVideoError(`Не удалось удалить видео: ${await deleteResponse.text()}, статус: ${deleteResponse.status}`);
        }
    }
    async registerVideo(video) {
        const request = {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${await this.getIAMToken()}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel_id: this.channelId,
                title: video.title,
                tusd: {
                    file_size: video.sizeInBytes, // Если известен размер файла, укажите здесь.
                    file_name: `${uuid()}.mp4`,
                },
                public_access: {}, // Делаем видео общедоступным
            }),
        };
        const registerResponse = await fetch('https://video.api.cloud.yandex.net/video/v1/videos', request);
        if (!registerResponse.ok) {
            throw new Error(`Failed to register video: ${await registerResponse.text()}`);
        }
        const registerData = await registerResponse.json();
        const videoId = registerData.metadata.videoId;
        const uploadUrl = registerData.response.tusd.url;
        const url = this.getVideoUrlFromId(videoId);
        return {
            videoId,
            uploadUrl,
            url,
        };
    }
    getVideoUrlFromId(videoId) {
        return `https://runtime.video.cloud.yandex.net/player/video/${videoId}`;
    }
    /**
     * Parses a duration string (e.g. "23.488s", "2.5m", "1h") and returns the number of seconds as an integer.
     *
     * @param durationStr - The duration string from the server.
     * @returns The duration in seconds as an integer.
     * @throws Will throw an error if the format or unit is not recognized.
     */
    parseDuration(durationStr) {
        // Trim the string and use a regex to extract the numeric part and unit.
        const trimmed = durationStr.trim();
        const match = trimmed.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
        if (!match) {
            throw new Error(`Invalid duration format: "${durationStr}"`);
        }
        // Use parseFloat to correctly interpret the decimal point.
        const value = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        let seconds = 0;
        // Convert based on the unit. Extend the cases as needed.
        switch (unit) {
            case 's':
            case 'sec':
            case 'secs':
            case 'second':
            case 'seconds':
                seconds = value;
                break;
            case 'ms':
            case 'msec':
            case 'msecs':
            case 'millisecond':
            case 'milliseconds':
                seconds = value / 1000;
                break;
            case 'm':
            case 'min':
            case 'mins':
            case 'minute':
            case 'minutes':
                seconds = value * 60;
                break;
            case 'h':
            case 'hr':
            case 'hrs':
            case 'hour':
            case 'hours':
                seconds = value * 3600;
                break;
            default:
                throw new Error(`Unknown time unit: "${unit}" in duration "${durationStr}"`);
        }
        // Return the integer number of seconds (using Math.floor to drop fractional seconds).
        return Math.floor(seconds);
    }
}
