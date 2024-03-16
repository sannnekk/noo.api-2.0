import { Service, UnauthorizedError } from '@core';
import { CalenderEventRepository } from '../Data/CalenderEventRepository';
export class CalenderService extends Service {
    calenderEventRepository;
    constructor() {
        super();
        this.calenderEventRepository = new CalenderEventRepository();
    }
    async create(event, username) {
        await this.calenderEventRepository.create({ ...event, username });
    }
    async get(username, pagination) {
        const events = this.calenderEventRepository.find({
            username,
        }, undefined, pagination);
        this.storeRequestMeta(this.calenderEventRepository, undefined, undefined, pagination);
        return events;
    }
    async getOne(id, username) {
        const event = await this.calenderEventRepository.findOne({ id });
        if (event && event?.username !== username) {
            throw new UnauthorizedError();
        }
        return event;
    }
    async update(id, event, username) {
        const foundEvent = await this.calenderEventRepository.findOne({
            id,
        });
        if (foundEvent && foundEvent?.username !== username) {
            throw new UnauthorizedError();
        }
        await this.calenderEventRepository.update({ ...event, id });
    }
    async delete(id, username) {
        const foundEvent = await this.calenderEventRepository.findOne({
            id,
        });
        if (foundEvent && foundEvent?.username !== username) {
            throw new UnauthorizedError();
        }
        await this.calenderEventRepository.delete(id);
    }
}
