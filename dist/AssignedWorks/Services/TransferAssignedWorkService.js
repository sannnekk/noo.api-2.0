import { AssignedWorkRepository } from '../Data/AssignedWorkRepository.js';
export class TransferAssignedWorkService {
    assignedWorkRepository;
    constructor() {
        this.assignedWorkRepository = new AssignedWorkRepository();
    }
    async transferNotCheckedWorks(student, newMentor, subject) {
        const assignedWorkIds = await this.assignedWorkRepository.findWorkIdsByStudentAndSubject(student.id, subject.id);
        // remove all mentors from assigned works
        await this.assignedWorkRepository.removeMentorsFromAssignedWorks(assignedWorkIds);
        // assign new mentor to assigned works
        await this.assignedWorkRepository.assignMentorToAssignedWorks(assignedWorkIds, newMentor.id);
    }
}
