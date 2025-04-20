import { MentorAssignmentRepository } from '../../Users/Data/MentorAssignmentRepository.js';
import { CourseAssignmentRepository } from '../../Courses/Data/CourseAssignmentRepository.js';
export class VideoAccessService {
    mentorAssignmentRepository;
    courseAssignmentRepository;
    constructor() {
        this.mentorAssignmentRepository = new MentorAssignmentRepository();
        this.courseAssignmentRepository = new CourseAssignmentRepository();
    }
    async getVideoSelectorFromUser(userId, userRole) {
        if (userRole === 'teacher' || userRole === 'admin') {
            return [];
        }
        if (userRole === 'mentor') {
            return [
                { accessType: 'mentorId', accessValue: userId },
                { accessType: 'everyone', accessValue: null },
                { accessType: 'role', accessValue: 'mentor' },
            ];
        }
        if (userRole === 'assistant') {
            return [
                { accessType: 'everyone', accessValue: null },
                { accessType: 'role', accessValue: 'assistant' },
            ];
        }
        // role is student
        const selectors = [
            { accessType: 'everyone', accessValue: null },
            { accessType: 'role', accessValue: 'student' },
        ];
        const mentorAssignments = await this.mentorAssignmentRepository.findAll({ student: { id: userId } }, ['mentor']);
        if (mentorAssignments.length > 0) {
            selectors.push(...mentorAssignments.map((assignment) => ({
                accessType: 'mentorId',
                accessValue: assignment.mentor.id,
            })));
        }
        const courseAssignments = await this.courseAssignmentRepository.findAll({
            student: { id: userId },
        });
        if (courseAssignments.length > 0) {
            const courseIds = courseAssignments.map((assignment) => assignment.courseId);
            selectors.push(...courseIds.map((courseId) => ({
                accessType: 'courseId',
                accessValue: courseId,
            })));
        }
        return selectors;
    }
    async canGetVideo(video, userId, userRole) {
        if (video.accessType === 'everyone') {
            return true;
        }
        if (userRole === 'teacher' || userRole === 'admin') {
            return true;
        }
        if (userRole === 'mentor') {
            const isOwnVideo = video.accessType === 'mentorId' && video.accessValue === userId;
            const isForMentors = video.accessType === 'role' && video.accessValue === 'mentor';
            return isOwnVideo || isForMentors;
        }
        if (userRole === 'assistant') {
            const isForAssistants = video.accessType === 'role' && video.accessValue === 'assistant';
            return isForAssistants;
        }
        if (video.accessType === 'role' && video.accessValue === 'student') {
            return true;
        }
        if (video.accessType === 'mentorId') {
            const mentorAssignments = await this.mentorAssignmentRepository.findAll({ student: { id: userId } }, ['mentor']);
            return mentorAssignments.some((assignment) => assignment.mentor.id === video.accessValue);
        }
        if (video.accessType === 'courseId') {
            // accessValue is <courseId> or <courseId1,courseId2,...>
            const courseAssignments = await this.courseAssignmentRepository.findAll({
                student: { id: userId },
            });
            return courseAssignments.some((assignment) => video.accessValue?.includes(assignment.courseId));
        }
        return false;
    }
    canEditVideo(video, userId, userRole) {
        if (userRole === 'teacher' || userRole === 'admin') {
            return true;
        }
        if (userRole === 'mentor') {
            return video.accessType === 'mentorId' && video.accessValue === userId;
        }
        return false;
    }
    canDeleteVideo(video, userId, userRole) {
        if (userRole === 'teacher' || userRole === 'admin') {
            return true;
        }
        if (userRole === 'mentor') {
            return video.accessType === 'mentorId' && video.accessValue === userId;
        }
        return false;
    }
}
