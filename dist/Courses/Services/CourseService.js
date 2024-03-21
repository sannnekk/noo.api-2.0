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
        const courses = await this.courseRepository.find(conditions, undefined, pagination);
        const meta = await this.getRequestMeta(this.courseRepository, conditions, pagination, []);
        // Clear chapters and materials as they are not needed in the list
        for (const course of courses) {
            course.chapters = [];
        }
        return { courses, meta };
    }
    async getBySlug(slug) {
        const course = await this.courseRepository.findOne({ slug }, [
            'chapters.materials.work',
        ]);
        if (!course) {
            throw new NotFoundError();
        }
        return this.sortMaterials(course);
    }
    async getAssignedWorkToMaterial(materialSlug, userId) {
        const assignedWork = await this.assignedWorkRepository.findOne({
            studentId: userId,
            work: {
                material: {
                    slug: materialSlug,
                },
            },
        });
        return assignedWork;
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
    async assignMeWorks(courseSlug, userId) {
        const course = await this.courseRepository.findOne({
            slug: courseSlug,
        }, ['chapters.materials']);
        if (!course) {
            throw new NotFoundError('Курс не найден. Возможно, он был удален.');
        }
        const materials = (course.chapters || [])
            .flatMap((chapter) => chapter.materials)
            .filter(Boolean);
        await Promise.all(materials.map((material) => this.assignWorkToStudent(userId, material)));
    }
    async assignStudents(courseSlug, studentIds) {
        const course = await this.courseRepository.findOne({
            slug: courseSlug,
        }, ['chapters.materials']);
        if (!course) {
            throw new NotFoundError();
        }
        const newStudentIds = studentIds.filter((id) => !(course.studentIds || []).includes(id));
        course.students = studentIds.map((id) => ({ id }));
        try {
            await this.courseRepository.updateRaw(course);
        }
        catch (e) {
            throw new UnknownError('Не удалось обновить список учеников');
        }
        const materials = (course.chapters || [])
            .flatMap((chapter) => chapter.materials)
            .filter(Boolean);
        await Promise.all(materials.map((material) => this.assignWorkToStudents(newStudentIds, material)));
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
        await this.assignWorkToStudents(material.chapter?.course?.studentIds || [], material);
        await this.materialRepository.update(material);
    }
    async assignWorkToStudents(studentIds, material) {
        await Promise.all(studentIds.map((id) => this.assignWorkToStudent(id, material)));
    }
    async assignWorkToStudent(studentId, material) {
        if (!material.workId)
            return;
        try {
            await this.assignedWorkService.createWork({
                studentId,
                workId: material.workId,
                solveDeadlineAt: material.workSolveDeadline,
                checkDeadlineAt: material.workCheckDeadline,
            });
        }
        catch (e) { }
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
    sortMaterials(course) {
        if (!course.chapters)
            return course;
        course.chapters = this.sortChapters(course).chapters.map((chapter) => {
            chapter.materials = (chapter.materials || []).sort((a, b) => a.order - b.order);
            return chapter;
        });
        return course;
    }
    sortChapters(course) {
        course.chapters = (course.chapters || []).sort((a, b) => a.order - b.order);
        return course;
    }
}
