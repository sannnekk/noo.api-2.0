import { Video } from '../../Data/Video'

export interface VideoUploadBus {
  getUploadUrl(video: Video): Promise<{
    uniqueIdentifier: string
    uploadUrl: string
    url: string
  }>
  deleteVideo(videoId: Video['url']): Promise<void>
}
