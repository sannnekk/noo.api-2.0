import { Repository } from '../../Core/Data/Repository.js';
import { CourseModel } from './CourseModel.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
export class CourseRepository extends Repository {
    constructor() {
        super(CourseModel);
    }
    async getAuthors(courseId) {
        return this.queryBuilder().relation('authors').of(courseId).loadMany();
    }
    async getEditors(courseId) {
        return this.queryBuilder().relation('editors').of(courseId).loadMany();
    }
    async updateCourse(id, course) {
        const existingCourse = await this.findOne({ id });
        if (!existingCourse) {
            throw new NotFoundError('Курс не найден');
        }
        const newCourse = new CourseModel({ ...existingCourse, ...course });
        return this.repository.manager.transaction(async (manager) => {
            for (const chapter of newCourse.chapters ?? []) {
                chapter.course = { id: newCourse.id };
                await this.saveChapter(manager, chapter);
            }
            await manager.save(newCourse);
        });
    }
    async saveChapter(manager, chapter, depth = 0) {
        if (depth > 3) {
            throw new Error('Слишком глубокая вложенность глав');
        }
        await manager.save(chapter);
        for (const nestedChapter of chapter.chapters ?? []) {
            ;
            nestedChapter.parentChapter = {
                id: chapter.id,
            };
            nestedChapter.course = null;
            await this.saveChapter(manager, nestedChapter, depth + 1);
        }
        for (const material of chapter.materials ?? []) {
            material.chapter = { id: chapter.id };
            await manager.save(material);
        }
    }
}
