import { Video } from '@modules/Video/Data/Video'
import { VideoUploadBus } from './VideoUploadBus'
import { YandexCloudService } from '@modules/Core/Integrations/YandexCloudService'
import { FailedToDeleteYandexVideoError } from '@modules/Video/Errors/FailedToDeleteYandexVideoError'

interface YandexVideoUploadOptions {
  serviceAccountKey: string
  channelId: string
}

export class YandexVideoUploadBus
  extends YandexCloudService
  implements VideoUploadBus
{
  private readonly channelId: string

  public constructor(options: YandexVideoUploadOptions) {
    super(options.serviceAccountKey)

    this.channelId = options.channelId
  }

  public async getUploadUrl(video: Video): Promise<{
    uniqueIdentifier: string
    uploadUrl: string
    url: string
  }> {
    const { videoId, uploadUrl, url } = await this.registerVideo(video)

    return {
      uniqueIdentifier: videoId,
      uploadUrl,
      url,
    }
  }

  public async deleteVideo(videoId: Video['uniqueIdentifier']): Promise<void> {
    const deleteResponse = await fetch(
      `https://video.api.cloud.yandex.net/video/v1/videos/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${await this.getIAMToken()}`,
        },
      }
    )

    if (!deleteResponse.ok) {
      throw new FailedToDeleteYandexVideoError(
        `Не удалось удалить видео: ${await deleteResponse.text()}`
      )
    }
  }

  private async registerVideo(video: Video): Promise<{
    videoId: string
    uploadUrl: string
    url: string
  }> {
    const registerResponse = await fetch(
      'https://video.api.cloud.yandex.net/video/v1/videos',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await this.getIAMToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel_id: this.channelId,
          title: video.title,
          tusd: {
            file_size: 0, // Если известен размер файла, укажите здесь.
            file_name: 'video.mp4',
          },
          public_access: {}, // Делаем видео общедоступным
        }),
      }
    )

    if (!registerResponse.ok) {
      throw new Error(
        `Failed to register video: ${await registerResponse.text()}`
      )
    }

    const registerData = await registerResponse.json()

    const videoId = registerData.metadata.videoId
    const uploadUrl = registerData.tusd.url
    const url = this.getVideoUrlFromId(videoId)

    return {
      videoId,
      uploadUrl,
      url,
    }
  }

  private getVideoUrlFromId(videoId: string): string {
    return `https://video.api.cloud.yandex.net/video/v1/videos/${videoId}`
  }
}
