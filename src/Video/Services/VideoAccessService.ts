import { VideoRepository } from '../Data/VideoRepository'

export class VideoAccessService {
  private readonly videoRepository: VideoRepository

  public constructor() {
    this.videoRepository = new VideoRepository()
  }

  public async canWatchVideo(
    videoId: string,
    userId: string
  ): Promise<boolean> {
    const video = await this.videoRepository.findOne({ id: videoId })

    if (!video) {
      return false
    }

    switch (video.accessType) {
      case 'everyone':
        return true
      case 'role':
        return false // TODO: Implement role-based access
      case 'mentorId':
        return false // TODO: Implement mentor-based access
    }

    return false
  }
}
