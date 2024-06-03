import { UnauthenticatedError } from '../Errors/UnauthenticatedError.js';
import { UnauthorizedError } from '../Errors/UnauthorizedError.js';
import { WrongRoleError } from '../Errors/WrongRoleError.js';
export function student(context) {
    if (context.credentials?.role !== 'student') {
        throw new WrongRoleError();
    }
}
export function notStudent(context) {
    if (context.credentials?.role === 'student') {
        throw new WrongRoleError();
    }
}
export function mentor(context) {
    if (context.credentials?.role !== 'mentor') {
        throw new WrongRoleError();
    }
}
export function mentorOrStudent(context) {
    if (context.credentials?.role !== 'mentor' &&
        context.credentials?.role !== 'student') {
        throw new WrongRoleError();
    }
}
export function teacher(context) {
    if (context.credentials?.role !== 'teacher') {
        throw new WrongRoleError();
    }
}
export function admin(context) {
    if (context.credentials?.role !== 'admin') {
        throw new WrongRoleError();
    }
}
export function teacherOrAdmin(context) {
    if (context.credentials?.role !== 'teacher' &&
        context.credentials?.role !== 'admin') {
        throw new WrongRoleError();
    }
}
export async function isAuthenticated(context) {
    if (!(await context.isAuthenticated())) {
        throw new UnauthenticatedError();
    }
}
export function isAuthorized(context, id) {
    if (Array.isArray(id) &&
        !id.some((_id) => context.credentials?.userId === _id)) {
        throw new UnauthorizedError();
    }
    else if (!Array.isArray(id) && context.credentials?.userId !== id) {
        throw new UnauthorizedError();
    }
}
