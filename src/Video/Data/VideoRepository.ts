import { Repository } from '@modules/Core/Data/Repository'
import { VideoModel } from './VideoModel'
import type { Video } from './Video'
import { Pagination } from '@modules/Core/Data/Pagination'
import { VideoAccessSelector } from '../Types/VideoAccessSelector'
import { Brackets, WhereExpressionBuilder } from 'typeorm'

export class VideoRepository extends Repository<Video> {
  public constructor() {
    super(VideoModel)
  }

  public async getVideos(
    selectors: VideoAccessSelector[],
    pagination: Pagination
  ): Promise<{
    entities: Video[]
    total: number
    relations: string[]
  }> {
    const query = this.queryBuilder('video')

    this.addPagination(query, pagination)

    const accessConditionBrackets = new Brackets((qb) => {
      for (const selector of selectors) {
        this.addAccessSelector(qb, selector)
      }
    })

    query.andWhere(accessConditionBrackets)
    query.leftJoinAndSelect('video.thumbnail', 'thumbnail')

    const [entities, total] = await query.getManyAndCount()

    return {
      entities,
      total,
      relations: ['uploadedBy', 'thumbnail'],
    }
  }

  private addAccessSelector(
    query: WhereExpressionBuilder,
    selector: VideoAccessSelector
  ): void {
    switch (selector.accessType) {
      case 'everyone':
        query.orWhere('video.access_type = :accessType', {
          accessType: 'everyone',
        })
        break
      case 'role':
        query.orWhere(
          new Brackets((qb) => {
            qb.andWhere('video.access_type = :accessType', {
              accessType: 'role',
            })
            qb.andWhere('video.access_role = :accessRole', {
              accessRole: selector.accessValue,
            })
          })
        )
        break
      case 'mentorId':
        query.orWhere(
          new Brackets((qb) => {
            qb.andWhere('video.access_type = :accessType', {
              accessType: 'mentorId',
            })
            qb.andWhere('video.access_value = :accessValue', {
              accessValue: selector.accessValue,
            })
          })
        )
        break
      case 'courseId':
        query.orWhere(
          new Brackets((qb) => {
            qb.andWhere('video.access_type = :accessType', {
              accessType: 'courseId',
            })
            qb.andWhere('video.access_value = :accessValue', {
              accessValue: selector.accessValue,
            })
          })
        )
        break
    }
  }
}
