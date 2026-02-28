import { Video } from '../../Data/Video'

export interface VideoUploadBus {
  getUploadUrl(video: Video): Promise<{
    uniqueIdentifier: string
    uploadUrl: string
    url: string
  }>
  getVideoDuration(uniqueIdentifier: string): Promise<number>
  deleteVideo(videoId: Video['url']): Promise<void>
}
