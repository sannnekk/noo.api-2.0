var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, ManyToOne, RelationId, } from 'typeorm';
import { SearchableModel } from '../../Core/Data/SearchableModel.js';
import { config } from '../../config.js';
import { FAQCategoryModel } from './Relations/FAQCategoryModel.js';
let FAQArticleModel = class FAQArticleModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.categoryId) {
                this.category = new FAQCategoryModel({ id: data.categoryId });
            }
        }
    }
    for;
    title;
    order;
    content;
    category;
    categoryId;
    addSearchToQuery(query, needle) {
        query.andWhere('LOWER(faq_article.title) LIKE LOWER(:needle)', {
            needle: `%${needle}%`,
        });
        return [];
    }
};
__decorate([
    Column({
        type: 'simple-array',
        nullable: false,
        charset: config.database.charsets.default,
        collation: config.database.collations.default,
    }),
    __metadata("design:type", Array)
], FAQArticleModel.prototype, "for", void 0);
__decorate([
    Column({
        name: 'title',
        type: 'varchar',
        nullable: false,
        charset: config.database.charsets.withEmoji,
        collation: config.database.collations.withEmoji,
    }),
    __metadata("design:type", String)
], FAQArticleModel.prototype, "title", void 0);
__decorate([
    Column({
        name: 'order',
        type: 'int',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], FAQArticleModel.prototype, "order", void 0);
__decorate([
    Column({
        name: 'content',
        type: 'json',
        nullable: false,
    }),
    __metadata("design:type", Object)
], FAQArticleModel.prototype, "content", void 0);
__decorate([
    ManyToOne(() => FAQCategoryModel, (category) => category.articles),
    __metadata("design:type", FAQCategoryModel)
], FAQArticleModel.prototype, "category", void 0);
__decorate([
    RelationId((article) => article.category),
    __metadata("design:type", Object)
], FAQArticleModel.prototype, "categoryId", void 0);
FAQArticleModel = __decorate([
    Entity('faq_article', {
        orderBy: {
            order: 'ASC',
        },
    }),
    __metadata("design:paramtypes", [Object])
], FAQArticleModel);
export { FAQArticleModel };
