import * as Hash from '../../Core/Security/hash.js';
import { UnauthenticatedError } from '../../Core/Errors/UnauthenticatedError.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { Service } from '../../Core/Services/Service.js';
import { EmailService } from '../../Core/Email/EmailService.js';
import { UserRepository } from '../Data/UserRepository.js';
import { UserModel } from '../Data/UserModel.js';
import { AlreadyExistError } from '../../Core/Errors/AlreadyExistError.js';
export class UserService extends Service {
    userRepository;
    emailService;
    constructor() {
        super();
        this.userRepository = new UserRepository();
        this.emailService = new EmailService();
    }
    async assignMentor(studentId, mentorId) {
        const student = await this.userRepository.findOne({ id: studentId });
        const mentor = await this.userRepository.findOne({ id: mentorId });
        if (!student || !mentor) {
            throw new NotFoundError();
        }
        if (student.isBlocked || mentor.isBlocked) {
            throw new UnauthenticatedError('Аккаунт куратора или студента заблокирован.');
        }
        student.mentor = mentorId;
        await this.userRepository.update(student);
    }
    async getByUsername(username) {
        const user = await this.userRepository.findOne({ username }, [
            'students',
            'courses',
            'courses.students',
            'mentor',
        ]);
        if (!user) {
            throw new NotFoundError();
        }
        return user;
    }
    async getUsers(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = UserModel.entriesToSearch();
        const relations = ['students', 'courses'];
        if (pagination.relationsToLoad.includes('mentor')) {
            relations.push('mentor');
        }
        const users = await this.userRepository.find(undefined, relations, pagination);
        const meta = await this.getRequestMeta(this.userRepository, undefined, pagination, relations);
        return { users, meta };
    }
    async getStudentsOf(mentorId, pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = UserModel.entriesToSearch();
        const relations = ['students'];
        const conditions = {
            mentor: { id: mentorId },
            role: 'student',
        };
        const students = await this.userRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.userRepository, conditions, pagination, relations);
        return { students, meta };
    }
    async getMentors(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = UserModel.entriesToSearch();
        const relations = ['students'];
        const conditions = { role: 'mentor' };
        const mentors = await this.userRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.userRepository, conditions, pagination, relations);
        return { mentors, meta };
    }
    async getTeachers(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = UserModel.entriesToSearch();
        const relations = [];
        const conditions = { role: 'teacher' };
        const teachers = await this.userRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.userRepository, conditions, pagination, relations);
        return { teachers, meta };
    }
    async getStudents(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = UserModel.entriesToSearch();
        const relations = ['mentor'];
        const conditions = { role: 'student' };
        const students = await this.userRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.userRepository, conditions, pagination, relations);
        return { students, meta };
    }
    async update(id, data, updaterRole) {
        const existingUser = await this.userRepository.findOne({ id });
        if (!existingUser) {
            throw new NotFoundError();
        }
        if (data.password)
            data.password = await Hash.hash(data.password);
        const user = new UserModel({
            ...existingUser,
            ...data,
            role: existingUser.role,
        });
        if (data.role &&
            data.role !== existingUser.role &&
            existingUser.role === 'student' &&
            ['teacher', 'admin'].includes(updaterRole)) {
            user.role = data.role;
        }
        const newUser = new UserModel({ ...existingUser, ...user });
        await this.userRepository.update(newUser);
    }
    async updateTelegram(id, data) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        user.telegramId = data.telegramId;
        user.telegramUsername = data.telegramUsername;
        user.telegramAvatarUrl = data.telegramAvatarUrl;
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
    async confirmEmailUpdate(username, token) {
        const user = await this.userRepository.findOne({ username });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        if (!user.newEmail) {
            throw new UnauthenticatedError('Смена почты не запрошена.');
        }
        const emailChangeToken = await this.getChangeEmailToken(user);
        if (emailChangeToken !== token) {
            throw new UnauthenticatedError('Неверный токен.');
        }
        user.email = user.newEmail;
        user.newEmail = null;
        await this.userRepository.update(user);
    }
    async delete(id) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError();
        }
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
        user.telegramAvatarUrl = '';
        user.mentor = null;
        user.students = [];
        user.courses = [];
        await this.userRepository.update(user);
    }
    async getChangeEmailToken(user) {
        if (!user.newEmail) {
            return '-';
        }
        return Hash.hash(`${user.id}${user.email}${user.newEmail}`);
    }
}
