import { User } from '@modules/Users/Data/User'
import { Video } from '../Data/Video'
import { VideoAccessSelector } from '../Types/VideoAccessSelector'
import { MentorAssignmentRepository } from '@modules/Users/Data/MentorAssignmentRepository'
import { CourseAssignmentRepository } from '@modules/Courses/Data/CourseAssignmentRepository'

export class VideoAccessService {
  private readonly mentorAssignmentRepository: MentorAssignmentRepository

  private readonly courseAssignmentRepository: CourseAssignmentRepository

  public constructor() {
    this.mentorAssignmentRepository = new MentorAssignmentRepository()
    this.courseAssignmentRepository = new CourseAssignmentRepository()
  }

  public async getVideoSelectorFromUser(
    userId: User['id'],
    userRole: User['role']
  ): Promise<VideoAccessSelector[]> {
    if (userRole === 'teacher' || userRole === 'admin') {
      return []
    }

    if (userRole === 'mentor') {
      return [
        { accessType: 'mentorId', accessValue: userId },
        { accessType: 'everyone', accessValue: null },
        { accessType: 'role', accessValue: 'mentor' },
      ]
    }

    // @ts-expect-error the role is in another branch
    if (userRole === 'assistant') {
      return [
        { accessType: 'everyone', accessValue: null },
        { accessType: 'role', accessValue: 'assistant' },
      ]
    }

    // role is student

    const selectors: VideoAccessSelector[] = [
      { accessType: 'everyone', accessValue: null },
      { accessType: 'role', accessValue: 'student' },
    ]

    const mentorAssignments = await this.mentorAssignmentRepository.findAll(
      { student: { id: userId } },
      ['mentor']
    )

    if (mentorAssignments.length > 0) {
      selectors.push(
        ...mentorAssignments.map(
          (assignment) =>
            ({
              accessType: 'mentorId',
              accessValue: assignment.mentor.id,
            }) as const
        )
      )
    }

    const courseAssignments = await this.courseAssignmentRepository.findAll({
      student: { id: userId },
    })

    if (courseAssignments.length > 0) {
      const courseIds = courseAssignments.map(
        (assignment) => assignment.courseId
      )

      selectors.push(
        ...courseIds.map(
          (courseId) =>
            ({
              accessType: 'courseId',
              accessValue: courseId,
            }) as const
        )
      )
    }

    return selectors
  }

  public async canGetVideo(
    video: Video,
    userId: User['id'],
    userRole: User['role']
  ): Promise<boolean> {
    if (video.accessType === 'everyone') {
      return true
    }

    if (userRole === 'teacher' || userRole === 'admin') {
      return true
    }

    if (userRole === 'mentor') {
      const isOwnVideo =
        video.accessType === 'mentorId' && video.accessValue === userId
      const isForMentors =
        video.accessType === 'role' && video.accessValue === 'mentor'

      return isOwnVideo || isForMentors
    }

    // @ts-expect-error the role is in another branch
    if (userRole === 'assistant') {
      const isForAssistants =
        video.accessType === 'role' && video.accessValue === 'assistant'

      return isForAssistants
    }

    if (video.accessType === 'role' && video.accessValue === 'student') {
      return true
    }

    if (video.accessType === 'mentorId') {
      const mentorAssignments = await this.mentorAssignmentRepository.findAll(
        { student: { id: userId } },
        ['mentor']
      )

      return mentorAssignments.some(
        (assignment) => assignment.mentor.id === video.accessValue
      )
    }

    if (video.accessType === 'courseId') {
      const courseAssignments = await this.courseAssignmentRepository.findAll({
        student: { id: userId },
      })

      return courseAssignments.some(
        (assignment) => assignment.courseId === video.accessValue
      )
    }

    return false
  }

  public canEditVideo(
    video: Video,
    userId: User['id'],
    userRole: User['role']
  ) {
    if (userRole === 'teacher' || userRole === 'admin') {
      return true
    }

    if (userRole === 'mentor') {
      return video.accessType === 'mentorId' && video.accessValue === userId
    }

    return false
  }

  public canDeleteVideo(
    video: Video,
    userId: User['id'],
    userRole: User['role']
  ) {
    if (userRole === 'teacher' || userRole === 'admin') {
      return true
    }

    if (userRole === 'mentor') {
      return video.accessType === 'mentorId' && video.accessValue === userId
    }

    return false
  }
}
