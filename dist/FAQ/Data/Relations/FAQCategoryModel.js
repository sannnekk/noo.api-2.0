var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FAQCategoryModel_1;
import { Column, Entity, OneToMany, RelationId, Tree, TreeChildren, TreeParent, } from 'typeorm';
import { FAQArticleModel } from '../FAQArticleModel.js';
import { SearchableModel } from '../../../Core/Data/SearchableModel.js';
let FAQCategoryModel = FAQCategoryModel_1 = class FAQCategoryModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
            if (data.parentCategoryId) {
                this.parentCategory = new FAQCategoryModel_1({
                    id: data.parentCategoryId,
                });
            }
            if (data.childCategories) {
                this.childCategories = data.childCategories.map((category) => new FAQCategoryModel_1(category));
            }
            if (data.articles) {
                this.articles = data.articles.map((article) => new FAQArticleModel(article));
            }
        }
    }
    name;
    order;
    childCategories;
    parentCategory;
    parentCategoryId;
    articles;
    addSearchToQuery(query, needle) {
        query.andWhere('LOWER(faq_category.name) LIKE LOWER(:needle)', {
            needle: `%${needle}%`,
        });
        return [];
    }
};
__decorate([
    Column({
        name: 'name',
        type: 'varchar',
        nullable: false,
        length: 255,
    }),
    __metadata("design:type", String)
], FAQCategoryModel.prototype, "name", void 0);
__decorate([
    Column({
        name: 'order',
        type: 'int',
        nullable: false,
        default: 0,
    }),
    __metadata("design:type", Number)
], FAQCategoryModel.prototype, "order", void 0);
__decorate([
    TreeChildren(),
    __metadata("design:type", Array)
], FAQCategoryModel.prototype, "childCategories", void 0);
__decorate([
    TreeParent(),
    __metadata("design:type", Object)
], FAQCategoryModel.prototype, "parentCategory", void 0);
__decorate([
    RelationId((category) => category.parentCategory),
    __metadata("design:type", String)
], FAQCategoryModel.prototype, "parentCategoryId", void 0);
__decorate([
    OneToMany(() => FAQArticleModel, (article) => article.category),
    __metadata("design:type", Array)
], FAQCategoryModel.prototype, "articles", void 0);
FAQCategoryModel = FAQCategoryModel_1 = __decorate([
    Entity('faq_category', {
        orderBy: {
            order: 'ASC',
        },
    }),
    Tree('closure-table', {
        ancestorColumnName: () => 'ancestorId',
        descendantColumnName: () => 'descendantId',
    }),
    __metadata("design:paramtypes", [Object])
], FAQCategoryModel);
export { FAQCategoryModel };
