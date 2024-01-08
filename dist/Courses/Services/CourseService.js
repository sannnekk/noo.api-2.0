import { UserRepository } from '../../Users/Data/UserRepository';
import { CourseRepository } from './../Data/CourseRepository';
import { AlreadyExistError, NotFoundError } from '../../core/index';
import { QueryFailedError } from 'typeorm';
import { CourseModel } from '../Data/CourseModel';
export class CourseService {
    courseRepository;
    userRepository;
    constructor() {
        this.courseRepository = new CourseRepository();
        this.userRepository = new UserRepository();
    }
    async get(pagination) {
        return this.courseRepository.find(undefined, undefined, pagination);
    }
    async getBySlug(slug) {
        const course = await this.courseRepository.findOne({ slug });
        if (!course) {
            throw new NotFoundError();
        }
        return course;
    }
    async update(course) {
        const foundCourse = await this.courseRepository.findOne({
            id: course.id,
        });
        if (!foundCourse) {
            throw new NotFoundError();
        }
        const newCourse = new CourseModel({ ...foundCourse, ...course });
        await this.courseRepository.update(newCourse);
    }
    async create(course, authorId) {
        const author = await this.userRepository.findOne({ id: authorId });
        course.author = author;
        try {
            await this.courseRepository.create(course);
        }
        catch (error) {
            if (error instanceof QueryFailedError) {
                throw new AlreadyExistError();
            }
        }
    }
    async delete(id) {
        await this.courseRepository.delete(id);
    }
}
