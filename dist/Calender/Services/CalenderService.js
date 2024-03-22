import { Pagination } from '../../Core/Data/Pagination.js';
import { Service } from '../../Core/Services/Service.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
import { CalenderEventRepository } from '../Data/CalenderEventRepository.js';
export class CalenderService extends Service {
    calenderEventRepository;
    constructor() {
        super();
        this.calenderEventRepository = new CalenderEventRepository();
    }
    async create(event, username) {
        await this.calenderEventRepository.create({ ...event, username });
    }
    /* public async createFromWork(work: AssignedWork): Promise<void> {
        if (work.solveDeadlineAt) {
            await this.createSolveDeadlineEvent(work)
        }

        if (work.checkDeadlineAt) {
            await this.createCheckDeadlineEvent(work)
        }

        if (work.solvedAt) {
            await this.createWorkMadeEvent(work)
        }

        if (work.checkedAt) {
            await this.createWorkCheckedEvent(work)
        }
    } */
    async updateDeadlineFromWork(work) {
        const type = work.solveDeadlineShifted
            ? 'student-deadline'
            : 'mentor-deadline';
        const newDate = work.solveDeadlineShifted
            ? work.solveDeadlineAt
            : work.checkDeadlineAt;
        const event = await this.calenderEventRepository.findOne({
            assignedWork: {
                id: work.id,
            },
            type,
        });
        if (!event || !newDate) {
            return;
        }
        event.date = newDate;
        event.description =
            event.description + ' (Дедлайн сдивнут на эту дату)';
        await this.calenderEventRepository.update(event);
    }
    async get(username, pagination) {
        const condition = { username };
        const events = await this.calenderEventRepository.find(condition, undefined, pagination);
        const meta = await this.getRequestMeta(this.calenderEventRepository, condition, pagination || new Pagination(), []);
        return { events, meta };
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
