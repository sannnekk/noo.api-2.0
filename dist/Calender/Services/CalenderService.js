import { Service } from '../../core/index.js';
import { CalenderEventRepository } from '../Data/CalenderEventRepository.js';
export class CalenderService extends Service {
    calenderEventRepository;
    constructor() {
        super();
        this.calenderEventRepository = new CalenderEventRepository();
    }
    async create(event) {
        await this.calenderEventRepository.create(event);
    }
    async get(pagination) {
        const events = this.calenderEventRepository.find(undefined, undefined, pagination);
        this.storeRequestMeta(this.calenderEventRepository, undefined, undefined, pagination);
        return events;
    }
    async getOne(id) {
        return this.calenderEventRepository.findOne({ id });
    }
    async update(id, event) {
        await this.calenderEventRepository.update({ ...event, id });
    }
}
