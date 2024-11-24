import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Video } from '../Data/Video'
import { VideoRepository } from '../Data/VideoRepository'
import { VideoUploadBus } from './UploadBuses/VideoUploadBus'
import { YandexVideoUploadBus } from './UploadBuses/YandexVideoUploadBus'
import { User } from '@modules/Users/Data/User'
import { VideoAlreadyUploadedError } from '../Errors/VideoAlreadyUploadedError'

export class VideoService {
  private readonly videoRepository: VideoRepository

  private readonly videoUploadBus: VideoUploadBus

  public constructor() {
    this.videoRepository = new VideoRepository()
    this.videoUploadBus = new YandexVideoUploadBus({
      serviceAccountKey: process.env.YANDEX_CLOUD_VIDEO_SERVICE_ACCOUNT_KEY!,
      channelId: process.env.YANDEX_CLOUD_CHANNEL_ID!,
    })
  }

  public async getVideo(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({ id })

    if (!video) {
      throw new NotFoundError('Видео не найдено')
    }

    return video
  }

  public async createVideo(video: Video, userId: User['id']): Promise<string> {
    const data = await this.videoUploadBus.getUploadUrl(video)

    video.uniqueIdentifier = data.uniqueIdentifier
    video.uploadUrl = data.uploadUrl
    video.url = data.url

    video.uploadedBy = { id: userId } as User
    video.state = 'not-uploaded'

    await this.videoRepository.create(video)

    return data.uploadUrl
  }

  public async finishUpload(id: string): Promise<void> {
    const video = await this.videoRepository.findOne({ id })

    if (!video) {
      throw new NotFoundError('Видео не найдено')
    }

    if (video.state === 'uploaded') {
      throw new VideoAlreadyUploadedError('Видео уже загружено')
    }

    video.state = 'uploaded'
    video.uploadUrl = null
    video.publishedAt = video.publishedAt || new Date()

    await this.videoRepository.update(video)
  }

  public async deleteVideo(id: string): Promise<void> {
    const video = await this.videoRepository.findOne({ id })

    if (!video) {
      throw new NotFoundError('Видео не найдено')
    }

    await this.videoUploadBus.deleteVideo(video.url)
    await this.videoRepository.delete(id)
  }
}
