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
    const queryPagination = new Pagination().assign(pagination)
    const query = this.queryBuilder('video')
    const instance = new VideoModel()

    if (selectors.length > 0) {
      const accessConditionBrackets = new Brackets((qb) => {
        for (const [index, selector] of selectors.entries()) {
          this.addAccessSelector(qb, selector, index)
        }
      })

      query.where(accessConditionBrackets)
    }

    query.andWhere('video.state = :state', { state: 'published' })

    const searchRelations = instance.addSearchToQuery(
      query,
      queryPagination.searchQuery
    )
    this.addRelations(query, searchRelations)
    this.addPagination(query, queryPagination)

    query.leftJoinAndSelect('video.thumbnail', 'thumbnail')
    query.leftJoinAndSelect('video.uploadedBy', 'uploadedBy')
    query.leftJoinAndSelect('uploadedBy.avatar', 'avatar')
    query.leftJoinAndSelect('avatar.media', 'media')

    const [entities, total] = await query.getManyAndCount()

    return {
      entities,
      total,
      relations: ['uploadedBy', 'thumbnail'],
    }
  }

  private addAccessSelector(
    query: WhereExpressionBuilder,
    selector: VideoAccessSelector,
    postfix: number = 0
  ): void {
    switch (selector.accessType) {
      case 'everyone':
        query.orWhere("video.access_type = 'everyone'")
        break
      case 'role':
        query.orWhere(
          new Brackets((qb) => {
            qb.where("video.access_type = 'role'")
            qb.andWhere(`video.access_value = :role${postfix}`, {
              [`role${postfix}`]: selector.accessValue,
            })
          })
        )
        break
      case 'mentorId':
        query.orWhere(
          new Brackets((qb) => {
            qb.where("video.access_type = 'mentorId'")
            qb.andWhere(`video.access_value = :mentorId${postfix}`, {
              [`mentorId${postfix}`]: selector.accessValue,
            })
          })
        )
        break
      case 'courseId':
        query.orWhere(
          new Brackets((qb) => {
            qb.where("video.access_type = 'courseId'")
            qb.andWhere(`video.access_value = :courseId${postfix}`, {
              [`courseId${postfix}`]: selector.accessValue,
            })
          })
        )
        break
    }
  }
}
