import { Video } from '@modules/Video/Data/Video'
import { VideoUploadBus } from './VideoUploadBus'
import { FailedToDeleteKinescopeVideoError } from '@modules/Video/Errors/FailedToDeleteKinescopeVideoError'

export interface KinescopeVideoUploadOptions {
  apiToken: string
  parentId: string
}

export class KinescopeVideoUploadBus implements VideoUploadBus {
  private static readonly UPLOADER_HOST = 'https://uploader.kinescope.io'

  private static readonly API_HOST = 'https://api.kinescope.io'

  private readonly apiToken: string

  private readonly parentId: string

  public constructor(options: KinescopeVideoUploadOptions) {
    this.apiToken = options.apiToken
    this.parentId = options.parentId
  }

  public async getUploadUrl(video: Video): Promise<{
    uniqueIdentifier: string
    uploadUrl: string
    url: string
  }> {
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
    })

    if (!response.ok) {
      throw new Error(
        `Failed to register video in Kinescope: ${await response.text()}`
      )
    }

    const data = await response.json()

    const videoId = data?.data?.id as string | undefined
    const uploadUrl = data?.data?.endpoint as string | undefined

    if (!videoId || !uploadUrl) {
      throw new Error(
        `Unexpected Kinescope response: ${JSON.stringify(data)}`
      )
    }

    return {
      uniqueIdentifier: videoId,
      uploadUrl,
      url: this.getVideoUrlFromId(videoId),
    }
  }

  public async getVideoDuration(uniqueIdentifier: string): Promise<number> {
    const response = await fetch(
      `${KinescopeVideoUploadBus.API_HOST}/v1/videos/${uniqueIdentifier}`,
      {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    )

    if (!response.ok) {
      return 0
    }

    const data = await response.json()
    const duration = data?.data?.duration

    if (typeof duration !== 'number') {
      return 0
    }

    return Math.floor(duration)
  }

  public async deleteVideo(videoId: Video['uniqueIdentifier']): Promise<void> {
    const response = await fetch(
      `${KinescopeVideoUploadBus.API_HOST}/v1/videos/${videoId}`,
      {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000),
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new FailedToDeleteKinescopeVideoError(
        `Не удалось удалить видео: ${await response.text()}, статус: ${response.status}`
      )
    }
  }

  private getVideoUrlFromId(videoId: string): string {
    return `https://kinescope.io/${videoId}`
  }
}
