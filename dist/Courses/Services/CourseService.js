import { UserRepository } from '../../Users/Data/UserRepository.js';
import { CourseRepository } from './../Data/CourseRepository.js';
import { AlreadyExistError } from '../../Core/Errors/AlreadyExistError.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { UnknownError } from '../../Core/Errors/UnknownError.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { Service } from '../../Core/Services/Service.js';
import { QueryFailedError } from 'typeorm';
import { CourseModel } from '../Data/CourseModel.js';
import { CourseMaterialRepository } from '../Data/CourseMaterialRepository.js';
import { AssignedWorkService } from '../../AssignedWorks/Services/AssignedWorkService.js';
import { AssignedWorkRepository } from '../../AssignedWorks/Data/AssignedWorkRepository.js';
export class CourseService extends Service {
    courseRepository;
    materialRepository;
    userRepository;
    assignedWorkService;
    assignedWorkRepository;
    constructor() {
        super();
        this.courseRepository = new CourseRepository();
        this.userRepository = new UserRepository();
        this.materialRepository = new CourseMaterialRepository();
        this.assignedWorkService = new AssignedWorkService();
        this.assignedWorkRepository = new AssignedWorkRepository();
    }
    async get(pagination, userId, userRole) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = CourseModel.entriesToSearch();
        let conditions = undefined;
        if (userRole === 'student') {
            conditions = {
                students: {
                    id: userId,
                },
            };
        }
        const relations = ['author'];
        const courses = await this.courseRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.courseRepository, conditions, pagination, relations);
        // Clear chapters, students and materials as they are not needed in the list
        for (const course of courses) {
            course.chapters = [];
            course.studentIds = [];
        }
        return { courses, meta };
    }
    async getBySlug(slug) {
        const course = await this.courseRepository.findOne({ slug }, ['chapters.materials.work', 'author'], {
            chapters: {
                order: 'ASC',
                materials: {
                    order: 'ASC',
                },
            },
        });
        if (!course) {
            throw new NotFoundError();
        }
        return course;
    }
    async getAssignedWorkToMaterial(materialSlug, userId) {
        const assignedWork = await this.assignedWorkRepository.findOne({
            student: {
                id: userId,
            },
            work: {
                materials: {
                    slug: materialSlug,
                },
            },
        });
        return assignedWork;
    }
    async update(id, course) {
        const foundCourse = await this.courseRepository.findOne({ id });
        if (!foundCourse) {
            throw new NotFoundError('Курс не найден');
        }
        const newCourse = new CourseModel({ ...foundCourse, ...course });
        await this.courseRepository.update(newCourse);
    }
    async assignStudents(courseSlug, studentIds) {
        const course = await this.courseRepository.findOne({
            slug: courseSlug,
        }, ['chapters.materials']);
        if (!course) {
            throw new NotFoundError();
        }
        course.students = studentIds.map((id) => ({ id }));
        try {
            await this.courseRepository.updateRaw(course);
        }
        catch (e) {
            throw new UnknownError('Не удалось обновить список учеников');
        }
    }
    async assignWorkToMaterial(materialSlug, workId, solveDeadline, checkDeadline) {
        const material = await this.materialRepository.findOne({
            slug: materialSlug,
        }, ['chapter.course']);
        if (!material) {
            throw new NotFoundError();
        }
        material.work = { id: workId };
        material.workId = workId;
        material.workSolveDeadline = solveDeadline;
        material.workCheckDeadline = checkDeadline;
        await this.materialRepository.update(material);
    }
    async create(courseDTO, authorId) {
        const author = await this.userRepository.findOne({ id: authorId });
        if (!author) {
            throw new NotFoundError('Пользователь не найден');
        }
        const course = new CourseModel(courseDTO);
        try {
            await this.courseRepository.create(course);
        }
        catch (error) {
            if (error instanceof QueryFailedError) {
                throw new AlreadyExistError();
            }
            throw new UnknownError();
        }
    }
    async delete(id) {
        const course = await this.courseRepository.findOne({
            id,
        });
        if (!course) {
            throw new NotFoundError();
        }
        course.students = [];
        await this.courseRepository.update(course);
        await this.courseRepository.delete(id);
    }
}
