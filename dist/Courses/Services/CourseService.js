import { UserRepository } from '../../Users/Data/UserRepository.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { UnknownError } from '../../Core/Errors/UnknownError.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import TypeORM from 'typeorm';
import { AssignedWorkRepository } from '../../AssignedWorks/Data/AssignedWorkRepository.js';
import { CourseMaterialRepository } from '../Data/CourseMaterialRepository.js';
import { CourseModel } from '../Data/CourseModel.js';
import { CourseRepository } from '../Data/CourseRepository.js';
import { CourseChapterModel } from '../Data/Relations/CourseChapterModel.js';
import { CourseIsEmptyError } from '../Errors/CourseIsEmptyError.js';
import { WorkRepository } from '../../Works/Data/WorkRepository.js';
import { WorkIsFromAnotherSubjectError } from '../Errors/WorkIsFromAnotherSubjectError.js';
export class CourseService {
    courseRepository;
    materialRepository;
    userRepository;
    assignedWorkRepository;
    workRepository;
    constructor() {
        this.courseRepository = new CourseRepository();
        this.userRepository = new UserRepository();
        this.materialRepository = new CourseMaterialRepository();
        this.assignedWorkRepository = new AssignedWorkRepository();
        this.workRepository = new WorkRepository();
    }
    async get(pagination, userId, userRole) {
        pagination = new Pagination().assign(pagination);
        let conditions;
        if (userRole === 'student') {
            conditions = {
                students: {
                    id: userId,
                },
            };
        }
        const relations = ['author'];
        return this.courseRepository.search(conditions, pagination, relations);
    }
    async getStudentCourses(studentId, pagination) {
        return this.courseRepository.search({
            students: {
                id: studentId,
            },
        }, pagination);
    }
    async getBySlug(slug, role) {
        const condition = {
            slug,
            chapters: role === 'student'
                ? {
                    isActive: true,
                    materials: {
                        isActive: true,
                    },
                }
                : undefined,
        };
        const course = await this.courseRepository.findOne(condition, ['chapters.materials.work', 'author', 'chapters.materials.poll'], {
            chapters: {
                order: 'ASC',
                materials: {
                    order: 'ASC',
                    files: {
                        order: 'ASC',
                    },
                },
            },
        });
        if (!course) {
            const courseExists = await this.courseRepository.findOne({ slug });
            if (!courseExists) {
                throw new NotFoundError('Курс не найден');
            }
            else {
                throw new CourseIsEmptyError();
            }
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
    async addStudents(courseSlug, studentIds) {
        const queryBuilder = this.courseRepository.queryBuilder();
        const course = await this.courseRepository.findOne({ slug: courseSlug });
        if (!course) {
            throw new NotFoundError('Курс не найден');
        }
        await queryBuilder
            .relation(CourseModel, 'students')
            .of(course)
            .add(studentIds);
    }
    async addStudentsViaEmails(courseSlug, studentEmails) {
        const queryBuilder = this.courseRepository.queryBuilder();
        const course = await this.courseRepository.findOne({ slug: courseSlug });
        if (!course) {
            throw new NotFoundError('Курс не найден');
        }
        const userIds = await this.userRepository.getIdsFromEmails(studentEmails, {
            role: 'student',
        });
        // Add students if they are not already in the course
        const studentsToAdd = userIds.filter((id) => !course.studentIds.some((studentId) => studentId === id));
        if (studentsToAdd.length > 0) {
            await queryBuilder
                .relation(CourseModel, 'students')
                .of(course)
                .add(studentsToAdd);
        }
    }
    async removeStudents(courseSlug, studentIds) {
        const queryBuilder = this.courseRepository.queryBuilder();
        const course = await this.courseRepository.findOne({ slug: courseSlug });
        if (!course) {
            throw new NotFoundError('Курс не найден');
        }
        await queryBuilder
            .relation(CourseModel, 'students')
            .of(course)
            .remove(studentIds);
    }
    async assignWorkToMaterial(materialSlug, workId, solveDeadline, checkDeadline) {
        const material = await this.materialRepository.findOne({
            slug: materialSlug,
            chapter: {
                id: TypeORM.Not(TypeORM.IsNull()),
                course: { id: TypeORM.Not(TypeORM.IsNull()) },
            },
        }, ['chapter.course']);
        const work = await this.workRepository.findOne({
            id: workId,
        });
        if (!work) {
            throw new NotFoundError('Работа не найдена');
        }
        if (!material) {
            throw new NotFoundError('Материал не найден');
        }
        if (material.chapter?.course?.subjectId !== work.subjectId) {
            throw new WorkIsFromAnotherSubjectError();
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
            throw new UnknownError();
        }
    }
    async createChapter(courseSlug, chapter) {
        const course = await this.courseRepository.findOne({ slug: courseSlug }, [
            'chapters',
        ]);
        if (!course) {
            throw new NotFoundError();
        }
        course.chapters.push(new CourseChapterModel(chapter));
        await this.courseRepository.update(course);
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
