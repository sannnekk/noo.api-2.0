import { Repository } from '../../../Core/Data/Repository.js';
import { FAQCategoryModel } from './FAQCategoryModel.js';
import TypeORM from 'typeorm';
import { FAQOptions } from '../../../FAQ/FAQOptions.js';
export class FAQCategoryRepository extends Repository {
    constructor() {
        super(FAQCategoryModel);
    }
    async getRootCategories() {
        return this.findAll({
            parentCategory: TypeORM.IsNull(),
        });
    }
    async getChildren(category) {
        return this.findAll({
            parentCategory: category,
        });
    }
    async getWholeTree() {
        return this.treeRepository().findTrees({
            depth: FAQOptions.maxCategoryDepth,
        });
    }
    async getTreeWithArticles() {
        return this.treeRepository().findTrees({
            depth: FAQOptions.maxCategoryDepth,
            relations: ['articles'],
        });
    }
}
