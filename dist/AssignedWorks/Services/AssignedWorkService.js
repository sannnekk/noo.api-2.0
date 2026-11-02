import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { Pagination } from '../../Core/Data/Pagination.js';
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
import { IsNull, Not } from 'typeorm';
import { UserService } from '../../Users/Services/UserService.js';
import { NotificationService } from '../../Notifications/Services/NotificationService.js';
import { CantDeleteMadeWorkError } from '../Errors/CantDeleteMadeWorkError.js';
import { isAutomaticallyCheckable } from '../Utils/Task.js';
import { workAlreadyChecked, workAlreadyMade } from '../Utils/AssignedWork.js';
import { WorkIsNotCheckedYetError } from '../Errors/WorkIsNotCheckedYetError.js';
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
        const assignedWork = await this.assignedWorkRepository.findOne({ id }, [
            'mentors',
            'student',
        ]);
        if (!assignedWork) {
            throw new NotFoundError('Работа не найдена');
        }
        const work = await this.workRepository.findOne({ id: assignedWork.workId }, ['tasks'], {
            tasks: {
                order: 'ASC',
            },
        });
        if (!work) {
            throw new NotFoundError('Работа не найдена');
        }
        assignedWork.work = work;
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
            const comments = await this.commentRepository.findAll({
                assignedWork: { id: assignedWork.id },
            });
            const submittedTaskIds = assignedWork.answers
                .filter((answer) => answer.isSubmitted === true)
                .map((answer) => answer.taskId);
            assignedWork.comments = comments.filter((comment) => submittedTaskIds.includes(comment.taskId));
        }
        if (((role === 'mentor' || role === 'teacher') &&
            !workAlreadyChecked(assignedWork)) ||
            workAlreadyChecked(assignedWork)) {
            const comments = await this.commentRepository.findAll({
                assignedWork: { id: assignedWork.id },
            });
            assignedWork.comments = comments;
        }
        return assignedWork;
    }
    async getProgressByWorkId(workId, studentId) {
        const assignedWorks = await this.assignedWorkRepository.search({
            work: { id: workId },
            student: { id: studentId },
        }, new Pagination(1, 1, 'createdAt', 'DESC'), ['work']);
        if (assignedWorks.entities.length < 1) {
            return null;
        }
        const assignedWork = assignedWorks.entities[0];
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
        if (work.type === 'test' && !mentor) {
            assignedWork.mentors = [];
        }
        else {
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
            work: { id: Not(IsNull()) },
        }, ['work']);
        if (!material) {
            throw new NotFoundError('Материал не найден');
        }
        const workId = material.work?.id;
        if (!workId) {
            throw new NotFoundError('У этого материала нет работы');
        }
        /* const assignedWork = await this.assignedWorkRepository.findOne({
          work: { id: workId },
          student: { id: studentId },
        }) */
        const assignedWorks = await this.assignedWorkRepository.search({
            work: { id: workId },
            student: { id: studentId },
        }, new Pagination(1, 1, 'createdAt', 'DESC'), ['work']);
        if (assignedWorks.entities.length > 0) {
            const assignedWork = assignedWorks.entities[0];
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
        const foundWork = await this.getAssignedWork(assignedWorkId, ['student']);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (foundWork.studentId !== studentId) {
            throw new UnauthorizedError('Вы не можете решить чужую работу');
        }
        if (workAlreadyMade(foundWork)) {
            throw new WorkAlreadySolvedError();
        }
        const work = await this.workRepository.findOne({ id: foundWork.workId }, [
            'tasks',
        ]);
        if (!work) {
            throw new NotFoundError();
        }
        if (foundWork.solveDeadlineAt &&
            Dates.isInPast(foundWork.solveDeadlineAt)) {
            foundWork.solveStatus = 'made-after-deadline';
        }
        else {
            foundWork.solveStatus = 'made-in-deadline';
        }
        foundWork.solvedAt = Dates.now();
        foundWork.comments = this.taskService.automatedCheck(work.tasks, solveOptions.answers);
        foundWork.answers = solveOptions.answers.map((a) => foundWork.comments.some((c) => c.taskId === a.taskId)
            ? { ...a, isSubmitted: true }
            : a);
        foundWork.studentComment = solveOptions.studentComment || null;
        if (work.tasks.every((task) => isAutomaticallyCheckable(task.type))) {
            foundWork.checkStatus = 'checked-automatically';
            foundWork.checkedAt = Dates.now();
            foundWork.score = this.getScore(foundWork.comments);
            foundWork.maxScore = this.getMaxScore(work.tasks, foundWork.excludedTaskIds);
        }
        await this.assignedWorkRepository.update(foundWork);
        await this.calenderService.createWorkMadeEvent({ ...foundWork, work });
        await this.notificationService.generateAndSend('assigned-work.work-made-for-student', foundWork.student.id, { assignedWork: { ...foundWork, work } });
        if (foundWork.checkStatus !== 'checked-automatically') {
            for (const mentor of foundWork.mentors) {
                await this.notificationService.generateAndSend('assigned-work.work-made-for-mentor', mentor.id, { assignedWork: { ...foundWork, work } });
            }
        }
    }
    async checkWork(assignedWorkId, checkOptions, checkerId) {
        const foundWork = await this.getAssignedWork(assignedWorkId, [
            'mentors',
            'student',
        ]);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (!foundWork.mentors.some((mentor) => mentor.id === checkerId)) {
            throw new UnauthorizedError('Вы не можете проверить эту работу, так как не являетесь куратором этой работы');
        }
        if (workAlreadyChecked(foundWork)) {
            throw new WorkAlreadyCheckedError();
        }
        if (!workAlreadyMade(foundWork)) {
            throw new WorkIsNotSolvedYetError();
        }
        const work = await this.workRepository.findOne({ id: foundWork.workId }, [
            'tasks',
        ]);
        if (!work) {
            throw new NotFoundError('Работа не найдена');
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
        foundWork.maxScore = this.getMaxScore(work.tasks, foundWork.excludedTaskIds);
        if (checkOptions.mentorComment) {
            foundWork.mentorComment = checkOptions.mentorComment;
        }
        await this.assignedWorkRepository.update(foundWork);
        foundWork.work = work;
        await this.calenderService.createWorkCheckedEvent(foundWork);
        await this.notificationService.generateAndSend('assigned-work.work-checked-for-student', foundWork.student.id, { assignedWork: foundWork });
        for (const mentor of foundWork.mentors) {
            await this.notificationService.generateAndSend('assigned-work.work-checked-for-mentor', mentor.id, { assignedWork: foundWork });
        }
    }
    async recheckAutomatically(workId) {
        const foundWork = await this.getAssignedWork(workId, ['answers']);
        if (!foundWork) {
            throw new NotFoundError('Работа не найдена');
        }
        if (foundWork.checkStatus !== 'checked-automatically') {
            throw new WorkIsNotSolvedYetError();
        }
        const work = await this.workRepository.findOne({ id: foundWork.workId }, [
            'tasks',
        ]);
        if (!work) {
            throw new NotFoundError('Работа не найдена');
        }
        foundWork.comments = this.taskService.automatedCheck(work.tasks, foundWork.answers);
        foundWork.checkedAt = Dates.now();
        foundWork.score = this.getScore(foundWork.comments);
        await this.assignedWorkRepository.update(foundWork);
    }
    async saveProgress(assignedWorkId, saveOptions, role) {
        const foundWork = await this.getAssignedWork(assignedWorkId);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (role === 'student') {
            if (workAlreadyMade(foundWork)) {
                throw new WorkAlreadySolvedError();
            }
            foundWork.solveStatus = 'in-progress';
            foundWork.studentComment = saveOptions.studentComment || null;
        }
        else if (role === 'mentor') {
            if (workAlreadyChecked(foundWork)) {
                throw new WorkAlreadyCheckedError();
            }
            if (!workAlreadyMade(foundWork)) {
                throw new WorkIsNotSolvedYetError();
            }
            foundWork.checkStatus = 'in-progress';
            foundWork.mentorComment = saveOptions.mentorComment || null;
        }
        else {
            foundWork.answers = saveOptions.answers;
            if (saveOptions.studentComment) {
                foundWork.studentComment = saveOptions.studentComment;
            }
            return this.assignedWorkRepository.update(foundWork);
        }
        foundWork.answers = saveOptions.answers;
        foundWork.comments = saveOptions.comments || foundWork.comments || [];
        await this.assignedWorkRepository.update(foundWork);
    }
    async saveAnswer(assignedWorkId, answer, userId, userRole) {
        const foundWork = await this.getAssignedWork(assignedWorkId);
        if (foundWork.studentId !== userId && userRole === 'student') {
            throw new UnauthorizedError();
        }
        if (workAlreadyMade(foundWork) && userRole === 'student') {
            throw new WorkAlreadySolvedError();
        }
        if (foundWork.solveStatus !== 'in-progress' && userRole === 'student') {
            await this.assignedWorkRepository.setSolvingInProgress(foundWork.id);
        }
        if (answer.id) {
            await this.answerRepository.update(answer);
            return answer.id;
        }
        answer.assignedWork = { id: foundWork.id };
        const createdAnswer = await this.answerRepository.create(answer);
        return createdAnswer.id;
    }
    async saveComment(assignedWorkId, comment, userId) {
        const foundWork = await this.getAssignedWork(assignedWorkId);
        if (!foundWork.mentors.some((mentor) => mentor.id === userId) &&
            foundWork.studentId !== userId) {
            throw new UnauthorizedError();
        }
        const isMentor = foundWork.mentors.some((mentor) => mentor.id === userId);
        if (workAlreadyChecked(foundWork)) {
            throw new WorkAlreadyCheckedError();
        }
        if (isMentor) {
            await this.assignedWorkRepository.setCheckInProgress(foundWork.id);
        }
        if (comment.id) {
            await this.commentRepository.update(comment);
            return comment.id;
        }
        comment.assignedWork = { id: foundWork.id };
        const createdComment = await this.commentRepository.create(comment);
        return createdComment.id;
    }
    async saveWorkComments(assignedWorkId, data, userId, userRole) {
        const foundWork = await this.getAssignedWork(assignedWorkId);
        if (userRole === 'student' && foundWork.studentId !== userId) {
            throw new UnauthorizedError();
        }
        if (workAlreadyMade(foundWork) && userRole === 'student') {
            throw new WorkAlreadySolvedError();
        }
        if (userRole === 'mentor' &&
            !foundWork.mentors.some((mentor) => mentor.id === userId)) {
            throw new UnauthorizedError();
        }
        if (workAlreadyChecked(foundWork) && userRole === 'mentor') {
            throw new WorkAlreadyCheckedError();
        }
        if (userRole === 'mentor') {
            foundWork.mentorComment = data.mentorComment;
        }
        else if (userRole === 'student') {
            foundWork.studentComment = data.studentComment;
        }
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
        else if (role === 'assistant') {
            foundWork.isArchivedByAssistants = true;
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
        else if (role === 'assistant') {
            foundWork.isArchivedByAssistants = false;
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
        });
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
        const studentDays = AssignedWorkOptions.studentDeadlineShift;
        const mentorDays = AssignedWorkOptions.mentorDeadlineShift;
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
            if (workAlreadyMade(work)) {
                throw new WorkAlreadySolvedError();
            }
            work.solveDeadlineAt = Dates.addDays(work.solveDeadlineAt, studentDays);
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
            if (workAlreadyChecked(work)) {
                throw new WorkAlreadyCheckedError();
            }
            work.checkDeadlineAt = Dates.addDays(work.checkDeadlineAt, mentorDays);
            work.checkDeadlineShifted = true;
            await this.calenderService.updateDeadlineFromWork(work, 'mentor-deadline');
        }
        await this.assignedWorkRepository.update(work);
        return {
            newSolveDeadlineAt: work.solveDeadlineAt,
            newCheckDeadlineAt: work.checkDeadlineAt,
        };
    }
    async sendToRevision(workId, mentorId) {
        const work = await this.getAssignedWork(workId, ['mentors']);
        if (!work) {
            throw new NotFoundError();
        }
        if (!work.mentors.some((mentor) => mentor.id === mentorId)) {
            throw new UnauthorizedError();
        }
        if (!workAlreadyMade(work)) {
            throw new WorkIsNotSolvedYetError();
        }
        work.solveStatus = 'in-progress';
        work.solvedAt = null;
        work.checkStatus = 'not-checked';
        work.checkedAt = null;
        work.score = null;
        await this.assignedWorkRepository.update(work);
    }
    async sendToRecheck(assignedWorkId, userId, userRole) {
        const foundWork = await this.getAssignedWork(assignedWorkId, ['mentors']);
        if (!foundWork) {
            throw new NotFoundError();
        }
        if (userRole === 'mentor' &&
            !foundWork.mentors.some((mentor) => mentor.id === userId)) {
            throw new UnauthorizedError();
        }
        if (!workAlreadyChecked(foundWork)) {
            throw new WorkIsNotCheckedYetError();
        }
        foundWork.checkStatus = 'in-progress';
        foundWork.checkedAt = null;
        await this.assignedWorkRepository.update(foundWork);
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
        if (workAlreadyMade(foundWork)) {
            throw new CantDeleteMadeWorkError();
        }
        await this.assignedWorkRepository.delete(id);
    }
    /**
     * Saves comments generated by AI (Shpuntik) without touching the rest of the work.
     * Comments are saved one by one so that the comments missing in the list are not orphaned.
     */
    async saveAiComments(assignedWorkId, comments) {
        await this.assignedWorkRepository.setCheckInProgress(assignedWorkId);
        // models generate an id on construction, so check the db to decide on create/update
        const existingCommentIds = (await this.commentRepository.findAll({
            assignedWork: { id: assignedWorkId },
        })).map((comment) => comment.id);
        for (const comment of comments) {
            if (existingCommentIds.includes(comment.id)) {
                await this.commentRepository.update(comment);
                continue;
            }
            comment.assignedWork = { id: assignedWorkId };
            await this.commentRepository.create(comment);
        }
    }
    /**
     * Removes the comment of the given task (e.g. generated by AI) from the work.
     */
    async removeTaskComment(assignedWorkId, taskId) {
        const comments = await this.commentRepository.findAll({
            assignedWork: { id: assignedWorkId },
        });
        const comment = comments.find((c) => c.taskId === taskId);
        if (!comment) {
            throw new NotFoundError('Комментарий не найден');
        }
        await this.commentRepository.delete(comment.id);
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
