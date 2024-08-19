import * as Hash from '../../Core/Security/hash.js';
import * as JWT from '../../Core/Security/jwt.js';
import { UnauthenticatedError } from '../../Core/Errors/UnauthenticatedError.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { AlreadyExistError } from '../../Core/Errors/AlreadyExistError.js';
import { UnknownError } from '../../Core/Errors/UnknownError.js';
import { EmailService } from '../../Core/Email/EmailService.js';
import { InvalidVerificationTokenError } from '../Errors/InvalidVerificationTokenError.js';
import { SessionService } from '../../Sessions/Services/SessionService.js';
import { UserRepository } from '../../Users/Data/UserRepository.js';
import { UserModel } from '../../Users/Data/UserModel.js';
export class AuthService {
    userRepository;
    emailService;
    sessionService;
    constructor() {
        this.userRepository = new UserRepository();
        this.emailService = new EmailService();
        this.sessionService = new SessionService();
    }
    async create(user) {
        user.password = await Hash.hash(user.password);
        try {
            await this.userRepository.create(user);
        }
        catch (error) {
            if (error?.code === '23505') {
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
        //await this.userRepository.setRandomMentor(user)
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
            throw new NotFoundError('Пользователь не найден.');
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
