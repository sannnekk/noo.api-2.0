import { Pagination } from './../../Core/Data/Pagination.js';
import { NotFoundError, UnauthenticatedError, JWT, Hash, AlreadyExistError, UnknownError, WrongRoleError, } from '../../core/index.js';
import { UserRepository } from '../Data/UserRepository.js';
export class UserService {
    userRepository;
    constructor() {
        this.userRepository = new UserRepository();
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
        user.role = 'student';
        await this.create(user);
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
    async getBySlug(slug) {
        const user = await this.userRepository.findOne({ slug }, [
            'students',
            'courses',
            'courses.students',
            'mentor',
        ]);
        if (!user) {
            throw new NotFoundError();
        }
        user.password = undefined;
        return user;
    }
    async getUsers(pagination, role, userId) {
        let condition;
        switch (role) {
            case 'admin':
            case 'teacher':
                condition = undefined;
                break;
            case 'mentor':
                condition = { mentor: { id: userId } };
                break;
            default:
                throw new WrongRoleError();
        }
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = ['username', 'name', 'email'];
        const users = await this.userRepository.find(condition, ['students', 'courses'], pagination);
        return users.map((user) => {
            user.password = undefined;
            return user;
        });
    }
    async getMentors(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = ['username', 'name', 'email'];
        return await this.userRepository.find({ role: 'mentor' }, ['students'], pagination);
    }
    async getStudents(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = ['username', 'name', 'email'];
        return await this.userRepository.find({ role: 'student' }, ['mentor'], pagination);
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
