import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { BaseModel } from '@modules/Core/Data/Model'
import { Media } from '@modules/Media/Data/Media'
import { User } from '@modules/Users/Data/User'
import { VideoChapter } from './Relations/VideoChapter'
import { VideoComment } from './Relations/VideoComment'

export interface Video extends BaseModel {
  title: string
  description: DeltaContentType
  thumbnail: Media
  url: string | null
  sizeInBytes: number
  serviceType: 'yandex'
  state: 'not-uploaded' | 'uploaded' | 'uploading' | 'failed'
  uniqueIdentifier: string
  duration: number
  chapters: VideoChapter[]
  comments: VideoComment[]
  uploadedBy: User
  uploadUrl: string | null
  publishedAt: Date
  accessType: 'everyone' | 'courseId' | 'mentorId' | 'role'
  accessValue: string | null
}
