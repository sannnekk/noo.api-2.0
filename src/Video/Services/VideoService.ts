import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Video } from '../Data/Video'
import { VideoRepository } from '../Data/VideoRepository'
import { VideoUploadBus } from './UploadBuses/VideoUploadBus'
import { YandexVideoUploadBus } from './UploadBuses/YandexVideoUploadBus'
import { User } from '@modules/Users/Data/User'
import { VideoAlreadyUploadedError } from '../Errors/VideoAlreadyUploadedError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { VideoAccessService } from './VideoAccessService'

export class VideoService {
  private readonly videoRepository: VideoRepository

  private readonly videoAccessService: VideoAccessService

  private readonly videoUploadBus: VideoUploadBus

  public constructor() {
    this.videoRepository = new VideoRepository()
    this.videoAccessService = new VideoAccessService()
    this.videoUploadBus = new YandexVideoUploadBus({
      serviceAccountKey: process.env.YANDEX_CLOUD_VIDEO_SERVICE_ACCOUNT_KEY!,
      serviceAccountKeyId:
        process.env.YANDEX_CLOUD_VIDEO_SERVICE_ACCOUNT_KEY_ID!,
      serviceAccountId: process.env.YANDEX_CLOUD_VIDEO_SERVICE_ACCOUNT_ID!,
      channelId: process.env.YANDEX_CLOUD_CHANNEL_ID!,
    })
  }

  public async getVideos(
    pagination: Pagination,
    userId: User['id'],
    userRole: User['role']
  ): Promise<{
    entities: Video[]
    total: number
    relations: string[]
  }> {
    const selector = await this.videoAccessService.getVideoSelectorFromUser(
      userId,
      userRole
    )

    return this.videoRepository.getVideos(selector, pagination)
  }

  public async getVideo(
    id: string,
    userId: User['id'],
    userRole: User['role']
  ): Promise<Video> {
    const video = await this.videoRepository.findOne({ id }, [
      'thumbnail',
      'uploadedBy',
      'uploadedBy.avatar.media',
    ])

    if (
      !video ||
      !(await this.videoAccessService.canGetVideo(video, userId, userRole))
    ) {
      throw new NotFoundError('Видео не найдено')
    }

    if (video.duration === 0) {
      video.duration = await this.videoUploadBus.getVideoDuration(
        video.uniqueIdentifier
      )

      await this.videoRepository.update(video)
    }

    return video
  }

  public async createVideo(
    video: Video,
    userId: User['id'],
    userRole: User['role']
  ) {
    const data = await this.videoUploadBus.getUploadUrl(video)

    video.uniqueIdentifier = data.uniqueIdentifier
    video.uploadUrl = data.uploadUrl
    video.url = data.url

    video.uploadedBy = { id: userId } as User
    video.state = 'not-uploaded'

    if (userRole === 'mentor') {
      video.accessType = 'mentorId'
      video.accessValue = userId
    }

    if (!video.publishedAt) {
      video.publishedAt = new Date()
    }

    const savedVideo = await this.videoRepository.create(video)

    return {
      uploadUrl: data.uploadUrl,
      id: savedVideo.id,
    }
  }

  public async finishUpload(
    id: string,
    userId: User['id'],
    userRole: User['role']
  ): Promise<void> {
    const video = await this.videoRepository.findOne({ id })

    if (
      !video ||
      !this.videoAccessService.canEditVideo(video, userId, userRole)
    ) {
      throw new NotFoundError('Видео не найдено')
    }

    if (video.state === 'uploaded') {
      throw new VideoAlreadyUploadedError('Видео уже загружено')
    }

    video.state = 'uploaded'
    video.uploadUrl = null
    video.duration = await this.videoUploadBus.getVideoDuration(
      video.uniqueIdentifier
    )

    await this.videoRepository.update(video)
  }

  public async publishVideo(
    id: string,
    userId: User['id'],
    userRole: User['role']
  ): Promise<void> {
    const video = await this.videoRepository.findOne({ id })

    if (
      !video ||
      !this.videoAccessService.canEditVideo(video, userId, userRole)
    ) {
      throw new NotFoundError('Видео не найдено')
    }

    if (video.state !== 'uploaded') {
      throw new Error('Видео еще не загружено и не может быть опубликовано')
    }

    video.state = 'published'
    video.publishedAt = video.publishedAt || new Date()

    await this.videoRepository.update(video)
  }

  public async updateVideo(
    videoId: Video['id'],
    video: Video,
    userId: User['id'],
    userRole: User['role']
  ): Promise<void> {
    const currentVideo = await this.videoRepository.findOne({
      id: videoId,
      uploadedBy: { id: userId },
    })

    if (!currentVideo) {
      throw new NotFoundError('Видео не найдено')
    }

    if (!this.videoAccessService.canEditVideo(currentVideo, userId, userRole)) {
      throw new UnauthorizedError('Недостаточно прав для редактирования видео')
    }

    if (currentVideo.state !== 'published') {
      throw new Error('Видео не опубликовано и не может быть изменено')
    }

    currentVideo.title = video.title || currentVideo.title
    currentVideo.description = video.description || currentVideo.description

    if (userRole !== 'mentor') {
      currentVideo.accessType = video.accessType || currentVideo.accessType
      currentVideo.accessValue = video.accessValue || currentVideo.accessValue
    }

    await this.videoRepository.update(currentVideo)
  }

  public async deleteVideo(
    id: string,
    userId: User['id'],
    userRole: User['role']
  ): Promise<void> {
    const video = await this.videoRepository.findOne({
      id,
    })

    if (
      !video ||
      !this.videoAccessService.canDeleteVideo(video, userId, userRole)
    ) {
      throw new NotFoundError('Видео не найдено')
    }

    await this.videoRepository.delete(id)
    await this.videoUploadBus.deleteVideo(video.uniqueIdentifier)
  }
}
