import { Pagination } from '../../Core/Data/Pagination.js';
import { GoogleDocsBindingRepository } from '../Data/GoogleDocsBindingRepository.js';
import { GoogleDocsBindingModel } from '../Data/GoogleDocsBindingModel.js';
import { Service } from '../../Core/Services/Service.js';
export class GoogleDocsIntegrationService extends Service {
    googleDocsBindingRepository;
    constructor() {
        super();
        this.googleDocsBindingRepository = new GoogleDocsBindingRepository();
    }
    async getBindings(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = GoogleDocsBindingModel.entriesToSearch();
        const bindings = await this.googleDocsBindingRepository.find(undefined, [], pagination);
        const meta = await this.getRequestMeta(this.googleDocsBindingRepository, undefined, pagination, []);
        return {
            bindings,
            meta,
        };
    }
    async createBinding(data) {
        const binding = new GoogleDocsBindingModel({
            ...data,
            status: 'active',
        });
        await this.googleDocsBindingRepository.create(binding);
    }
    async deleteBinding(id) {
        await this.googleDocsBindingRepository.delete(id);
    }
}
