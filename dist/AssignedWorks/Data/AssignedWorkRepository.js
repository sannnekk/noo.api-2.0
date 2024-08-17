import { Repository } from '../../Core/Data/Repository.js';
import { AssignedWorkModel } from './AssignedWorkModel.js';
import TypeORM from 'typeorm';
export class AssignedWorkRepository extends Repository {
    constructor() {
        super(AssignedWorkModel);
    }
    async getNotCheckedWorks(studentId, subjectId, relations) {
        return this.findAll({
            student: {
                id: studentId,
            },
            checkStatus: TypeORM.In([
                'not-checked',
                'checked-automatically',
            ]),
            work: { subject: { id: subjectId } },
        }, relations, {
            id: 'DESC',
        });
    }
}
