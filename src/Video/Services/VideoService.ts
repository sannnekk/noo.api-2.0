import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Video } from '../Data/Video'
import { VideoRepository } from '../Data/VideoRepository'
import { VideoUploadBus } from './UploadBuses/VideoUploadBus'
import { YandexVideoUploadBus } from './UploadBuses/YandexVideoUploadBus'
import { User } from '@modules/Users/Data/User'
import { VideoAlreadyUploadedError } from '../Errors/VideoAlreadyUploadedError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { VideoAccessSelector } from '../Types/VideoAccessSelector'
import { CourseAssignmentRepository } from '@modules/Courses/Data/CourseAssignmentRepository'

export class VideoService {
  private readonly videoRepository: VideoRepository

  private readonly videoUploadBus: VideoUploadBus

  private readonly userRepository: UserRepository

  private readonly courseAssignmentRepository: CourseAssignmentRepository

  public constructor() {
    this.videoRepository = new VideoRepository()
    this.userRepository = new UserRepository()
    this.courseAssignmentRepository = new CourseAssignmentRepository()
    this.videoUploadBus = new YandexVideoUploadBus({
      serviceAccountKey: process.env.YANDEX_CLOUD_VIDEO_SERVICE_ACCOUNT_KEY!,
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
    const selector = await this.getVideoSelectorFromUser(userId, userRole)

    return this.videoRepository.getVideos(selector, pagination)
  }

  public async getVideo(id: string): Promise<Video> {
    const video = await this.videoRepository.findOne({ id })

    if (!video) {
      throw new NotFoundError('Видео не найдено')
    }

    return video
  }

  public async createVideo(
    video: Video,
    userId: User['id'],
    userRole: User['role']
  ): Promise<string> {
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

    currentVideo.title = video.title || currentVideo.title
    currentVideo.description = video.description || currentVideo.description

    if (userRole !== 'mentor') {
      currentVideo.accessType = video.accessType || currentVideo.accessType
      currentVideo.accessValue = video.accessValue || currentVideo.accessValue
    }

    await this.videoRepository.update(currentVideo)
  }

  public async deleteVideo(id: string, userId: User['id']): Promise<void> {
    const video = await this.videoRepository.findOne({
      id,
      uploadedBy: { id: userId },
    })

    if (!video) {
      throw new NotFoundError('Видео не найдено')
    }

    await this.videoUploadBus.deleteVideo(video.url)
    await this.videoRepository.delete(id)
  }

  private async getVideoSelectorFromUser(
    userId: User['id'],
    userRole: User['role']
  ): Promise<VideoAccessSelector[]> {
    if (userRole === 'teacher' || userRole === 'admin') {
      return []
    }

    if (userRole === 'mentor') {
      return [
        { accessType: 'mentorId', accessValue: userId },
        { accessType: 'everyone', accessValue: null },
        { accessType: 'role', accessValue: 'mentor' },
      ]
    }

    const selectors: VideoAccessSelector[] = [
      { accessType: 'everyone', accessValue: null },
      { accessType: 'role', accessValue: 'student' },
    ]

    const mentor = await this.userRepository.findOne({ id: userId })

    if (mentor) {
      selectors.push({ accessType: 'mentorId', accessValue: mentor.id })
    }

    const courseAssignments = await this.courseAssignmentRepository.findAll({
      student: { id: userId },
    })

    if (courseAssignments.length > 0) {
      const courseIds = courseAssignments.map(
        (assignment) => assignment.courseId
      )

      selectors.push(
        ...courseIds.map(
          (courseId) =>
            ({
              accessType: 'courseId',
              accessValue: courseId,
            }) as const
        )
      )
    }

    return selectors
  }
}
