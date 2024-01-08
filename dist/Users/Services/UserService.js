import { NotFoundError, UnauthenticatedError, JWT, Hash, AlreadyExistError, UnknownError, } from '../../core/index';
import { UserRepository } from '../Data/UserRepository';
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
        const user = await this.userRepository.findOne({
            username: credentials.username,
        });
        if (!user) {
            throw new UnauthenticatedError();
        }
        return {
            token: JWT.create({
                userId: user.id,
                username: user.username,
                role: user.role,
                permissions: user.forbidden || 0,
            }),
            user,
        };
    }
    async getBySlug(slug) {
        const user = await this.userRepository.findOne({ slug });
        if (!user) {
            throw new NotFoundError();
        }
        user.password = undefined;
        return user;
    }
    async update(user) {
        const existingUser = await this.userRepository.findOne({
            id: user.id,
        });
        if (!existingUser) {
            throw new NotFoundError();
        }
        await this.userRepository.update(user);
    }
    async delete(id) {
        await this.userRepository.delete(id);
    }
}
