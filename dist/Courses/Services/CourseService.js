import { UserRepository } from '../../Users/Data/UserRepository.js';
import { CourseRepository } from './../Data/CourseRepository.js';
import { AlreadyExistError, NotFoundError, Pagination, Service, } from '../../core/index.js';
import { QueryFailedError } from 'typeorm';
import { CourseModel } from '../Data/CourseModel.js';
import { CourseMaterialRepository } from '../Data/CourseMaterialRepository.js';
import { AssignedWorkService } from '../../AssignedWorks/Services/AssignedWorkService.js';
export class CourseService extends Service {
    courseRepository;
    materialRepository;
    userRepository;
    assignedWorkService;
    constructor() {
        super();
        this.courseRepository = new CourseRepository();
        this.userRepository = new UserRepository();
        this.materialRepository = new CourseMaterialRepository();
        this.assignedWorkService = new AssignedWorkService();
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
        this.storeRequestMeta(this.courseRepository, conditions, [], pagination);
        // Clear chapters and materials as they are not needed in the list
        for (const course of courses) {
            course.chapters = [];
        }
        return courses;
    }
    async getBySlug(slug) {
        const course = await this.courseRepository.findOne({ slug }, [
            'chapters.materials.work',
            'students',
        ]);
        if (!course) {
            throw new NotFoundError();
        }
        return this.sortMaterials(course);
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
        const students = studentIds.length > 0
            ? await this.userRepository.find(studentIds.map((id) => ({ id })))
            : [];
        if (!course) {
            throw new NotFoundError();
        }
        course.students = students;
        await this.courseRepository.update(course);
    }
    async assignWorkToMaterial(materialSlug, workId, solveDeadline, checkDeadline) {
        const material = await this.materialRepository.findOne({
            slug: materialSlug,
        }, ['chapter.course.students.mentor']);
        if (!material) {
            throw new NotFoundError();
        }
        material.work = workId;
        material.workSolveDeadline = solveDeadline;
        material.workCheckDeadline = checkDeadline;
        for (const student of material.chapter?.course?.students || []) {
            if (!student.mentorId)
                continue;
            await this.assignedWorkService.createWork({
                studentId: student.id,
                workId,
                solveDeadlineAt: solveDeadline,
                checkDeadlineAt: checkDeadline,
            });
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
