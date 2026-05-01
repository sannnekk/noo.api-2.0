import { FailedToDeleteKinescopeVideoError } from '../../../Video/Errors/FailedToDeleteKinescopeVideoError.js';
export class KinescopeVideoUploadBus {
    static UPLOADER_HOST = 'https://uploader.kinescope.io';
    static API_HOST = 'https://api.kinescope.io';
    apiToken;
    parentId;
    constructor(options) {
        this.apiToken = options.apiToken;
        this.parentId = options.parentId;
    }
    async getUploadUrl(video) {
        const response = await fetch(`${KinescopeVideoUploadBus.UPLOADER_HOST}/v2/init`, {
            method: 'POST',
            signal: AbortSignal.timeout(5000),
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'video',
                title: video.title,
                parent_id: this.parentId,
                filesize: video.sizeInBytes,
                filename: 'video.mp4',
            }),
        });
        if (!response.ok) {
            throw new Error(`Failed to register video in Kinescope: ${await response.text()}`);
        }
        const data = await response.json();
        const videoId = data?.data?.id;
        const uploadUrl = data?.data?.endpoint;
        if (!videoId || !uploadUrl) {
            throw new Error(`Unexpected Kinescope response: ${JSON.stringify(data)}`);
        }
        return {
            uniqueIdentifier: videoId,
            uploadUrl,
            url: this.getVideoUrlFromId(videoId),
        };
    }
    async getVideoDuration(uniqueIdentifier) {
        const response = await fetch(`${KinescopeVideoUploadBus.API_HOST}/v1/videos/${uniqueIdentifier}`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000),
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
            },
        });
        if (!response.ok) {
            return 0;
        }
        const data = await response.json();
        const duration = data?.data?.duration;
        if (typeof duration !== 'number') {
            return 0;
        }
        return Math.floor(duration);
    }
    async deleteVideo(videoId) {
        const response = await fetch(`${KinescopeVideoUploadBus.API_HOST}/v1/videos/${videoId}`, {
            method: 'DELETE',
            signal: AbortSignal.timeout(5000),
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
            },
        });
        if (!response.ok) {
            throw new FailedToDeleteKinescopeVideoError(`Не удалось удалить видео: ${await response.text()}, статус: ${response.status}`);
        }
    }
    getVideoUrlFromId(videoId) {
        return `https://kinescope.io/${videoId}`;
    }
}
