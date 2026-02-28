import { Video } from '../Data/Video'

export interface VideoAccessSelector {
  accessType: Video['accessType']
  accessValue: Video['accessValue']
}
