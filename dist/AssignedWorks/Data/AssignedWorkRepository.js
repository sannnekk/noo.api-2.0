import { Repository } from '../../Core/Data/Repository.js';
import { AssignedWorkModel } from './AssignedWorkModel.js';
export class AssignedWorkRepository extends Repository {
    constructor() {
        super(AssignedWorkModel);
    }
    async getNotFinishedWorks(studentId, relations) {
        const { entities: notStartedWorks } = await this.search({
            studentId,
            solveStatus: 'not-started',
        }, undefined, relations);
        const { entities: inProgressWorks } = await this.search({
            studentId,
            solveStatus: 'in-progress',
        }, undefined, relations);
        return [...notStartedWorks, ...inProgressWorks];
    }
}
