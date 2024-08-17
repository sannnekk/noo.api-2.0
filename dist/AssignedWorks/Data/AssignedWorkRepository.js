import { Repository } from '../../Core/Data/Repository.js';
import { AssignedWorkModel } from './AssignedWorkModel.js';
import TypeORM from 'typeorm';
export class AssignedWorkRepository extends Repository {
    constructor() {
        super(AssignedWorkModel);
    }
    async getNotCheckedNotTestWorks(studentId, subjectId, relations) {
        return this.findAll({
            student: {
                id: studentId,
            },
            checkStatus: 'not-checked',
            work: { type: TypeORM.Not('test'), subject: { id: subjectId } },
        }, relations, {
            id: 'DESC',
        });
    }
}
