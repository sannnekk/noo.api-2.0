import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
import { UserRepository } from '../../Users/Data/UserRepository.js';
import { WorkRepository } from '../../Works/Data/WorkRepository.js';
import { CalenderService } from '../../Calender/Services/CalenderService.js';
import { CourseMaterialRepository } from '../../Courses/Data/CourseMaterialRepository.js';
import { AssignedWorkRepository } from '../Data/AssignedWorkRepository.js';
import { AssignedWorkModel } from '../Data/AssignedWorkModel.js';
import { WorkAlreadySolvedError } from '../Errors/WorkAlreadySolvedError.js';
import { WorkAlreadyCheckedError } from '../Errors/WorkAlreadyCheckedError.js';
import { WorkIsNotSolvedYetError } from '../Errors/WorkIsNotSolvedYetError.js';
import { WorkAlreadyAssignedToThisMentorError } from '../Errors/WorkAlreadyAssignedToThisMentorError.js';
import { WorkAlreadyAssignedToEnoughMentorsError } from '../Errors/WorkAlreadyAssignedToEnoughMentorsError.js';
import { SolveDeadlineNotSetError } from '../Errors/SolveDeadlineNotSetError.js';
import { CheckDeadlineNotSetError } from '../Errors/CheckDeadlineNotSetError.js';
import { DeadlineAlreadyShiftedError } from '../Errors/DeadlineAlreadyShiftedError.js';
import { TaskService } from './TaskService.js';
import { AssignedWorkCommentRepository } from '../Data/AssignedWorkCommentRepository.js';
import { AssignedWorkAnswerRepository } from '../Data/AssignedWorkAnswerRepository.js';
import Dates from '../../Core/Utils/date.js';
import { AssignedWorkOptions } from '../AssignedWorkOptions.js';
import TypeORM from 'typeorm';
import { UserService } from '../../Users/Services/UserService.js';
import { NotificationService } from '../../Notifications/Services/NotificationService.js';
import { CantDeleteMadeWorkError } from '../Errors/CantDeleteMadeWorkError.js';
export class AssignedWorkService {
    taskService;
    assignedWorkRepository;
    materialRepository;
    workRepository;
    userRepository;
    userService;
    answerRepository;
    commentRepository;
    calenderService;
    notificationService;
    constructor() {
        this.taskService = new TaskService();
        this.assignedWorkRepository = new AssignedWorkRepository();
        this.materialRepository = new CourseMaterialRepository();
        this.workRepository = new WorkRepository();
        this.userRepository = new UserRepository();
        this.answerRepository = new AssignedWorkAnswerRepository();
        this.commentRepository = new AssignedWorkCommentRepository();
        this.calenderService = new CalenderService();
        this.userService = new UserService();
        this.notificationService = new NotificationService();
    }
    async getWorks(userId, userRole, pagination) {
        if (!userRole) {
            const user = await this.userRepository.findOne({ id: userId });
            if (!user) {
                throw new NotFoundError('Пользователь не найден');
            }
            userRole = user.role;
        }
        // TODO: modify the conditions to load all assigned mentors instead of just one
        const conditions = userRole == 'student'
            ? { student: { id: userId } }
            : { mentors: { id: userId } };
        const relations = ['work', 'student', 'mentors'];
        const { entities, meta } = await this.assignedWorkRepository.search(conditions, pagination, relations);
        for (const work of entities) {
            if (work.isNewAttempt && work.work) {
                work.work.name = `🔁 ${work.work.name}`;
            }
        }
        return { entities, meta };
    }
    async getWorkById(id, role) {
        const assignedWork = await this.assignedWorkRepository.findOne({ id }, ['mentors', 'student', 'work.tasks'], {
            work: {
                tasks: {
                    order: 'ASC',
                },
            },
        });
        if (!assignedWork) {
            throw new NotFoundError();
        }
        assignedWork.answers = [];
        assignedWork.comments = [];
        this.excludeTasks(assignedWork);
        if (assignedWork.isNewAttempt) {
            assignedWork.work.name = `🔁 (Пересдача) ${assignedWork.work.name}`;
        }
        if (assignedWork.solveStatus !== 'not-started') {
            const answers = await this.answerRepository.findAll({
                assignedWork: { id: assignedWork.id },
            });
            assignedWork.answers = answers;
        }
        if ((assignedWork.checkStatus === 'in-progress' && role === 'mentor') ||
            (assignedWork.checkStatus === 'not-checked' && role === 'mentor') ||
            assignedWork.checkStatus === 'checked-in-deadline' ||
            assignedWork.checkStatus === 'checked-after-deadline' ||
            assignedWork.checkStatus === 'checked-automatically') {
            const comments = await this.commentRepository.findAll({
                assignedWork: { id: assignedWork.id },
            });
            assignedWork.comments = comments;
        }
        return assignedWork;
    }
    async getProgressByWorkId(workId, studentId) {
        const assignedWork = await this.assignedWorkRepository.findOne({
            work: { id: workId },
            student: { id: studentId },
        }, ['work']);
        if (!assignedWork) {
            return null;
        }
        const progress = {
            score: assignedWork.score || null,
            maxScore: assignedWork.maxScore,
            solveStatus: assignedWork.solveStatus,
            checkStatus: assignedWork.checkStatus,
        };
        return progress;
    }
    async createWork(options, taskIdsToExclude = []) {
        const work = await this.workRepository.findOne({
            id: options.workId,
        }, ['tasks', 'subject']);
        const student = await this.userRepository.findOne({
            id: options.studentId,
        }, ['mentorAssignmentsAsStudent']);
        if (!work) {
            throw new NotFoundError('Работа не найдена');
        }
        if (!student) {
            throw new NotFoundError('Ученик не найден');
        }
        const mentor = await this.userService.getMentor(student, work.subject.id);
        if (!mentor && work.type !== 'test') {
            throw new NotFoundError('У ученика нет куратора по данному предмету');
        }
        const assignedWork = new AssignedWorkModel();
        if (work.type !== 'test') {
            assignedWork.mentors = [{ id: mentor.id }];
        }
        assignedWork.work = { id: work.id };
        assignedWork.student = { id: student.id };
        assignedWork.excludedTaskIds = taskIdsToExclude;
        assignedWork.maxScore = this.getMaxScore(work.tasks, taskIdsToExclude);
        assignedWork.solveStatus = 'not-started';
        assignedWork.checkStatus = 'not-checked';
        assignedWork.isNewAttempt = options.isNewAttempt || false;
        assignedWork.solveDeadlineAt = options.solveDeadlineAt;
        assignedWork.checkDeadlineAt = options.checkDeadlineAt;
        const createdWork = await this.assignedWorkRepository.create(assignedWork);
        work.tasks = [];
        createdWork.student = student;
        createdWork.mentors = work.type === 'test' ? [] : [mentor];
        createdWork.work = work;
        if (assignedWork.solveDeadlineAt) {
            await this.calenderService.createSolveDeadlineEvent(createdWork);
        }
        if (assignedWork.checkDeadlineAt && work.type !== 'test') {
            await this.calenderService.createCheckDeadlineEvent(createdWork);
        }
        return createdWork;
    }
    async remakeWork(assignedWorkId, studentId, options) {
        const assignedWork = await this.getAssignedWork(assignedWorkId, ['work']);
        if (!assignedWork) {
            throw new NotFoundError('Работа не найдена');
        }
        if (!assignedWork.work) {
            throw new NotFoundError('Работа не найдена. Возможно, она была удалена');
        }
        if (assignedWork.studentId !== studentId) {
            throw new UnauthorizedError('Вы не можете пересдать чужую работу');
        }
        const rightTaskIds = assignedWork.excludedTaskIds;
        if (options.onlyFalse) {
            const comments = await this.commentRepository.findAll({
                assignedWork: { id: assignedWork.id },
            }, ['task']);
            const newExcludes = comments
                .filter((comment) => comment.task?.highestScore === comment.score)
                .map((comment) => comment.task?.id)
                .filter(Boolean);
            rightTaskIds.push(...newExcludes);
        }
        await this.createWork({
            workId: assignedWork.work.id,
            studentId,
            isNewAttempt: true,
        }, rightTaskIds);
    }
    async getOrCreateWork(materialSlug, studentId) {
        const material = await this.materialRepository.findOne({
            slug: materialSlug,
            chapter: { course: { id: TypeORM.Not(TypeORM.IsNull()) } },
        }, ['work']);
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
    async solveWork(assignedWorkId, solveOptions, studentId) {
        const foundWork = await this.getAssignedWork(assignedWorkId, [
            'work',
            'work.tasks',
            'student',
        ]);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (foundWork.studentId !== studentId) {
            throw new UnauthorizedError('Вы не можете решить чужую работу');
        }
        if (foundWork.solveStatus === 'made-in-deadline' ||
            foundWork.solveStatus === 'made-after-deadline') {
            throw new WorkAlreadySolvedError();
        }
        if (foundWork.solveDeadlineAt &&
            Dates.isInPast(foundWork.solveDeadlineAt)) {
            foundWork.solveStatus = 'made-after-deadline';
        }
        else {
            foundWork.solveStatus = 'made-in-deadline';
        }
        foundWork.solvedAt = Dates.now();
        foundWork.answers = solveOptions.answers;
        foundWork.comments = this.taskService.automatedCheck(foundWork.work.tasks, solveOptions.answers);
        if (solveOptions.studentComment) {
            foundWork.studentComment = solveOptions.studentComment;
        }
        if (foundWork.work.tasks.every((task) => task.type !== 'text')) {
            foundWork.checkStatus = 'checked-automatically';
            foundWork.checkedAt = Dates.now();
            foundWork.score = this.getScore(foundWork.comments);
        }
        await this.assignedWorkRepository.update(foundWork);
        await this.calenderService.createWorkMadeEvent(foundWork);
        await this.notificationService.generateAndSend('assigned-work.work-made-for-student', foundWork.student.id, { assignedWork: foundWork });
        if (foundWork.checkStatus !== 'checked-automatically') {
            for (const mentor of foundWork.mentors) {
                await this.notificationService.generateAndSend('assigned-work.work-made-for-mentor', mentor.id, { assignedWork: foundWork });
            }
        }
    }
    async checkWork(assignedWorkId, checkOptions, checkerId) {
        const foundWork = await this.getAssignedWork(assignedWorkId, [
            'work',
            'mentors',
            'student',
        ]);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (!foundWork.mentors.some((mentor) => mentor.id === checkerId)) {
            throw new UnauthorizedError('Вы не можете проверить эту работу, так как не являетесь куратором этой работы');
        }
        if ([
            'checked-in-deadline',
            'checked-after-deadline',
            'checked-automatically',
        ].includes(foundWork.checkStatus)) {
            throw new WorkAlreadyCheckedError();
        }
        if (['not-started', 'in-progress'].includes(foundWork.solveStatus)) {
            throw new WorkIsNotSolvedYetError();
        }
        if (foundWork.checkDeadlineAt &&
            Dates.isInPast(foundWork.checkDeadlineAt)) {
            foundWork.checkStatus = 'checked-after-deadline';
        }
        else {
            foundWork.checkStatus = 'checked-in-deadline';
        }
        foundWork.answers = checkOptions.answers || [];
        foundWork.comments = checkOptions.comments || [];
        foundWork.checkedAt = Dates.now();
        foundWork.score = this.getScore(foundWork.comments);
        if (checkOptions.mentorComment) {
            foundWork.mentorComment = checkOptions.mentorComment;
        }
        await this.assignedWorkRepository.update(foundWork);
        await this.calenderService.createWorkCheckedEvent(foundWork);
        await this.notificationService.generateAndSend('assigned-work.work-checked-for-student', foundWork.student.id, { assignedWork: foundWork });
        for (const mentor of foundWork.mentors) {
            await this.notificationService.generateAndSend('assigned-work.work-checked-for-mentor', mentor.id, { assignedWork: foundWork });
        }
    }
    async saveProgress(assignedWorkId, saveOptions, role) {
        const foundWork = await this.getAssignedWork(assignedWorkId);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (role === 'student') {
            if (foundWork.solveStatus === 'made-in-deadline' ||
                foundWork.solveStatus === 'made-after-deadline') {
                throw new WorkAlreadySolvedError();
            }
            foundWork.solveStatus = 'in-progress';
            if (saveOptions.studentComment) {
                foundWork.studentComment = saveOptions.studentComment;
            }
        }
        else if (role === 'mentor') {
            if (foundWork.checkStatus === 'checked-in-deadline' ||
                foundWork.checkStatus === 'checked-after-deadline' ||
                foundWork.checkStatus === 'checked-automatically') {
                throw new WorkAlreadyCheckedError();
            }
            if (foundWork.solveStatus === 'not-started' ||
                foundWork.solveStatus === 'in-progress') {
                throw new WorkIsNotSolvedYetError();
            }
            foundWork.checkStatus = 'in-progress';
            if (saveOptions.mentorComment) {
                foundWork.mentorComment = saveOptions.mentorComment;
            }
        }
        foundWork.answers = saveOptions.answers;
        foundWork.comments = saveOptions.comments || foundWork.comments || [];
        await this.assignedWorkRepository.update(foundWork);
    }
    async archiveWork(id, role) {
        const foundWork = await this.getAssignedWork(id);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (role === 'student') {
            foundWork.isArchivedByStudent = true;
        }
        else if (role === 'mentor') {
            foundWork.isArchivedByMentors = true;
        }
        await this.assignedWorkRepository.update(foundWork);
    }
    async unarchiveWork(id, role) {
        const foundWork = await this.getAssignedWork(id);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (role === 'student') {
            foundWork.isArchivedByStudent = false;
        }
        else if (role === 'mentor') {
            foundWork.isArchivedByMentors = false;
        }
        await this.assignedWorkRepository.update(foundWork);
    }
    async transferWorkToAnotherMentor(workId, mentorId, currentMentorId) {
        const foundWork = await this.getAssignedWork(workId, [
            'work',
            'mentors',
            'student',
        ]);
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
            role: 'mentor',
        });
        const newMentor = await this.userRepository.findOne({
            id: mentorId,
            role: 'mentor',
        });
        if (!mentor || !newMentor) {
            throw new NotFoundError('Куратор не найден');
        }
        foundWork.mentors = [mentor, newMentor];
        await this.assignedWorkRepository.update(foundWork);
        await this.notificationService.generateAndSend('assigned-work.work-transferred-to-another-mentor', newMentor.id, { assignedWork: foundWork });
    }
    async replaceMentor(workId, newMentorentorId) {
        const assignedWork = await this.assignedWorkRepository.findOne({
            id: workId,
        }, ['work.subject']);
        if (!assignedWork) {
            throw new NotFoundError();
        }
        const newMentor = await this.userRepository.findOne({
            id: newMentorentorId,
            role: 'mentor',
        });
        if (!newMentor) {
            throw new NotFoundError('Куратор не найден');
        }
        assignedWork.mentors = [newMentor];
        await this.assignedWorkRepository.update(assignedWork);
    }
    async shiftDeadline(id, role, userId) {
        const work = await this.getAssignedWork(id, ['mentors']);
        const days = AssignedWorkOptions.deadlineShift;
        const mentorAlsoDays = AssignedWorkOptions.mentorDeadlineAlsoShift;
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
            if (work.solveStatus === 'made-in-deadline' ||
                work.solveStatus === 'made-after-deadline') {
                throw new WorkAlreadySolvedError();
            }
            work.solveDeadlineAt = Dates.addDays(work.solveDeadlineAt, days);
            work.solveDeadlineShifted = true;
            // also shift mentors deadline
            if (work.checkDeadlineAt) {
                work.checkDeadlineAt = Dates.addDays(work.checkDeadlineAt, mentorAlsoDays);
            }
            await this.calenderService.updateDeadlineFromWork(work, 'student-deadline');
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
            if (work.checkStatus === 'checked-in-deadline' ||
                work.checkStatus === 'checked-after-deadline' ||
                work.checkStatus === 'checked-automatically') {
                throw new WorkAlreadyCheckedError();
            }
            work.checkDeadlineAt = Dates.addDays(work.checkDeadlineAt, days);
            work.checkDeadlineShifted = true;
            await this.calenderService.updateDeadlineFromWork(work, 'mentor-deadline');
        }
        await this.assignedWorkRepository.update(work);
    }
    async sendToRevision(workId, mentorId) {
        const work = await this.getAssignedWork(workId, ['mentors']);
        if (!work) {
            throw new NotFoundError();
        }
        if (!work.mentors.some((mentor) => mentor.id === mentorId)) {
            throw new UnauthorizedError();
        }
        if (work.checkStatus === 'in-progress' ||
            work.checkStatus === 'checked-in-deadline' ||
            work.checkStatus === 'checked-after-deadline' ||
            work.checkStatus === 'checked-automatically') {
            throw new WorkAlreadyCheckedError();
        }
        if (work.solveStatus === 'in-progress' ||
            work.solveStatus === 'not-started') {
            throw new WorkIsNotSolvedYetError();
        }
        work.solveStatus = 'in-progress';
        work.solvedAt = null;
        await this.assignedWorkRepository.update(work);
    }
    async deleteWork(id, userId, userRole) {
        const foundWork = await this.assignedWorkRepository.findOne({ id }, [
            'mentors',
            'student',
        ]);
        if (!foundWork) {
            throw new NotFoundError('Работа не найдена. Возможно, она была уже удалена');
        }
        if (userRole === 'mentor' &&
            !foundWork.mentors.some((mentor) => mentor.id === userId)) {
            throw new UnauthorizedError();
        }
        if (userRole === 'student' && foundWork.studentId !== userId) {
            throw new UnauthorizedError();
        }
        if (foundWork.solvedAt) {
            throw new CantDeleteMadeWorkError();
        }
        await this.assignedWorkRepository.delete(id);
    }
    async getAssignedWork(id, relations = []) {
        const assignedWork = await this.assignedWorkRepository.findOne({ id }, relations);
        if (!assignedWork) {
            throw new NotFoundError('Работа не найдена');
        }
        this.excludeTasks(assignedWork);
        return assignedWork;
    }
    excludeTasks(assignedWork) {
        const tasksToExclude = assignedWork.excludedTaskIds;
        if (tasksToExclude.length && assignedWork?.work?.tasks) {
            assignedWork.work.tasks = assignedWork.work.tasks.filter((task) => !tasksToExclude.includes(task.id));
        }
    }
    getMaxScore(tasks, excludedTaskIds = []) {
        const filteredTasks = tasks.filter((task) => !excludedTaskIds.includes(task.id));
        return filteredTasks.reduce((acc, task) => acc + task.highestScore, 0);
    }
    getScore(comments) {
        return comments.reduce((acc, comment) => acc + comment.score, 0);
    }
}
