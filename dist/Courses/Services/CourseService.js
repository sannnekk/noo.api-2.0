import { UserRepository } from '../../Users/Data/UserRepository.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { UnknownError } from '../../Core/Errors/UnknownError.js';
import TypeORM from 'typeorm';
import { AssignedWorkRepository } from '../../AssignedWorks/Data/AssignedWorkRepository.js';
import { CourseMaterialRepository } from '../Data/CourseMaterialRepository.js';
import { CourseModel } from '../Data/CourseModel.js';
import { CourseRepository } from '../Data/CourseRepository.js';
import { CourseChapterModel } from '../Data/Relations/CourseChapterModel.js';
import { CourseIsEmptyError } from '../Errors/CourseIsEmptyError.js';
import { WorkRepository } from '../../Works/Data/WorkRepository.js';
import { WorkIsFromAnotherSubjectError } from '../Errors/WorkIsFromAnotherSubjectError.js';
import { CourseAssignmentRepository } from '../Data/CourseAssignmentRepository.js';
import { CourseAssignmentModel } from '../Data/Relations/CourseAssignmentModel.js';
import { CourseChapterRepository } from '../Data/CourseChapterRepository.js';
import { CourseMaterialReactionRepository } from '../Data/CourseMaterialReactionRepository.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
export class CourseService {
    courseRepository;
    chapterRepository;
    courseAssignmentRepository;
    materialRepository;
    materialReactionRepository;
    userRepository;
    assignedWorkRepository;
    workRepository;
    constructor() {
        this.courseRepository = new CourseRepository();
        this.chapterRepository = new CourseChapterRepository();
        this.courseAssignmentRepository = new CourseAssignmentRepository();
        this.userRepository = new UserRepository();
        this.materialRepository = new CourseMaterialRepository();
        this.materialReactionRepository = new CourseMaterialReactionRepository();
        this.assignedWorkRepository = new AssignedWorkRepository();
        this.workRepository = new WorkRepository();
    }
    async get(pagination) {
        return this.courseRepository.search(undefined, pagination);
    }
    async getOwn(pagination, userId) {
        return this.courseRepository.search({
            authors: {
                id: userId,
            },
        }, pagination);
    }
    async getStudentCourseAssignments(studentId, pagination) {
        return this.courseAssignmentRepository.search({
            student: {
                id: studentId,
            },
        }, pagination, ['course', 'course.images', 'assigner']);
    }
    async getBySlug(slug, userId, role) {
        const course = await this.courseRepository.findOne({ slug }, ['authors', 'authors.avatar'], undefined, {
            relationLoadStrategy: 'query',
        });
        if (!course) {
            throw new NotFoundError('Курс не найден');
        }
        if (role === 'student') {
            const courseAssignment = await this.courseAssignmentRepository.findOne({
                student: { id: userId },
                course: { id: course.id },
            });
            if (!courseAssignment) {
                throw new UnauthorizedError('Вы не записаны на этот курс');
            }
        }
        let condition = {
            course: { id: course.id },
        };
        if (role === 'student' || role === 'mentor') {
            condition = {
                ...condition,
                isActive: true,
                materials: {
                    isActive: true,
                },
            };
        }
        const chapters = await this.chapterRepository.findAll(condition, ['materials', 'materials.files', 'materials.work', 'materials.poll'], {
            order: 'ASC',
            materials: {
                order: 'ASC',
            },
        }, {
            joinStrategy: 'query',
        });
        if (chapters.length === 0) {
            throw new CourseIsEmptyError();
        }
        course.chapters = chapters;
        if (role === 'teacher' || role === 'admin') {
            course.studentCount = await this.courseAssignmentRepository.count({
                course: { id: course.id },
            });
        }
        if (role === 'student') {
            await this.addMyReactionToMaterials(course, userId);
        }
        return course;
    }
    async getStudentListWithAssignments(courseId, pagination) {
        return this.userRepository.getStudentsWithAssignments(courseId, pagination);
    }
    async archive(assignmentId, studentId) {
        const assignment = await this.courseAssignmentRepository.findOne({
            id: assignmentId,
            student: { id: studentId },
        });
        if (!assignment) {
            throw new NotFoundError('Курс не найден');
        }
        assignment.isArchived = true;
        await this.courseAssignmentRepository.update(assignment);
    }
    async unarchive(assignmentId, studentId) {
        const assignment = await this.courseAssignmentRepository.findOne({
            id: assignmentId,
            student: { id: studentId },
        });
        if (!assignment) {
            throw new NotFoundError('Курс не найден');
        }
        assignment.isArchived = false;
        await this.courseAssignmentRepository.update(assignment);
    }
    async toggleReaction(materialId, userId, reaction) {
        const material = await this.materialRepository.findOne({
            id: materialId,
        });
        if (!material) {
            throw new NotFoundError('Материал не найден');
        }
        await this.materialReactionRepository.toggleReaction(materialId, userId, reaction);
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
    async addStudents(courseSlug, studentIds, assignerId) {
        const existingAssignments = await this.courseAssignmentRepository.findAll({
            course: {
                slug: courseSlug,
            },
            student: { id: TypeORM.In(studentIds) },
        });
        const studentIdsToAdd = studentIds.filter((studentId) => {
            return !existingAssignments.some((assignment) => assignment.studentId === studentId);
        });
        if (studentIdsToAdd.length === 0) {
            return;
        }
        const course = await this.courseRepository.findOne({ slug: courseSlug });
        if (!course) {
            throw new NotFoundError('Курс не найден');
        }
        const assignments = studentIdsToAdd.map((studentId) => {
            return new CourseAssignmentModel({
                student: { id: studentId },
                course: { id: course.id },
                assigner: { id: assignerId },
            });
        });
        await this.courseAssignmentRepository.createMany(assignments);
    }
    async addStudentsViaEmails(courseSlug, studentEmails, assignerId) {
        const userIds = await this.userRepository.getIdsFromEmails(studentEmails, {
            role: 'student',
        });
        // Add students if they are not already in the course
        await this.addStudents(courseSlug, userIds, assignerId);
    }
    async removeStudents(courseSlug, studentIds) {
        const course = await this.courseRepository.findOne({ slug: courseSlug });
        if (!course) {
            throw new NotFoundError('Курс не найден');
        }
        await this.courseAssignmentRepository.deleteWhere({
            course: { id: course.id },
            student: { id: TypeORM.In(studentIds) },
        });
    }
    async removeStudentsViaEmails(courseSlug, studentEmails) {
        const userIds = await this.userRepository.getIdsFromEmails(studentEmails, {
            role: 'student',
        });
        await this.removeStudents(courseSlug, userIds);
    }
    async assignWorkToMaterial(materialSlug, workId, solveDeadline, checkDeadline) {
        const material = await this.materialRepository.findOne({
            slug: materialSlug,
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
        material.workSolveDeadline = solveDeadline || null;
        material.workCheckDeadline = checkDeadline || null;
        await this.materialRepository.update(material);
    }
    async unassignWorkFromMaterial(materialSlug) {
        const material = await this.materialRepository.findOne({
            slug: materialSlug,
        });
        if (!material) {
            throw new NotFoundError('Материал не найден');
        }
        material.work = null;
        material.workSolveDeadline = null;
        material.workCheckDeadline = null;
        await this.materialRepository.update(material);
    }
    async create(courseDTO, authorId) {
        const author = await this.userRepository.findOne({ id: authorId });
        if (!author) {
            throw new NotFoundError('Пользователь не найден');
        }
        const course = new CourseModel(courseDTO);
        course.authors = [author];
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
        await this.courseRepository.delete(id);
    }
    async addMyReactionToMaterials(course, userId) {
        if (!course.chapters) {
            return;
        }
        const materials = course
            .chapters.map((chapter) => chapter.materials)
            .flat();
        const reactions = await this.materialReactionRepository.getMyReactions(userId, materials.filter(Boolean).map((material) => material.id));
        materials.forEach((material) => {
            if (material) {
                const reaction = reactions.find(({ materialId }) => materialId === material.id);
                if (reaction) {
                    material.myReaction = reaction.reaction;
                }
            }
        });
    }
}
