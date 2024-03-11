import { NotFoundError, Pagination, Service, UnauthorizedError, } from '../../core/index.js';
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
export class AssignedWorkService extends Service {
    taskService;
    assignedWorkRepository;
    workRepository;
    userRepository;
    constructor() {
        super();
        this.taskService = new TaskService();
        this.assignedWorkRepository = new AssignedWorkRepository();
        this.workRepository = new WorkRepository();
        this.userRepository = new UserRepository();
    }
    async getWorks(userId, userRole, pagination) {
        const conditions = userRole == 'student'
            ? { student: { id: userId } }
            : { mentors: { id: userId } };
        pagination = new Pagination().assign(pagination);
        // TODO: entries to search
        pagination.entriesToSearch = [];
        const relations = ['student', 'mentors'];
        const assignedWorks = await this.assignedWorkRepository.find(conditions, relations, pagination);
        this.storeRequestMeta(this.assignedWorkRepository, conditions, relations, pagination);
        return assignedWorks;
    }
    async getWorkBySlug(slug) {
        const work = await this.assignedWorkRepository.findOne({ slug }, [
            'student',
            'mentors',
        ]);
        if (!work) {
            throw new NotFoundError();
        }
        return work;
    }
    async getWorkById(id) {
        const work = await this.assignedWorkRepository.findOne({ id }, [
            'mentors',
            'student',
        ]);
        if (!work) {
            throw new NotFoundError();
        }
        return work;
    }
    async createWork(assignedWork) {
        const work = await this.workRepository.findOne({
            id: assignedWork.workId,
        });
        const student = await this.userRepository.findOne({
            id: assignedWork.studentId,
        });
        if (!work || !student) {
            throw new NotFoundError();
        }
        assignedWork.student = { id: assignedWork.studentId };
        assignedWork.mentors = [{ id: student.mentorId }];
        assignedWork.work = { id: assignedWork.workId };
        assignedWork.maxScore = this.getMaxScore(work.tasks || []);
        return this.assignedWorkRepository.create(assignedWork);
    }
    async solveWork(work) {
        const foundWork = await this.assignedWorkRepository.findOne({
            id: work.id,
        }, ['work', 'comments', 'answers']);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (['made-in-deadline', 'made-after-deadline'].includes(foundWork.solveStatus)) {
            throw new WorkAlreadySolvedError();
        }
        if (foundWork.solveDeadlineAt &&
            new Date() > foundWork.solveDeadlineAt) {
            work.solveStatus = 'made-after-deadline';
        }
        else {
            work.solveStatus = 'made-in-deadline';
        }
        work.solvedAt = new Date();
        work.comments = this.taskService.automatedCheck(foundWork.work.tasks, work.answers);
        if (work.work.tasks.every((task) => task.type !== 'text')) {
            work.checkStatus = 'checked-in-deadline';
            work.checkedAt = new Date();
            work.score = this.getScore(work.comments);
        }
        const newWork = new AssignedWorkModel({ ...foundWork, ...work });
        await this.assignedWorkRepository.update(newWork);
        return work.comments;
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
            work.checkStatus = 'checked-after-deadline';
        }
        else {
            work.checkStatus = 'checked-in-deadline';
        }
        work.checkedAt = new Date();
        work.score = this.getScore(work.comments);
        const newWork = new AssignedWorkModel({ ...foundWork, ...work });
        return this.assignedWorkRepository.update(newWork);
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
        return this.assignedWorkRepository.update(work);
    }
    async archiveWork(id) {
        const foundWork = await this.assignedWorkRepository.findOne({ id });
        if (!foundWork) {
            throw new NotFoundError();
        }
        foundWork.isArchived = true;
        return this.assignedWorkRepository.update(foundWork);
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
            throw new NotFoundError();
        }
        foundWork.mentors = [mentor, newMentor];
        return this.assignedWorkRepository.update(foundWork);
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
        return this.assignedWorkRepository.update(work);
    }
    async deleteWork(id, mentorId) {
        const foundWork = await this.assignedWorkRepository.findOne({ id });
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (!foundWork.mentors.some((mentor) => mentor.id === mentorId)) {
            throw new UnauthorizedError();
        }
        return this.assignedWorkRepository.delete(id);
    }
    getMaxScore(tasks) {
        return tasks.reduce((acc, task) => acc + task.highestScore, 0);
    }
    getScore(comments) {
        return comments.reduce((acc, comment) => acc + comment.score, 0);
    }
}
