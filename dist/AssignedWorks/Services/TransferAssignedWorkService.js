import { AssignedWorkRepository } from '../Data/AssignedWorkRepository.js';
export class TransferAssignedWorkService {
    assignedWorkRepository;
    constructor() {
        this.assignedWorkRepository = new AssignedWorkRepository();
    }
    async transferNotFinishedWorks(student, newMentor) {
        const notStartedWorks = await this.assignedWorkRepository.getNotFinishedWorks(student.id, [
            'mentors',
        ]);
        notStartedWorks.forEach((work) => {
            work.mentors = [newMentor];
        });
        await Promise.all(notStartedWorks.map(this.assignedWorkRepository.update));
    }
}
