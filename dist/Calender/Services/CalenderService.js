import { Service, UnauthorizedError } from '../../core/index.js';
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
        console.log('Creating events from work', work.work.name);
        if (work.solveDeadlineAt) {
            console.log('Creating solve deadline event');
            await this.createSolveDeadlineEvent(work);
        }
        if (work.checkDeadlineAt) {
            console.log('Creating check deadline event');
            await this.createCheckDeadlineEvent(work);
        }
        if (work.solvedAt) {
            console.log('Creating work made event');
            await this.createWorkMadeEvent(work);
        }
        if (work.checkedAt) {
            console.log('Creating work checked event');
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
        const a = await this.calenderEventRepository.create({
            title: 'Дедлайн по работе',
            description: `Работа: ${work.work.name}`,
            date: work.solveDeadlineAt,
            url: `/assigned-works/${work.id}/solve`,
            visibility: 'all',
            type: 'student-deadline',
            username: work.student.username,
            assignedWork: work,
        });
        console.log(a);
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
