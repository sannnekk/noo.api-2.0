import { FAQRepository } from '../Data/FAQRepository.js';
export class FAQService {
    repository;
    constructor() {
        this.repository = new FAQRepository();
    }
    async getFAQ(role) {
        return this.repository
            .queryBuilder()
            .where('for LIKE :role', { for: role })
            .orWhere('for LIKE :all', { for: 'all' })
            .orderBy('title', 'ASC')
            .getMany();
    }
    async createArticle(article) {
        return this.repository.create(article);
    }
    async updateArticle(id, article) {
        return this.repository.update({ ...article, id });
    }
    async deleteArticle(id) {
        return this.repository.delete(id);
    }
}
