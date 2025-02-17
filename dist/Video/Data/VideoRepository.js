import { Repository } from '../../Core/Data/Repository.js';
import { VideoModel } from './VideoModel.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { Brackets } from 'typeorm';
export class VideoRepository extends Repository {
    constructor() {
        super(VideoModel);
    }
    async getVideos(selectors, pagination) {
        const queryPagination = new Pagination().assign(pagination);
        const query = this.queryBuilder('video');
        const instance = new VideoModel();
        if (selectors.length > 0) {
            const accessConditionBrackets = new Brackets((qb) => {
                for (const [index, selector] of selectors.entries()) {
                    this.addAccessSelector(qb, selector, index);
                }
            });
            query.where(accessConditionBrackets);
        }
        query.andWhere('video.state = :state', { state: 'published' });
        const searchRelations = instance.addSearchToQuery(query, queryPagination.searchQuery);
        this.addRelations(query, searchRelations);
        this.addPagination(query, queryPagination);
        query.leftJoinAndSelect('video.thumbnail', 'thumbnail');
        query.leftJoinAndSelect('video.uploadedBy', 'uploadedBy');
        query.leftJoinAndSelect('uploadedBy.avatar', 'avatar');
        query.leftJoinAndSelect('avatar.media', 'media');
        const [entities, total] = await query.getManyAndCount();
        return {
            entities,
            total,
            relations: ['uploadedBy', 'thumbnail'],
        };
    }
    addAccessSelector(query, selector, postfix = 0) {
        switch (selector.accessType) {
            case 'everyone':
                query.orWhere("video.access_type = 'everyone'");
                break;
            case 'role':
                query.orWhere(new Brackets((qb) => {
                    qb.where("video.access_type = 'role'");
                    qb.andWhere(`video.access_value = :role${postfix}`, {
                        [`role${postfix}`]: selector.accessValue,
                    });
                }));
                break;
            case 'mentorId':
                query.orWhere(new Brackets((qb) => {
                    qb.where("video.access_type = 'mentorId'");
                    qb.andWhere(`video.access_value = :mentorId${postfix}`, {
                        [`mentorId${postfix}`]: selector.accessValue,
                    });
                }));
                break;
            case 'courseId':
                query.orWhere(new Brackets((qb) => {
                    qb.where("video.access_type = 'courseId'");
                    qb.andWhere(`video.access_value = :courseId${postfix}`, {
                        [`courseId${postfix}`]: selector.accessValue,
                    });
                }));
                break;
        }
    }
}
