var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { VideoChapterModel } from './Relations/VideoChapterModel.js';
import { Brackets, Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, } from 'typeorm';
import { UserModel } from '../../Users/Data/UserModel.js';
import { MediaModel } from '../../Media/Data/MediaModel.js';
import { CourseMaterialModel } from '../../Courses/Data/Relations/CourseMaterialModel.js';
import { SearchableModel } from '../../Core/Data/SearchableModel.js';
import { VideoCommentModel } from './Relations/VideoCommentModel.js';
import { VideoSavingModel } from './Relations/VideoSavingModel.js';
import { VideoReactionModel } from './Relations/VideoReactionModel.js';
let VideoModel = class VideoModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.chapters) {
                this.chapters = data.chapters.map((chapter) => new VideoChapterModel(chapter));
            }
            if (data.thumbnail) {
                this.thumbnail = new MediaModel(data.thumbnail);
            }
        }
    }
    title;
    description;
    url;
    serviceType;
    uniqueIdentifier;
    duration;
    state;
    publishedAt;
    uploadUrl;
    sizeInBytes;
    accessType;
    accessValue;
    chapters;
    comments;
    uploadedBy;
    thumbnail;
    courseMaterial;
    savings;
    reactions;
    addSearchToQuery(query, needle) {
        query.andWhere(new Brackets((qb) => {
            qb.where('LOWER(video__uploadedBy.name) LIKE LOWER(:needle)', {
                needle: `%${needle}%`,
            });
            qb.orWhere('LOWER(video.title) LIKE LOWER(:needle)', {
                needle: `%${needle}%`,
            });
        }));
        return ['uploadedBy'];
    }
};
__decorate([
    Column({
        name: 'title',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", String)
], VideoModel.prototype, "title", void 0);
__decorate([
    Column({
        name: 'description',
        type: 'json',
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], VideoModel.prototype, "description", void 0);
__decorate([
    Column({
        name: 'url',
        type: 'varchar',
        length: 512,
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], VideoModel.prototype, "url", void 0);
__decorate([
    Column({
        name: 'service_type',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", Object)
], VideoModel.prototype, "serviceType", void 0);
__decorate([
    Column({
        name: 'unique_identifier',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", String)
], VideoModel.prototype, "uniqueIdentifier", void 0);
__decorate([
    Column({
        name: 'duration',
        type: 'int',
    }),
    __metadata("design:type", Number)
], VideoModel.prototype, "duration", void 0);
__decorate([
    Column({
        name: 'state',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", Object)
], VideoModel.prototype, "state", void 0);
__decorate([
    Column({
        name: 'published_at',
        type: 'timestamp',
    }),
    __metadata("design:type", Date)
], VideoModel.prototype, "publishedAt", void 0);
__decorate([
    Column({
        name: 'upload_url',
        type: 'varchar',
        length: 512,
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], VideoModel.prototype, "uploadUrl", void 0);
__decorate([
    Column({
        name: 'size_in_bytes',
        type: 'bigint',
    }),
    __metadata("design:type", Number)
], VideoModel.prototype, "sizeInBytes", void 0);
__decorate([
    Column({
        name: 'access_type',
        type: 'varchar',
        length: 255,
    }),
    __metadata("design:type", Object)
], VideoModel.prototype, "accessType", void 0);
__decorate([
    Column({
        name: 'access_value',
        type: 'varchar',
        length: 255,
        nullable: true,
        default: null,
    }),
    __metadata("design:type", Object)
], VideoModel.prototype, "accessValue", void 0);
__decorate([
    OneToMany(() => VideoChapterModel, (chapter) => chapter.video),
    __metadata("design:type", Array)
], VideoModel.prototype, "chapters", void 0);
__decorate([
    OneToMany(() => VideoCommentModel, (comment) => comment.video),
    __metadata("design:type", Array)
], VideoModel.prototype, "comments", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.uploadedVideos),
    __metadata("design:type", Object)
], VideoModel.prototype, "uploadedBy", void 0);
__decorate([
    OneToOne(() => MediaModel, (media) => media.videoAsThumbnail, {
        eager: true,
        cascade: true,
    }),
    JoinColumn(),
    __metadata("design:type", Object)
], VideoModel.prototype, "thumbnail", void 0);
__decorate([
    ManyToMany(() => CourseMaterialModel, (courseMaterial) => courseMaterial.videos),
    __metadata("design:type", Object)
], VideoModel.prototype, "courseMaterial", void 0);
__decorate([
    OneToMany(() => VideoSavingModel, (videoSaving) => videoSaving.video),
    __metadata("design:type", Array)
], VideoModel.prototype, "savings", void 0);
__decorate([
    OneToMany(() => VideoReactionModel, (videoReaction) => videoReaction.video),
    __metadata("design:type", Array)
], VideoModel.prototype, "reactions", void 0);
VideoModel = __decorate([
    Entity('video'),
    __metadata("design:paramtypes", [Object])
], VideoModel);
export { VideoModel };
