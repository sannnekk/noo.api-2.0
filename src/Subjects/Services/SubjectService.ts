import { Pagination } from '@modules/Core/Data/Pagination'
import { SubjectRepository } from '../Data/SubjectRepository'
import { Subject } from '../Data/Subject'

export class SubjectService {
  private readonly subjectRepository: SubjectRepository

  public constructor() {
    this.subjectRepository = new SubjectRepository()
  }

  public async getSubjects(pagination: Pagination) {
    return this.subjectRepository.search(undefined, pagination)
  }

  public async createSubject(subject: Subject) {
    return this.subjectRepository.create(subject)
  }

  public async updateSubject(id: Subject['id'], subject: Subject) {
    return this.subjectRepository.update({ ...subject, id })
  }

  public async deleteSubject(id: Subject['id']) {
    return this.subjectRepository.delete(id)
  }
}
