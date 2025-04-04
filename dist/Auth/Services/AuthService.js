import * as Hash from '../../Core/Security/hash.js';
import * as JWT from '../../Core/Security/jwt.js';
import { UnauthenticatedError } from '../../Core/Errors/UnauthenticatedError.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { AlreadyExistError } from '../../Core/Errors/AlreadyExistError.js';
import { EmailService } from '../../Core/Email/EmailService.js';
import { InvalidVerificationTokenError } from '../Errors/InvalidVerificationTokenError.js';
import { SessionService } from '../../Sessions/Services/SessionService.js';
import { UserRepository } from '../../Users/Data/UserRepository.js';
import { UserModel } from '../../Users/Data/UserModel.js';
import { NotificationService } from '../../Notifications/Services/NotificationService.js';
export class AuthService {
    userRepository;
    emailService;
    sessionService;
    notificationService;
    constructor() {
        this.userRepository = new UserRepository();
        this.emailService = new EmailService();
        this.sessionService = new SessionService();
        this.notificationService = new NotificationService();
    }
    async create(user) {
        user.password = await Hash.hash(user.password);
        await this.userRepository.create(user);
    }
    async register(registerDTO) {
        // every user is a student at the moment of registration
        const user = new UserModel(registerDTO);
        user.role = 'student';
        user.verificationToken = await Hash.hash(Math.random().toString());
        const usernameExists = await this.userRepository.usernameExists(user.username);
        if (usernameExists) {
            throw new AlreadyExistError('Этот никнейм уже занят.');
        }
        const emailExists = await this.userRepository.emailExists(user.email);
        if (emailExists) {
            throw new AlreadyExistError('Пользователь с таким email уже существует.');
        }
        await this.create(user);
        await this.notificationService.generateAndSend('welcome', user.id);
        await this.emailService.sendVerificationEmail(user.email, user.username, user.name, user.verificationToken);
    }
    async checkUsername(username) {
        return this.userRepository.usernameExists(username);
    }
    async verify(username, token) {
        const user = await this.userRepository.findOne({
            username,
        });
        if (!user) {
            throw new NotFoundError('Пользователь не найден.');
        }
        if (user.verificationToken !== token) {
            throw new InvalidVerificationTokenError();
        }
        user.verificationToken = null;
        await this.userRepository.update(user);
        await this.notificationService.generateAndSend('user.email-verified', user.id);
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
    async login(credentials, context) {
        const user = await this.userRepository.findOne([
            {
                username: credentials.usernameOrEmail,
            },
            {
                email: credentials.usernameOrEmail,
            },
        ]);
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
        let session = await this.sessionService.getCurrentSession(context, user.id);
        if (!session) {
            session = await this.sessionService.createSession(context, user.id);
            await this.notificationService.generateAndSend('user.login', user.id, {
                session,
            });
        }
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            permissions: user.forbidden || 0,
            isBlocked: user.isBlocked,
            sessionId: session.id,
        };
        return {
            token: JWT.create(payload),
            payload,
            user,
        };
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({ email });
        if (!user) {
            throw new NotFoundError('Пользователь с таким email не найден.');
        }
        if (user.isBlocked) {
            throw new UnauthenticatedError('Этот аккаунт заблокирован.');
        }
        if (user.verificationToken) {
            throw new UnauthenticatedError('Этот аккаунт не подтвержден. Перейдите по ссылке в письме, отправленном на вашу почту, чтобы подтвердить регистрацию.');
        }
        const newPassword = this.generatePassword();
        user.password = await Hash.hash(newPassword);
        await this.userRepository.update(user);
        await this.emailService.sendForgotPasswordEmail(user.email, user.name, newPassword);
    }
    /**
     * Generates a random password
     * Requirements:
     * - 12 characters
     * - 1 uppercase letter
     * - 1 lowercase letter
     * - 1 number
     */
    generatePassword() {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const characters = uppercase + lowercase + numbers;
        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        for (let i = 0; i < 9; i++) {
            password += characters[Math.floor(Math.random() * characters.length)];
        }
        return password;
    }
}
