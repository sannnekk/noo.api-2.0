import { AssignedWorkRepository } from '../Data/AssignedWorkRepository.js';
export class TransferAssignedWorkService {
    assignedWorkRepository;
    constructor() {
        this.assignedWorkRepository = new AssignedWorkRepository();
    }
    async transferNotCheckedWorks(student, newMentor, subject) {
        const notStartedWorks = await this.assignedWorkRepository.getNotCheckedNotTestWorks(student.id, subject.id, ['mentors']);
        // TODO: make it more efficient
        // get only first 50 works mutating the mentors array, TODO: change it to a better solution
        notStartedWorks.splice(0, 50);
        notStartedWorks.forEach((work) => {
            work.mentors = [newMentor];
        });
        for (const work of notStartedWorks) {
            await this.assignedWorkRepository.update(work);
        }
    }
}
