import { Repository } from '@modules/Core/Data/Repository'
import { AssignedWork } from './AssignedWork'
import { AssignedWorkModel } from './AssignedWorkModel'
import { medianValue } from '../Utils/Math'

export class AssignedWorkRepository extends Repository<AssignedWork> {
  constructor() {
    super(AssignedWorkModel)
  }

  public async findWorkIdsByStudentAndSubject(
    studentId: string,
    subjectId: string
  ): Promise<string[]> {
    const assignedWorks = await this.findAll({
      student: { id: studentId },
      work: { subject: { id: subjectId } },
    })

    return assignedWorks.map((assignedWork) => assignedWork.id)
  }

  public async removeMentorsFromAssignedWorks(assignedWorkIds: string[]) {
    // mentor and assignedWork relation is many to many
    // so we need to remove all mentors from assigned works
    await this.queryBuilder('assigned_work_mentors_user')
      .delete()
      .from('assigned_work_mentors_user')
      .where('assignedWorkId IN (:...assignedWorkIds)', { assignedWorkIds })
      .execute()
  }

  public async assignMentorToAssignedWorks(
    assignedWorkIds: string[],
    mentorId: string
  ) {
    // assign new mentor to assigned works
    await this.queryBuilder('assigned_work_mentors_user')
      .insert()
      .into('assigned_work_mentors_user')
      .values(
        assignedWorkIds.map((assignedWorkId) => ({
          assignedWorkId,
          userId: mentorId,
        }))
      )
      .execute()
  }

  public async getWorkSolveCount(id: string): Promise<number> {
    const result = await this.queryBuilder('assigned_work')
      .select('COUNT(id)', 'count')
      .where('workId = :id', { id })
      .andWhere('solved_at IS NOT NULL')
      .getRawOne()

    return parseInt(result.count)
  }

  public async getAverageWorkScore(id: string): Promise<number> {
    const result = await this.queryBuilder('assigned_work')
      .select('COALESCE(AVG(score), 0)', 'avgScore')
      .where('workId = :id', { id })
      .andWhere('score IS NOT NULL')
      .getRawOne()

    return parseFloat(result.avgScore)
  }

  public async getMedianWorkScore(id: string): Promise<number> {
    const results = (await this.queryBuilder('assigned_work')
      .select('score', 'score')
      .where('workId = :id', { id })
      .andWhere('score IS NOT NULL')
      .getRawMany()) as { score: string }[]

    const scores = results.map((item) => parseFloat(item.score)) || []

    return medianValue(scores)
  }
}
