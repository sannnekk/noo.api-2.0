import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { Service } from '../../Core/Services/Service.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
import { AssignedWorkRepository } from '../Data/AssignedWorkRepository.js';
import { AssignedWorkModel } from '../Data/AssignedWorkModel.js';
import { WorkAlreadySolvedError } from '../Errors/WorkAlreadySolvedError.js';
import { WorkAlreadyCheckedError } from '../Errors/WorkAlreadyCheckedError.js';
import { WorkIsNotSolvedYetError } from '../Errors/WorkIsNotSolvedYetError.js';
import { WorkAlreadyAssignedToThisMentorError } from '../Errors/WorkAlreadyAssignedToThisMentorError.js';
import { WorkAlreadyAssignedToEnoughMentorsError } from '../Errors/WorkAlreadyAssignedToEnoughMentorsError.js';
import { SolveDeadlineNotSetError } from '../Errors/SolveDeadlineNotSetError.js';
import { CheckDeadlineNotSetError } from '../Errors/CheckDeadlineNotSetError.js';
import { UserRepository } from '../../Users/Data/UserRepository.js';
import { WorkRepository } from '../../Works/Data/WorkRepository.js';
import { DeadlineAlreadyShiftedError } from '../Errors/DeadlineAlreadyShiftedError.js';
import { WorkIsArchived } from '../Errors/WorkIsArchived.js';
import { TaskService } from './TaskService.js';
import { AssignedWorkCommentRepository } from '../Data/AssignedWorkCommentRepository.js';
import { AssignedWorkAnswerRepository } from '../Data/AssignedWorkAnswerRepository.js';
import { CourseMaterialRepository } from '../../Courses/Data/CourseMaterialRepository.js';
export class AssignedWorkService extends Service {
    taskService;
    assignedWorkRepository;
    materialRepository;
    workRepository;
    userRepository;
    answerRepository;
    commentRepository;
    constructor() {
        super();
        this.taskService = new TaskService();
        this.assignedWorkRepository = new AssignedWorkRepository();
        this.materialRepository = new CourseMaterialRepository();
        this.workRepository = new WorkRepository();
        this.userRepository = new UserRepository();
        this.answerRepository = new AssignedWorkAnswerRepository();
        this.commentRepository = new AssignedWorkCommentRepository();
    }
    async getWorks(userId, userRole, pagination) {
        // TODO: modify the conditions to load all assigned mentors instead of just one
        const conditions = userRole == 'student'
            ? { student: { id: userId } }
            : { mentors: { id: userId } };
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = AssignedWorkModel.entriesToSearch();
        const relations = [
            'work',
            'student',
            'mentors',
        ];
        const assignedWorks = await this.assignedWorkRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.assignedWorkRepository, conditions, pagination, relations);
        return { assignedWorks, meta };
    }
    async getWorkById(id, role) {
        const work = await this.assignedWorkRepository.findOne({ id }, ['mentors', 'student', 'work.tasks'], {
            work: {
                tasks: {
                    order: 'ASC',
                },
            },
        });
        if (!work) {
            throw new NotFoundError();
        }
        work.answers = [];
        work.comments = [];
        if (work.solveStatus !== 'not-started') {
            const answers = await this.answerRepository.find({
                assignedWorkId: work.id,
            });
            work.answers = answers;
        }
        if ((work.checkStatus === 'in-progress' && role === 'mentor') ||
            work.checkStatus === 'checked-in-deadline' ||
            work.checkStatus === 'checked-after-deadline') {
            const comments = await this.commentRepository.find({
                assignedWorkId: work.id,
            });
            work.comments = comments;
        }
        return work;
    }
    async createWork(assignedWork) {
        const work = await this.workRepository.findOne({
            id: assignedWork.workId,
        }, ['tasks']);
        const student = await this.userRepository.findOne({
            id: assignedWork.studentId,
        }, ['mentor']);
        if (!work) {
            throw new NotFoundError('Работа не найдена');
        }
        if (!student) {
            throw new NotFoundError('Ученик не найден');
        }
        if (!student.mentor) {
            throw new NotFoundError('У ученика нет куратора');
        }
        assignedWork.work = { id: work.id };
        assignedWork.student = { id: student.id };
        assignedWork.mentors = [{ id: student.mentor.id }];
        assignedWork.maxScore = this.getMaxScore(work.tasks || []);
        return await this.assignedWorkRepository.create(assignedWork);
        // await this.calenderService.createFromWork(createdWork)
    }
    async getOrCreateWork(materialSlug, studentId) {
        const material = await this.materialRepository.findOne({ slug: materialSlug }, ['work']);
        if (!material) {
            throw new NotFoundError('Материал не найден');
        }
        const workId = material.work?.id;
        if (!workId) {
            throw new NotFoundError('У этого материала нет работы');
        }
        const assignedWork = await this.assignedWorkRepository.findOne({
            work: { id: workId },
            student: { id: studentId },
        });
        if (assignedWork) {
            switch (assignedWork.solveStatus) {
                case 'in-progress':
                    return { link: `/assigned-works/${assignedWork.id}/solve` };
                case 'made-in-deadline':
                    return { link: `/assigned-works/${assignedWork.id}/read` };
                case 'made-after-deadline':
                    return { link: `/assigned-works/${assignedWork.id}/read` };
                case 'not-started':
                default:
                    return { link: `/assigned-works/${assignedWork.id}/solve` };
            }
        }
        const createdWork = await this.createWork({
            studentId,
            workId,
            checkDeadlineAt: material.workCheckDeadline,
            solveDeadlineAt: material.workSolveDeadline,
        });
        return { link: `/assigned-works/${createdWork.id}/solve` };
    }
    async solveWork(work) {
        const foundWork = await this.assignedWorkRepository.findOne({
            id: work.id,
        }, ['work', 'work.tasks']);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (['made-in-deadline', 'made-after-deadline'].includes(foundWork.solveStatus)) {
            throw new WorkAlreadySolvedError();
        }
        if (foundWork.solveDeadlineAt &&
            new Date() > foundWork.solveDeadlineAt) {
            foundWork.solveStatus = 'made-after-deadline';
        }
        else {
            foundWork.solveStatus = 'made-in-deadline';
        }
        foundWork.solvedAt = new Date();
        foundWork.answers = work.answers;
        foundWork.comments = this.taskService.automatedCheck(foundWork.work.tasks, work.answers);
        if (foundWork.work.tasks.every((task) => task.type !== 'text')) {
            foundWork.checkStatus = 'checked-automatically';
            foundWork.checkedAt = new Date();
            foundWork.score = this.getScore(foundWork.comments);
        }
        await this.assignedWorkRepository.update(foundWork);
    }
    async checkWork(work) {
        const foundWork = await this.assignedWorkRepository.findOne({
            id: work.id,
        });
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (['checked-in-deadline', 'checked-after-deadline'].includes(foundWork.checkStatus)) {
            throw new WorkAlreadyCheckedError();
        }
        if (['not-started', 'in-progress'].includes(foundWork.solveStatus)) {
            throw new WorkIsNotSolvedYetError();
        }
        if (foundWork.checkDeadlineAt &&
            new Date() > foundWork.checkDeadlineAt) {
            foundWork.checkStatus = 'checked-after-deadline';
        }
        else {
            foundWork.checkStatus = 'checked-in-deadline';
        }
        foundWork.comments = work.comments || [];
        foundWork.checkedAt = new Date();
        foundWork.score = this.getScore(work.comments);
        await this.assignedWorkRepository.update(foundWork);
    }
    async saveProgress(work, role) {
        const foundWork = await this.assignedWorkRepository.findOne({
            id: work.id,
        });
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (foundWork.isArchived) {
            throw new WorkIsArchived();
        }
        if (role == 'student') {
            if (foundWork.solveStatus === 'made-in-deadline' ||
                foundWork.solveStatus === 'made-after-deadline') {
                throw new WorkAlreadySolvedError();
            }
            foundWork.solveStatus = 'in-progress';
        }
        else if (role == 'mentor') {
            if (foundWork.checkStatus === 'checked-in-deadline' ||
                foundWork.checkStatus === 'checked-after-deadline') {
                throw new WorkAlreadyCheckedError();
            }
            if (foundWork.solveStatus === 'not-started' ||
                foundWork.solveStatus === 'in-progress') {
                throw new WorkIsNotSolvedYetError();
            }
            foundWork.checkStatus = 'in-progress';
        }
        foundWork.answers = work.answers;
        foundWork.comments = work.comments || [];
        await this.assignedWorkRepository.update(foundWork);
    }
    async archiveWork(id) {
        const foundWork = await this.assignedWorkRepository.findOne({ id });
        if (!foundWork) {
            throw new NotFoundError();
        }
        foundWork.isArchived = true;
        await this.assignedWorkRepository.update(foundWork);
    }
    async transferWorkToAnotherMentor(workId, mentorId, currentMentorId) {
        const foundWork = await this.assignedWorkRepository.findOne({
            id: workId,
        });
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (foundWork.mentorIds.includes(mentorId)) {
            throw new WorkAlreadyAssignedToThisMentorError();
        }
        if (foundWork.mentorIds.length >= 2) {
            throw new WorkAlreadyAssignedToEnoughMentorsError();
        }
        const mentor = await this.userRepository.findOne({
            id: currentMentorId,
        });
        const newMentor = await this.userRepository.findOne({
            id: mentorId,
        });
        if (!mentor || !newMentor) {
            throw new NotFoundError('Куратор не найден');
        }
        foundWork.mentors = [mentor, newMentor];
        await this.assignedWorkRepository.update(foundWork);
    }
    async shiftDeadline(id, days, role, userId) {
        const work = await this.assignedWorkRepository.findOne({ id });
        if (!work) {
            throw new NotFoundError();
        }
        if (role == 'student') {
            if (work.studentId !== userId) {
                throw new UnauthorizedError();
            }
            if (!work.solveDeadlineAt) {
                throw new SolveDeadlineNotSetError();
            }
            if (work.solveDeadlineShifted) {
                throw new DeadlineAlreadyShiftedError();
            }
            work.solveDeadlineAt.setDate(work.solveDeadlineAt.getDate() + days);
            work.solveDeadlineShifted = true;
        }
        else {
            if (!work.mentors.some((mentor) => mentor.id === userId)) {
                throw new UnauthorizedError();
            }
            if (!work.checkDeadlineAt) {
                throw new CheckDeadlineNotSetError();
            }
            if (work.checkDeadlineShifted) {
                throw new DeadlineAlreadyShiftedError();
            }
            work.checkDeadlineAt.setDate(work.checkDeadlineAt.getDate() + days);
            work.checkDeadlineShifted = true;
        }
        //await this.calenderService.updateDeadlineFromWork(work)
        await this.assignedWorkRepository.update(work);
    }
    async deleteWork(id, mentorId) {
        const foundWork = await this.assignedWorkRepository.findOne({ id });
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (!foundWork.mentors.some((mentor) => mentor.id === mentorId)) {
            throw new UnauthorizedError();
        }
        await this.assignedWorkRepository.delete(id);
    }
    getMaxScore(tasks) {
        return tasks.reduce((acc, task) => acc + task.highestScore, 0);
    }
    getScore(comments) {
        return comments.reduce((acc, comment) => acc + comment.score, 0);
    }
}
