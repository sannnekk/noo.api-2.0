import { NotFoundError, UnauthenticatedError, JWT, Hash, AlreadyExistError, UnknownError, Pagination, Service, EmailService, } from '../../core/index.js';
import { UserRepository } from '../Data/UserRepository.js';
import { UserModel } from '../Data/UserModel.js';
import { InvalidVerificationTokenError } from '../Errors/InvalidVerificationTokenError.js';
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
    async register(user) {
        // every user is a student at the moment of registration
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
            throw new AlreadyExistError('Польщователь с таким email уже существует.');
        }
        await this.create(user);
        await this.emailService.sendVerificationEmail(user.email, user.username, user.name, user.verificationToken);
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
        ], ['students', 'mentor']);
        if (!user ||
            !(await Hash.compare(credentials.password, user.password))) {
            throw new UnauthenticatedError();
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
        const newPassword = Math.random().toString(36).slice(-12);
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
        this.storeRequestMeta(this.userRepository, undefined, relations, pagination);
        return users;
    }
    async getStudentsOf(mentorId, pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = UserModel.entriesToSearch();
        const relations = ['students'];
        const conditions = {
            mentor: { id: mentorId },
            role: 'student',
        };
        const users = await this.userRepository.find(conditions, relations, pagination);
        this.storeRequestMeta(this.userRepository, conditions, relations, pagination);
        return users;
    }
    async getMentors(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = UserModel.entriesToSearch();
        const relations = ['students'];
        const conditions = { role: 'mentor' };
        const mentors = await this.userRepository.find(conditions, relations, pagination);
        this.storeRequestMeta(this.userRepository, conditions, relations, pagination);
        return mentors;
    }
    async getStudents(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = UserModel.entriesToSearch();
        const relations = ['mentor'];
        const conditions = { role: 'student' };
        const students = await this.userRepository.find(conditions, relations, pagination);
        this.storeRequestMeta(this.userRepository, conditions, relations, pagination);
        return students;
    }
    async update(user) {
        const existingUser = await this.userRepository.findOne({
            id: user.id,
        });
        if (!existingUser) {
            throw new NotFoundError();
        }
        if (user.password)
            user.password = await Hash.hash(user.password);
        user.createdAt = undefined;
        user.updatedAt = undefined;
        user.slug = undefined;
        if (existingUser.role !== 'student') {
            user.role = undefined;
        }
        else if (user.role) {
            user.coursesAsStudent = [];
            user.mentor = null;
        }
        await this.userRepository.update(user);
    }
    async delete(id) {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundError();
        }
        user.name = 'Deleted User';
        user.username = user.slug =
            'deleted-' + Math.random().toString(36).substr(2, 9);
        user.email = '';
        user.isBlocked = true;
        user.telegramId = undefined;
        user.telegramUsername = undefined;
        await this.userRepository.update(user);
    }
}
