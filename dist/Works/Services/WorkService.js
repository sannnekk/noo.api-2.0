import { Pagination } from '../../Core/Data/Pagination.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { WorkRepository } from '../Data/WorkRepository.js';
import { WorkModel } from '../Data/WorkModel.js';
import { CourseMaterialRepository } from '../../Courses/Data/CourseMaterialRepository.js';
import { WorkTaskRepository } from '../Data/WorkTaskRepository.js';
import { AssignedWorkRepository } from '../../AssignedWorks/Data/AssignedWorkRepository.js';
import { round } from '../../Core/Utils/math.js';
export class WorkService {
    workRepository;
    workTaskRepository;
    assignedWorkRepository;
    courseMaterialRepository;
    constructor() {
        this.workRepository = new WorkRepository();
        this.courseMaterialRepository = new CourseMaterialRepository();
        this.assignedWorkRepository = new AssignedWorkRepository();
        this.workTaskRepository = new WorkTaskRepository();
    }
    async getWorks(pagination) {
        pagination = new Pagination().assign(pagination);
        return this.workRepository.search(undefined, pagination);
    }
    async getWorkBySlug(slug) {
        const work = await this.workRepository.findOne({ slug }, ['tasks'], {
            tasks: { order: 'ASC' },
        });
        if (!work) {
            throw new NotFoundError();
        }
        return work;
    }
    async getWorkById(id) {
        const work = await this.workRepository.findOne({ id }, ['tasks'], {
            tasks: { order: 'ASC' },
        });
        if (!work) {
            throw new NotFoundError();
        }
        return work;
    }
    async getWorkStatistics(id) {
        const work = await this.getWorkById(id);
        const maxScore = await this.workTaskRepository.getWorkMaxScore(work.id);
        const hardestTaskIds = await this.workTaskRepository.getHardestTaskIds(id, 3);
        const averageWorkScore = await this.assignedWorkRepository.getAverageWorkScore(id);
        const averageWorkScorePercentage = (averageWorkScore / maxScore) * 100;
        const medianWorkScore = await this.assignedWorkRepository.getMedianWorkScore(id);
        const medianWorkScorePercentage = (medianWorkScore / maxScore) * 100;
        const workSolveCount = await this.assignedWorkRepository.getWorkSolveCount(id, false);
        return {
            hardestTaskIds,
            averageWorkScore: {
                absolute: round(averageWorkScore, 2),
                percentage: round(averageWorkScorePercentage, 2),
            },
            medianWorkScore: {
                absolute: round(medianWorkScore, 2),
                percentage: round(medianWorkScorePercentage, 2),
            },
            workSolveCount,
            work,
        };
    }
    async getWorkRelatedMaterials(id, pagination) {
        const work = await this.workRepository.findOne({ id });
        if (!work) {
            throw new NotFoundError('Работа не найдена');
        }
        return this.courseMaterialRepository.search({
            work: { id: work.id },
        }, pagination, ['chapter.course']);
    }
    async createWork(workDTO) {
        const work = new WorkModel(workDTO);
        return this.workRepository.create(work);
    }
    async copyWork(workSlug) {
        const work = await this.workRepository.findOne({ slug: workSlug }, [
            'tasks',
            'subject',
        ]);
        if (!work) {
            throw new NotFoundError('Работа не найдена');
        }
        const newWork = {
            type: work.type,
            name: `[копия] ${work.name}`,
            description: work.description,
            subject: {
                id: work.subject.id,
            },
        };
        newWork.tasks = work.tasks.map((task) => ({
            order: task.order,
            content: task.content,
            highestScore: task.highestScore,
            type: task.type,
            checkingStrategy: task.checkingStrategy,
            rightAnswer: task.rightAnswer,
            solveHint: task.solveHint,
            checkHint: task.checkHint,
            isAnswerVisibleBeforeCheck: task.isAnswerVisibleBeforeCheck,
        }));
        this.workRepository.create(newWork);
    }
    async updateWork(id, work) {
        const foundWork = await this.workRepository.findOne({ id: work.id });
        if (!foundWork) {
            throw new NotFoundError();
        }
        const newWork = new WorkModel({ ...foundWork, ...work });
        return this.workRepository.update(newWork);
    }
    async deleteWork(id) {
        const foundWork = await this.workRepository.findOne({ id });
        if (!foundWork) {
            throw new NotFoundError();
        }
        return this.workRepository.delete(id);
    }
}
