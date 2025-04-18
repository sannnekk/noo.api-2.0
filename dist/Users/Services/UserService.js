import * as Hash from '../../Core/Security/hash.js';
import { UnauthenticatedError } from '../../Core/Errors/UnauthenticatedError.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { EmailService } from '../../Core/Email/EmailService.js';
import { UserRepository } from '../Data/UserRepository.js';
import { UserModel } from '../Data/UserModel.js';
import { AlreadyExistError } from '../../Core/Errors/AlreadyExistError.js';
import { SessionService, } from '../../Sessions/Services/SessionService.js';
import { UserAvatarModel } from '../Data/Relations/UserAvatarModel.js';
import { MentorAssignmentRepository } from '../Data/MentorAssignmentRepository.js';
import TypeORM from 'typeorm';
import { MentorAssignmentModel } from '../Data/Relations/MentorAssignmentModel.js';
import { SubjectRepository } from '../../Subjects/Data/SubjectRepository.js';
import { CantChangeRoleError } from '../Errors/CantChangeRoleError.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
import { TransferAssignedWorkService } from '../../AssignedWorks/Services/TransferAssignedWorkService.js';
import { NotificationService } from '../../Notifications/Services/NotificationService.js';
import { CourseAssignmentRepository } from '../../Courses/Data/CourseAssignmentRepository.js';
export class UserService {
    userRepository;
    emailService;
    sessionService;
    mentorAssignmentRepository;
    subjectRepository;
    transferAssignedWorkService;
    notificationService;
    courseAssignmentRepository;
    constructor() {
        this.userRepository = new UserRepository();
        this.emailService = new EmailService();
        this.sessionService = new SessionService();
        this.mentorAssignmentRepository = new MentorAssignmentRepository();
        this.subjectRepository = new SubjectRepository();
        this.transferAssignedWorkService = new TransferAssignedWorkService();
        this.notificationService = new NotificationService();
        this.courseAssignmentRepository = new CourseAssignmentRepository();
    }
    async assignMentor(studentId, mentorId, subjectId) {
        const student = await this.userRepository.findOne({
            id: studentId,
            role: 'student',
        });
        const mentor = await this.userRepository.findOne({
            id: mentorId,
            role: 'mentor',
        });
        const subject = await this.subjectRepository.findOne({ id: subjectId });
        if (!student || !mentor) {
            throw new NotFoundError('Ученик или куратор не найден.');
        }
        if (!subject) {
            throw new NotFoundError('Предмет не найден.');
        }
        if (student.isBlocked || mentor.isBlocked) {
            throw new UnauthenticatedError('Аккаунт куратора или ученика заблокирован.');
        }
        let mentorAssignment = await this.mentorAssignmentRepository.findOne({
            student: { id: studentId },
            subject: { id: subjectId },
        }, ['student', 'mentor', 'subject']);
        if (!mentorAssignment) {
            mentorAssignment = new MentorAssignmentModel({
                student,
                mentor,
                subject,
            });
            await this.mentorAssignmentRepository.create(mentorAssignment);
        }
        else {
            const oldMentor = mentorAssignment.mentor;
            mentorAssignment.mentor = mentor;
            await this.mentorAssignmentRepository.updateRaw(mentorAssignment);
            await this.notificationService.generateAndSend('user.mentor-removed-for-student', student.id, { mentor: oldMentor, subject });
        }
        await this.notificationService.generateAndSend('user.mentor-assigned-for-student', student.id, { mentor, subject });
        await this.notificationService.generateAndSend('user.mentor-assigned-for-mentor', mentor.id, { student, subject });
        await this.transferAssignedWorkService.transferNotCheckedWorks(student, mentor, subject);
    }
    async unassignMentor(studentId, subjectId) {
        const mentorAssignment = await this.mentorAssignmentRepository.findOne({
            student: { id: studentId },
            subject: { id: subjectId },
        }, ['student', 'mentor', 'subject']);
        if (!mentorAssignment) {
            throw new NotFoundError('Куратор не найден.');
        }
        await this.mentorAssignmentRepository.delete(mentorAssignment.id);
        await this.notificationService.generateAndSend('user.mentor-removed-for-student', studentId, { mentor: mentorAssignment.mentor, subject: mentorAssignment.subject });
        await this.notificationService.generateAndSend('user.mentor-removed-for-mentor', mentorAssignment.mentor.id, { student: mentorAssignment.student, subject: mentorAssignment.subject });
    }
    async getByUsername(username) {
        const user = await this.userRepository.findOne({ username }, [
            'courses',
            'avatar',
            'mentorAssignmentsAsMentor',
            'mentorAssignmentsAsMentor.student',
            'mentorAssignmentsAsMentor.mentor',
            'mentorAssignmentsAsMentor.subject',
            'mentorAssignmentsAsStudent.student',
            'mentorAssignmentsAsStudent.mentor',
            'mentorAssignmentsAsStudent.subject',
        ], undefined, {
            relationLoadStrategy: 'query',
        });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        const onlineStatus = await this.sessionService.getOnlineStatus(user.id);
        return {
            ...user,
            ...onlineStatus,
            password: undefined,
        };
    }
    async getUsers(pagination) {
        const relations = [];
        if (pagination?.relationsToLoad.includes('mentorAssignmentsAsStudent')) {
            relations.push('mentorAssignmentsAsStudent');
            relations.push('mentorAssignmentsAsStudent.subject');
            relations.push('mentorAssignmentsAsStudent.mentor');
        }
        return this.userRepository.search(undefined, pagination, relations);
    }
    async getStudentsOf(mentorId, pagination) {
        const { entities: mentorAssignations, meta } = await this.mentorAssignmentRepository.search({
            mentor: { id: mentorId },
            student: { id: TypeORM.Not(TypeORM.IsNull()) },
        }, pagination, ['student', 'subject']);
        const students = mentorAssignations.map((mentorAssignment) => ({
            ...mentorAssignment.student,
            subject: mentorAssignment.subject,
        }));
        return { entities: students, meta };
    }
    async getMentors(pagination) {
        return this.userRepository.search({ role: 'mentor' }, pagination);
    }
    async getTeachers(pagination) {
        return this.userRepository.search({ role: 'teacher' }, pagination);
    }
    async getStudents(pagination) {
        return this.userRepository.search({ role: 'student' }, pagination);
    }
    async getMentor(student, subjectId) {
        if (student.role !== 'student') {
            return null;
        }
        const mentorAssignmentsAsStudent = await this.mentorAssignmentRepository.findOne({
            student: { id: student.id },
            subject: { id: subjectId },
        }, ['mentor']);
        if (!mentorAssignmentsAsStudent) {
            return null;
        }
        return mentorAssignmentsAsStudent.mentor;
    }
    async update(id, data) {
        const existingUser = await this.userRepository.findOne({ id });
        if (!existingUser) {
            throw new NotFoundError();
        }
        const user = new UserModel({
            ...existingUser,
            ...data,
        });
        await this.userRepository.update(user);
    }
    async changePassword(id, passwordDTO, role) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        if (['student', 'mentor'].includes(role)) {
            if (!passwordDTO.oldPassword) {
                throw new UnauthorizedError('Старый пароль неверный');
            }
            if (!(await Hash.compare(passwordDTO.oldPassword, user.password))) {
                throw new UnauthorizedError('Неверный пароль.');
            }
        }
        user.password = await Hash.hash(passwordDTO.newPassword);
        await this.userRepository.update(user);
    }
    async changeRole(id, role) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        if (user.role !== 'student') {
            throw new CantChangeRoleError();
        }
        const mentorAssignment = await this.mentorAssignmentRepository.findOne({
            student: { id: user.id },
        });
        if (mentorAssignment) {
            throw new CantChangeRoleError('Нельзя изменить роль ученика, у которого есть куратор. Сначала открепите куратора.');
        }
        const courseAssignment = await this.courseAssignmentRepository.findOne({
            student: { id: user.id },
        });
        if (courseAssignment) {
            throw new CantChangeRoleError('Нельзя изменить роль ученика, который засписан хотя бы на один курс. Сначала открепите ученика со всех курсов.');
        }
        user.role = role;
        await this.userRepository.update(user);
        await this.sessionService.deleteSessionsForUser(user.id);
        await this.notificationService.generateAndSend('user.role-changed', user.id, { newRole: role });
    }
    async updateTelegram(id, data) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        user.telegramId = data.telegramId || null;
        user.telegramUsername = data.telegramUsername;
        if (!user.avatar && data.telegramAvatarUrl) {
            user.avatar = new UserAvatarModel({
                avatarType: 'telegram',
                telegramAvatarUrl: data.telegramAvatarUrl,
            });
        }
        else if (user.avatar && data.telegramAvatarUrl) {
            user.avatar.telegramAvatarUrl = data.telegramAvatarUrl;
        }
        await this.userRepository.update(user);
        await this.notificationService.generateAndSend('user.telegram-updated', user.id);
    }
    async block(id) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        user.isBlocked = true;
        await this.userRepository.update(user);
        await this.sessionService.deleteSessionsForUser(user.id);
    }
    async unblock(id) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        user.isBlocked = false;
        await this.userRepository.update(user);
    }
    async sendEmailUpdate(id, newEmail) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        const existingEmail = await this.userRepository.findOne({
            email: newEmail,
        });
        if (existingEmail) {
            throw new AlreadyExistError('Аккаунт с такой почтой уже существует.');
        }
        if (user.email === newEmail) {
            return;
        }
        user.newEmail = newEmail;
        const emailChangeToken = await this.getChangeEmailToken(user);
        await this.emailService.sendEmailChangeConfirmation(user.name, newEmail, user.username, emailChangeToken);
        await this.userRepository.update(user);
    }
    async cancelEmailUpdate(id) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        user.newEmail = null;
        await this.userRepository.update(user);
    }
    async verifyManual(username) {
        const user = await this.userRepository.findOne({ username });
        if (!user) {
            throw new NotFoundError();
        }
        user.verificationToken = null;
        await this.userRepository.update(user);
    }
    async confirmEmailUpdate(username, token) {
        const user = await this.userRepository.findOne({ username });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        if (!user.newEmail) {
            throw new NotFoundError('Смена почты не запрошена.');
        }
        if (!(await this.verifyChangeEmailToken(user, token))) {
            throw new UnauthorizedError('Неверный токен.');
        }
        user.email = user.newEmail;
        user.newEmail = null;
        await this.userRepository.update(user);
    }
    async delete(id, password) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError();
        }
        if (!(await Hash.compare(password, user.password))) {
            throw new UnauthorizedError('Неверный пароль.');
        }
        await this.mentorAssignmentRepository.deleteFromStudent(user.id);
        await this.courseAssignmentRepository.deleteFromStudent(user.id);
        // remove everything except works
        user.name = 'Deleted User';
        user.username = user.slug = `deleted-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        user.email = `deleted-${Math.random()
            .toString(36)
            .substr(2, 9)}@${Math.random().toString(36).substr(2, 9)}.com`;
        user.isBlocked = true;
        user.telegramId = null;
        user.telegramUsername = null;
        user.avatar = null;
        user.courses = [];
        user.courseAssignments = [];
        user.votedPolls = [];
        user.newEmail = null;
        user.verificationToken = null;
        user.sessions = [];
        await this.userRepository.update(user);
        await this.removeAssociatedMentorAssignments(user);
    }
    async getChangeEmailToken(user) {
        if (!user.newEmail) {
            return '-';
        }
        return Hash.hash(`${user.id}${user.email}${user.newEmail}`);
    }
    async verifyChangeEmailToken(user, token) {
        if (!user.newEmail) {
            return false;
        }
        return Hash.compare(`${user.id}${user.email}${user.newEmail}`, token);
    }
    async removeAssociatedMentorAssignments(user) {
        const conditions = [
            { student: { id: user.id } },
            { mentor: { id: user.id } },
        ];
        const { entities: assignments } = await this.mentorAssignmentRepository.find(conditions);
        for (const assignment of assignments) {
            await this.mentorAssignmentRepository.delete(assignment.id);
        }
    }
}
