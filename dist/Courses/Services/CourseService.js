import { UserRepository } from '../../Users/Data/UserRepository';
import { CourseRepository } from './../Data/CourseRepository';
import { AlreadyExistError, NotFoundError, Pagination } from '../../core/index';
import { QueryFailedError } from 'typeorm';
import { CourseModel } from '../Data/CourseModel';
import { CourseMaterialRepository } from '../Data/CourseMaterialRepository';
import { AssignedWorkService } from '../../AssignedWorks/Services/AssignedWorkService';
export class CourseService {
    courseRepository;
    materialRepository;
    userRepository;
    assignedWorkService;
    constructor() {
        this.courseRepository = new CourseRepository();
        this.userRepository = new UserRepository();
        this.materialRepository = new CourseMaterialRepository();
        this.assignedWorkService = new AssignedWorkService();
    }
    async get(pagination, userId, userRole) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = ['name', 'description'];
        if (userRole !== 'student') {
            return await this.courseRepository.find(undefined, undefined, pagination);
        }
        const user = await this.userRepository.findOne({ id: userId }, [
            'coursesAsStudent',
        ]);
        return user?.coursesAsStudent || [];
    }
    async getBySlug(slug) {
        const course = await this.courseRepository.findOne({ slug }, [
            'chapters.materials.work',
            'students',
        ]);
        if (!course) {
            throw new NotFoundError();
        }
        return course;
    }
    async getAssignedWorkToMaterial(materialSlug, userId) {
        const user = await this.userRepository.findOne({
            id: userId,
        }, ['assignedWorksAsStudent.work.materials']);
        if (!user)
            return null;
        return (user.assignedWorksAsStudent?.find((assignedWork) => assignedWork.work?.materials?.some((material) => material.slug === materialSlug)) || null);
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
    async assignStudents(courseSlug, studentIds) {
        const course = await this.courseRepository.findOne({
            slug: courseSlug,
        });
        const students = await this.userRepository.find(studentIds.map((id) => ({ id })));
        if (!course) {
            throw new NotFoundError();
        }
        course.students = students;
        await this.courseRepository.update(course);
    }
    async assignWorkToMaterial(materialSlug, workId) {
        const material = await this.materialRepository.findOne({
            slug: materialSlug,
        }, ['chapter.course.students.mentor']);
        if (!material) {
            throw new NotFoundError();
        }
        material.work = workId;
        for (const student of material.chapter?.course?.students || []) {
            if (!student.mentorId)
                continue;
            await this.assignedWorkService.createWork({
                studentId: student.id,
                workId,
            }, student.mentorId);
        }
        await this.materialRepository.update(material);
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
