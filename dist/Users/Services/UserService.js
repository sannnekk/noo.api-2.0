import * as Hash from '../../Core/Security/hash.js';
import * as JWT from '../../Core/Security/jwt.js';
import { UnauthenticatedError } from '../../core/Errors/UnauthenticatedError.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { AlreadyExistError } from '../../Core/Errors/AlreadyExistError.js';
import { UnknownError } from '../../Core/Errors/UnknownError.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { Service } from '../../Core/Services/Service.js';
import { EmailService } from '../../Core/Email/EmailService.js';
import { UserRepository } from '../Data/UserRepository.js';
import { UserModel } from '../Data/UserModel.js';
import { InvalidVerificationTokenError } from '../Errors/InvalidVerificationTokenError.js';
import { v4 as uuid } from 'uuid';
export class UserService extends Service {
    userRepository;
    emailService;
    constructor() {
        super();
        this.userRepository = new UserRepository();
        this.emailService = new EmailService();
    }
    async create(user) {
        user.password = await Hash.hash(user.password);
        try {
            await this.userRepository.create(user);
        }
        catch (error) {
            if (error.code === '23505') {
                throw new AlreadyExistError();
            }
            throw new UnknownError();
        }
    }
    async register(registerDTO) {
        // every user is a student at the moment of registration
        const user = new UserModel(registerDTO);
        user.role = 'student';
        user.verificationToken = await Hash.hash(Math.random().toString());
        const existingUsername = await this.userRepository.findOne({
            username: user.username,
        });
        if (existingUsername) {
            throw new AlreadyExistError('Этот никнейм уже занят.');
        }
        const existingEmail = await this.userRepository.findOne({
            email: user.email,
        });
        if (existingEmail) {
            throw new AlreadyExistError('Пользователь с таким email уже существует.');
        }
        await this.create(user);
        await this.emailService.sendVerificationEmail(user.email, user.username, user.name, user.verificationToken);
    }
    async checkUsername(username) {
        const user = await this.userRepository.findOne({ username });
        return user !== null;
    }
    async verify(username, token) {
        const user = await this.userRepository.findOne({
            username,
        });
        if (!user) {
            throw new NotFoundError();
        }
        if (user.verificationToken !== token) {
            throw new InvalidVerificationTokenError();
        }
        user.verificationToken = null;
        await this.userRepository.update(user);
    }
    async verifyManual(username) {
        const user = await this.userRepository.findOne({
            username,
        });
        if (!user) {
            throw new NotFoundError();
        }
        if (!user.verificationToken) {
            throw new UnknownError('Этот аккаунт уже подтвержден.');
        }
        user.verificationToken = null;
        await this.userRepository.update(user);
    }
    async resendVerification(email) {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new NotFoundError('Пользователь с таким email не найден.');
        }
        if (!user.verificationToken) {
            throw new UnauthenticatedError('Этот аккаунт уже подтвержден. Попробуйте войти или воспользуйтесь кнопкой "Забыл пароль".');
        }
        await this.emailService.sendVerificationEmail(user.email, user.username, user.name, user.verificationToken);
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
    async login(credentials) {
        const user = await this.userRepository.findOne([
            {
                username: credentials.usernameOrEmail,
            },
            {
                email: credentials.usernameOrEmail,
            },
        ], ['mentor']);
        if (!user) {
            throw new UnauthenticatedError('Неверный логин или пароль');
        }
        if (!(await Hash.compare(credentials.password, user.password))) {
            throw new UnauthenticatedError('Неверный логин или пароль.');
        }
        if (user.isBlocked) {
            throw new UnauthenticatedError('Этот аккаунт заблокирован.');
        }
        if (user.verificationToken) {
            throw new UnauthenticatedError('Этот аккаунт не подтвержден. Перейдите по ссылке в письме, отправленном на вашу почту, чтобы подтвердить регистрацию.');
        }
        return {
            token: JWT.create({
                userId: user.id,
                username: user.username,
                role: user.role,
                permissions: user.forbidden || 0,
                isBlocked: user.isBlocked,
            }),
            user,
        };
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new NotFoundError();
        }
        if (user.isBlocked) {
            throw new UnauthenticatedError('Этот аккаунт заблокирован.');
        }
        if (user.verificationToken) {
            throw new UnauthenticatedError('Этот аккаунт не подтвержден. Перейдите по ссылке в письме, отправленном на вашу почту, чтобы подтвердить регистрацию.');
        }
        const newPassword = uuid();
        user.password = await Hash.hash(newPassword);
        await this.userRepository.update(user);
        await this.emailService.sendForgotPasswordEmail(user.email, user.name, newPassword);
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
    async delete(id) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError();
        }
        user.name = 'Deleted User';
        user.username = user.slug =
            'deleted-' + Math.random().toString(36).substr(2, 9);
        user.email =
            'deleted-' +
                Math.random().toString(36).substr(2, 9) +
                '@' +
                Math.random().toString(36).substr(2, 9) +
                '.com';
        user.isBlocked = true;
        user.telegramId = null;
        user.telegramUsername = null;
        await this.userRepository.update(user);
    }
}
