import { UserRelationService } from './UserRelationService.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { Service } from '../../Core/Services/Service.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
import { CalenderEventRepository } from '../Data/CalenderEventRepository.js';
import { CalenderEventModel } from '../Data/CalenderEventModel.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
export class CalenderService extends Service {
    calenderEventRepository;
    userRelationService;
    constructor() {
        super();
        this.calenderEventRepository = new CalenderEventRepository();
        this.userRelationService = new UserRelationService();
    }
    async create(options, username, type = 'event') {
        const event = new CalenderEventModel(options);
        event.type = type;
        event.username = username;
        return await this.calenderEventRepository.create(event);
    }
    async updateDeadlineFromWork(work, type) {
        const newDate = type === 'student-deadline' ? work.solveDeadlineAt : work.checkDeadlineAt;
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
        event.description = event.description + ' (Дедлайн сдивнут на эту дату)';
        await this.calenderEventRepository.update(event);
    }
    async get(requester, pagination) {
        if (!pagination?.getFilter('username')) {
            throw new UnauthorizedError();
        }
        const condition = await this.userRelationService.getCondition(requester, pagination?.getFilter('username'));
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
        if (!foundEvent) {
            throw new NotFoundError('Событие не найдено');
        }
        if (foundEvent.username !== username) {
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
            return this.calenderEventRepository.create(new CalenderEventModel({
                title: 'Дедлайн по проверке работы',
                description: `Работа: ${work.work.name}`,
                date: work.checkDeadlineAt,
                url: `/assigned-works/${work.id}/check`,
                visibility: 'all',
                type: 'mentor-deadline',
                username: mentor.username,
                assignedWork: work,
            }));
        }));
    }
    async createWorkMadeEvent(work) {
        await this.calenderEventRepository.create(new CalenderEventModel({
            title: 'Работа сдана',
            description: `Работа: ${work.work.name}`,
            date: work.solvedAt,
            url: `/assigned-works/${work.id}/read`,
            visibility: 'all',
            type: 'work-made',
            username: work.student.username,
            assignedWork: work,
        }));
    }
    async createWorkCheckedEvent(work) {
        await Promise.all((work.mentors || []).map((mentor) => {
            return this.calenderEventRepository.create(new CalenderEventModel({
                title: 'Работа проверена',
                description: `Работа: ${work.work.name}`,
                date: work.checkedAt,
                url: `/assigned-works/${work.id}/read`,
                visibility: 'all',
                type: 'work-checked',
                username: mentor.username,
                assignedWork: work,
            }));
        }));
    }
}
