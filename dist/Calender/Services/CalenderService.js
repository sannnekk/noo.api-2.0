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
    async createFromWork(work) {
        if (work.solveDeadlineAt) {
            await this.createSolveDeadlineEvent(work);
        }
        if (work.checkDeadlineAt) {
            await this.createCheckDeadlineEvent(work);
        }
        if (work.solvedAt) {
            await this.createWorkMadeEvent(work);
        }
        if (work.checkedAt) {
            await this.createWorkCheckedEvent(work);
        }
    }
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
    async createSolveDeadlineEvent(work) {
        await this.calenderEventRepository.create({
            title: 'Дедлайн по работе',
            description: `Работа: ${work.work.name}`,
            date: work.solveDeadlineAt,
            url: `/assigned-works/${work.id}/solve`,
            visibility: 'all',
            type: 'student-deadline',
            username: work.student.username,
            assignedWork: work,
        });
    }
    async createCheckDeadlineEvent(work) {
        await Promise.all((work.mentors || []).map((mentor) => {
            return this.calenderEventRepository.create({
                title: 'Дедлайн по проверке работы',
                description: `Работа: ${work.work.name}`,
                date: work.checkDeadlineAt,
                url: `/assigned-works/${work.id}/check`,
                visibility: 'private',
                type: 'mentor-deadline',
                username: mentor.username,
                assignedWork: work,
            });
        }));
    }
    async createWorkMadeEvent(work) {
        await this.calenderEventRepository.create({
            title: 'Работа сдана',
            description: `Работа: ${work.work.name}`,
            date: work.solvedAt,
            url: `/assigned-works/${work.id}/read`,
            visibility: 'all',
            type: 'work-made',
            username: work.student.username,
            assignedWork: work,
        });
    }
    async createWorkCheckedEvent(work) {
        await Promise.all((work.mentors || []).map((mentor) => {
            return this.calenderEventRepository.create({
                title: 'Работа проверена',
                description: `Работа: ${work.work.name}`,
                date: work.checkedAt,
                url: `/assigned-works/${work.id}/read`,
                visibility: 'private',
                type: 'work-checked',
                username: mentor.username,
                assignedWork: work,
            });
        }));
    }
}
