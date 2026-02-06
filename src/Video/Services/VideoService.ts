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
import { VideoSavingRepository } from '../Data/VideoSavingRepository'
import { AlreadyExistError } from '@modules/Core/Errors/AlreadyExistError'
import { VideoSavingModel } from '../Data/Relations/VideoSavingModel'
import { VideoReactionRepository } from '../Data/VideoReactionRepository'
import { VideoReaction } from '../Data/Relations/VideoReaction'
import { VideoReactionModel } from '../Data/Relations/VideoReactionModel'
import { VideoAccessInfo } from '../Types/VideoAccessInfo'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { CourseRepository } from '@modules/Courses/Data/CourseRepository'

export class VideoService {
  private readonly videoRepository: VideoRepository

  private readonly videoAccessService: VideoAccessService

  private readonly videoSavingRepository: VideoSavingRepository

  private readonly videoReactionRepository: VideoReactionRepository

  private readonly userRepository: UserRepository

  private readonly courseRepository: CourseRepository

  private readonly videoUploadBus: VideoUploadBus

  public constructor() {
    this.videoRepository = new VideoRepository()
    this.videoAccessService = new VideoAccessService()
    this.videoSavingRepository = new VideoSavingRepository()
    this.videoReactionRepository = new VideoReactionRepository()
    this.userRepository = new UserRepository()
    this.courseRepository = new CourseRepository()
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

  public async getSavedVideos(userId: User['id'], pagination: Pagination) {
    return this.videoRepository.search(
      {
        savings: { user: { id: userId } },
      },
      pagination,
      ['thumbnail', 'uploadedBy', 'uploadedBy.avatar.media']
    )
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

    video.reactionCounts = await this.videoReactionRepository.getVideoReactions(
      video.id
    )
    video.myReaction = await this.videoReactionRepository.getUserReaction(
      userId,
      video.id
    )

    return video
  }

  public async getVideoAccessInfo(
    videoId: Video['id']
  ): Promise<VideoAccessInfo> {
    const video = await this.videoRepository.findOne({ id: videoId })

    if (!video) {
      throw new NotFoundError('Видео не найдено')
    }

    if (video.accessType === 'everyone') {
      return {
        type: 'everyone',
        text: 'Доступно всем',
      }
    }

    if (video.accessType === 'role') {
      return {
        type: 'role',
        text:
          'Доступно всем с ролью ' +
          this.stringifyUserRole(video.accessValue as User['role']),
      }
    }

    if (video.accessType === 'mentorId') {
      const mentor = await this.userRepository.findOne({
        id: video.accessValue,
        role: 'mentor',
      })

      if (!mentor) {
        throw new NotFoundError('Куратор не найден')
      }

      return {
        type: 'mentorId',
        text: `Доступно куратору ${mentor.name} и всем его ученикам`,
        link: '/users/edit' + mentor.id,
        user: mentor,
      }
    }

    if (video.accessType === 'courseId') {
      const courseIds = (video.accessValue as string).split(',')
      const courses = await this.courseRepository.findAll(
        courseIds.map((id) => ({
          id,
        }))
      )

      if (!courses.length) {
        throw new NotFoundError('Курс не найден')
      }

      const courseNames = courses.map((course) => course.name).join(', ')

      return {
        type: 'courseId',
        text: `Доступно участникам курсов: ${courseNames}`,
        courses,
      }
    }

    throw new NotFoundError('Тип доступа не найден')
  }

  public async toggleReaction(
    videoId: Video['id'],
    userId: User['id'],
    reaction: VideoReaction['reaction']
  ) {
    const video = await this.videoRepository.findOne({ id: videoId })

    if (!video) {
      throw new NotFoundError('Видео не найдено')
    }

    const existingReaction = await this.videoReactionRepository.findOne({
      user: { id: userId },
      video: { id: videoId },
    })

    if (existingReaction) {
      if (existingReaction.reaction === reaction) {
        await this.videoReactionRepository.delete(existingReaction.id)
      } else {
        existingReaction.reaction = reaction
        await this.videoReactionRepository.update(existingReaction)
      }
    } else {
      await this.videoReactionRepository.create(
        new VideoReactionModel({
          video: { id: videoId } as Video,
          user: { id: userId } as User,
          reaction,
        })
      )
    }

    const newReactions =
      await this.videoReactionRepository.getVideoReactions(videoId)

    return newReactions
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

    video.publishedAt = video.publishedAt ?? new Date()

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
    currentVideo.thumbnail = video.thumbnail
    currentVideo.chapters = video.chapters || currentVideo.chapters
    currentVideo.publishedAt = video.publishedAt || currentVideo.publishedAt

    if (userRole !== 'mentor') {
      currentVideo.accessType = video.accessType || currentVideo.accessType
      currentVideo.accessValue = video.accessValue || currentVideo.accessValue
    }

    await this.videoRepository.update(currentVideo)
  }

  public async addToSaved(videoId: Video['id'], userId: User['id']) {
    const existingSaving = await this.videoSavingRepository.findOne({
      video: { id: videoId },
      user: { id: userId },
    })

    if (existingSaving) {
      throw new AlreadyExistError('Видео уже сохранено')
    }

    const video = await this.videoRepository.findOne({ id: videoId })

    if (!video) {
      throw new NotFoundError('Видео не найдено')
    }

    await this.videoSavingRepository.create(
      new VideoSavingModel({
        video: { id: videoId } as Video,
        user: { id: userId } as User,
      })
    )
  }

  public async removeFromSaved(videoId: Video['id'], userId: User['id']) {
    const existingSaving = await this.videoSavingRepository.findOne({
      video: { id: videoId },
      user: { id: userId },
    })

    if (!existingSaving) {
      throw new NotFoundError('Видео не найдено')
    }

    await this.videoSavingRepository.delete(existingSaving.id)
  }

  public async isSaved(
    videoId: Video['id'],
    userId: User['id']
  ): Promise<boolean> {
    const existingSaving = await this.videoSavingRepository.findOne({
      video: { id: videoId },
      user: { id: userId },
    })

    return !!existingSaving
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

  private stringifyUserRole(role: User['role']): string {
    switch (role) {
      case 'admin':
        return 'Администратор'
      case 'mentor':
        return 'Куратор'
      case 'student':
        return 'Ученик'
      case 'teacher':
        return 'Учитель'
      case 'assistant':
        return 'Ассистент'
    }
  }
}
