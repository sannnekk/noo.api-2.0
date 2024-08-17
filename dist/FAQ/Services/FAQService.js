import { FAQRepository } from '../Data/FAQRepository.js';
import { FAQCategoryRepository } from '../Data/Relations/FAQCategoryRepository.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { FAQOptions } from '../FAQOptions.js';
import { CategoryTooDeepError } from '../Errors/CategoryTooDeepError.js';
export class FAQService {
    articleRepository;
    categoryRepository;
    constructor() {
        this.articleRepository = new FAQRepository();
        this.categoryRepository = new FAQCategoryRepository();
    }
    async getArticles(role, pagination) {
        return this.articleRepository.search([
            {
                for: role,
            },
            {
                for: 'all',
            },
        ], pagination, ['category']);
    }
    async getArticle(id, role) {
        const article = await this.articleRepository.findOne({ id });
        if (!article) {
            throw new NotFoundError('Статья не найдена');
        }
        if (!article.for.includes(role) && !article.for.includes('all')) {
            throw new NotFoundError('Статья не найдена');
        }
        return article;
    }
    async searchCategories(pagination) {
        return this.categoryRepository.search(undefined, pagination);
    }
    async getCategoryTree() {
        return this.categoryRepository.getWholeTree();
    }
    // TODO: add role filtering
    async getTreeWithArticles( /* role: User['role'] */) {
        return this.categoryRepository.getTreeWithArticles();
    }
    async createArticle(article) {
        return this.articleRepository.create(article);
    }
    async createCategory(category) {
        await this.ensureCategoryDepth(category);
        return this.categoryRepository.create(category);
    }
    async updateArticle(id, article) {
        return this.articleRepository.update({ ...article, id });
    }
    async updateCategory(id, category) {
        return this.categoryRepository.update({ ...category, id });
    }
    async deleteArticle(id) {
        return this.articleRepository.delete(id);
    }
    async deleteCategory(id) {
        return this.categoryRepository.delete(id);
    }
    async ensureCategoryDepth(category, nesting = 1) {
        if (nesting > FAQOptions.maxCategoryDepth) {
            throw new CategoryTooDeepError();
        }
        if (!category.parentCategory) {
            return;
        }
        const parentCategory = await this.categoryRepository.findOne({
            id: category.parentCategory.id,
        }, ['parentCategory']);
        if (parentCategory) {
            await this.ensureCategoryDepth(parentCategory, nesting + 1);
        }
    }
    /**
     * Recursive function to filter the tree of categories and articles
     * based on the user's role
     */
    filterTree(tree, role) {
        return tree.map((category) => {
            const childCategories = this.filterTree(category.childCategories || [], role);
            return {
                ...category,
                articles: (category.articles || []).filter((article) => article.for.includes(role) || article.for.includes('all')),
                childCategories,
            };
        });
    }
}
