import { SubjectRepository } from '../Data/SubjectRepository.js';
export class SubjectService {
    subjectRepository;
    constructor() {
        this.subjectRepository = new SubjectRepository();
    }
    async getSubjects(pagination) {
        return this.subjectRepository.search(undefined, pagination);
    }
    async createSubject(subject) {
        return this.subjectRepository.create(subject);
    }
    async updateSubject(id, subject) {
        return this.subjectRepository.update({ ...subject, id });
    }
    async deleteSubject(id) {
        return this.subjectRepository.delete(id);
    }
}
