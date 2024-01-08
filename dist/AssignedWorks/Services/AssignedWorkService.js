import { NotFoundError, UnauthorizedError } from '../../core/index';
import { AssignedWorkRepository } from '../Data/AssignedWorkRepository';
import { AssignedWorkModel } from '../Data/AssignedWorkModel';
import { WorkAlreadySolvedError } from '../Errors/WorkAlreadySolvedError';
import { WorkAlreadyCheckedError } from '../Errors/WorkAlreadyCheckedError';
import { WorkIsNotSolvedYetError } from '../Errors/WorkIsNotSolvedYetError';
import { WorkAlreadyAssignedToThisMentorError } from '../Errors/WorkAlreadyAssignedToThisMentorError';
import { WorkAlreadyAssignedToEnoughMentorsError } from '../Errors/WorkAlreadyAssignedToEnoughMentorsError';
import { SolveDeadlineNotSetError } from '../Errors/SolveDeadlineNotSetError';
import { CheckDeadlineNotSetError } from '../Errors/CheckDeadlineNotSetError';
import { UserRepository } from '../../Users/Data/UserRepository';
import { StudentFromAnotherMentorError } from '../Errors/StudentFromAnotherMentorError';
import { WorkRepository } from '../../Works/Data/WorkRepository';
export class AssignedWorkService {
    assignedWorkRepository;
    workRepository;
    userRepository;
    constructor() {
        this.assignedWorkRepository = new AssignedWorkRepository();
        this.workRepository = new WorkRepository();
        this.userRepository = new UserRepository();
    }
    async getWorks(userId, userRole, pagination) {
        const condition = userRole == 'student'
            ? { student: { id: userId } }
            : { mentors: { id: userId } };
        return await this.assignedWorkRepository.find(condition, undefined, pagination);
    }
    async getWorkBySlug(slug) {
        const work = await this.assignedWorkRepository.findOne({ slug });
        if (!work) {
            throw new NotFoundError();
        }
        return work;
    }
    async getWorkById(id) {
        const work = await this.assignedWorkRepository.findOne({ id });
        if (!work) {
            throw new NotFoundError();
        }
        return work;
    }
    async createWork(assignedWork, mentorId) {
        const mentor = await this.userRepository.findOne({ id: mentorId }, {
            students: true,
        });
        const work = await this.workRepository.findOne({
            id: assignedWork.workId,
        });
        if (!mentor.students?.some((student) => student.id === assignedWork.studentId)) {
            throw new StudentFromAnotherMentorError();
        }
        if (!work) {
            throw new NotFoundError();
        }
        assignedWork.student = { id: assignedWork.studentId };
        assignedWork.mentors = [{ id: mentorId }];
        assignedWork.work = { id: assignedWork.workId };
        assignedWork.maxScore = this.getMaxScore(work.tasks || []);
        return this.assignedWorkRepository.create(assignedWork);
    }
    async solveWork(work) {
        const foundWork = await this.assignedWorkRepository.findOne({
            id: work.id,
        });
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (['made-in-deadline', 'made-after-deadline'].includes(foundWork.solveStatus)) {
            throw new WorkAlreadySolvedError();
        }
        // check if its been solved in deadline
        let solveStatus;
        if (foundWork.solveDeadlineAt &&
            new Date() > foundWork.solveDeadlineAt) {
            solveStatus = 'made-after-deadline';
        }
        else {
            solveStatus = 'made-in-deadline';
        }
        work.solveStatus = solveStatus;
        work.solvedAt = new Date();
        const newWork = new AssignedWorkModel({ ...foundWork, ...work });
        return this.assignedWorkRepository.update(newWork);
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
        // check if its been solved in deadline
        let checkStatus;
        if (foundWork.checkDeadlineAt &&
            new Date() > foundWork.checkDeadlineAt) {
            checkStatus = 'checked-after-deadline';
        }
        else {
            checkStatus = 'checked-in-deadline';
        }
        work.checkStatus = checkStatus;
        work.checkedAt = new Date();
        work.score = this.getScore(work.comments);
        const newWork = new AssignedWorkModel({ ...foundWork, ...work });
        return this.assignedWorkRepository.update(newWork);
    }
    async transferWorkToAnotherMentor(workId, mentorId) {
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
        // as any to trick ts because we need only the id not the entire entity
        foundWork.mentors = [...foundWork.mentorIds, mentorId];
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
            work.solveDeadlineAt.setDate(work.solveDeadlineAt.getDate() + days);
        }
        else {
            if (!work.mentors.some((mentor) => mentor.id === userId)) {
                throw new UnauthorizedError();
            }
            if (!work.checkDeadlineAt) {
                throw new CheckDeadlineNotSetError();
            }
            work.checkDeadlineAt.setDate(work.checkDeadlineAt.getDate() + days);
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
