import { AssignedWorkRepository } from '../Data/AssignedWorkRepository.js';
export class TransferAssignedWorkService {
    assignedWorkRepository;
    constructor() {
        this.assignedWorkRepository = new AssignedWorkRepository();
    }
    async transferNotCheckedWorks(student, newMentor, subject) {
        const notStartedWorks = await this.assignedWorkRepository.getNotCheckedWorks(student.id, subject.id, ['mentors']);
        for (const work of notStartedWorks) {
            work.mentors = [newMentor];
            await this.assignedWorkRepository.update(work);
        }
    }
}
