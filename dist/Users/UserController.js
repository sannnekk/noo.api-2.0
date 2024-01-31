var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, ControllerResponse, Delete, Get, Patch, Post, } from 'express-controller-decorator';
import { Context } from '../core/index.js';
import { UserService } from './Services/UserService.js';
import { UserValidator } from './UserValidator.js';
import { Asserts } from '../core/index.js';
import { StatusCodes } from 'http-status-codes';
let UserController = class UserController {
    userValidator;
    userService;
    constructor() {
        this.userValidator = new UserValidator();
        this.userService = new UserService();
    }
    async create(context) {
        try {
            this.userValidator.validateCreation(context.body);
            Asserts.isAuthenticated(context);
            Asserts.teacherOrAdmin(context);
            await this.userService.create(context.body);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
        return new ControllerResponse(null, StatusCodes.CREATED);
    }
    async login(context) {
        try {
            this.userValidator.validateLogin(context.body);
            const payload = await this.userService.login(context.body);
            return new ControllerResponse(payload, StatusCodes.OK);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async register(context) {
        try {
            this.userValidator.validateRegister(context.body);
            await this.userService.register(context.body);
            return new ControllerResponse(null, StatusCodes.CREATED);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async getBySlug(context) {
        try {
            Asserts.isAuthenticated(context);
            this.userValidator.validateSlug(context.params.slug);
            const user = await this.userService.getBySlug(context.params.slug);
            return new ControllerResponse(user);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async getMentors(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            this.userValidator.validatePagination(context.query);
            const mentors = await this.userService.getMentors(context.query);
            return new ControllerResponse(mentors);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async getStudents(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            this.userValidator.validatePagination(context.query);
            const students = await this.userService.getStudents(context.query);
            return new ControllerResponse(students);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async getUsers(context) {
        try {
            Asserts.isAuthenticated(context);
            Asserts.notStudent(context);
            this.userValidator.validatePagination(context.query);
            const users = await this.userService.getUsers(context.query, context.credentials.role, context.credentials.userId);
            return new ControllerResponse(users);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async update(context) {
        try {
            Asserts.isAuthenticated(context);
            this.userValidator.validateId(context.params.id);
            this.userValidator.validateUpdate(context.body);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, context.params.id);
            }
            await this.userService.update(context.body);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(error, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async assignMentor(context) {
        try {
            Asserts.teacherOrAdmin(context);
            this.userValidator.validateId(context.params.studentId);
            this.userValidator.validateId(context.params.mentorId);
            await this.userService.assignMentor(context.params.studentId, context.params.mentorId);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
    async delete(context) {
        try {
            Asserts.isAuthenticated(context);
            this.userValidator.validateId(context.params.id);
            if (!['teacher', 'admin'].includes(context.credentials.role)) {
                Asserts.isAuthorized(context, context.params.id);
            }
            await this.userService.delete(context.params.id);
            return new ControllerResponse(null, StatusCodes.NO_CONTENT);
        }
        catch (error) {
            return new ControllerResponse(null, error.code || StatusCodes.BAD_REQUEST);
        }
    }
};
__decorate([
    Post(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    Post('/login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    Post('/register'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    Get('/:slug'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getBySlug", null);
__decorate([
    Get('/mentor/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMentors", null);
__decorate([
    Get('/student/search'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getStudents", null);
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    Patch('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    Patch('/:studentId/assign-mentor/:mentorId'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "assignMentor", null);
__decorate([
    Delete('/:id'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Context]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "delete", null);
UserController = __decorate([
    Controller('/user'),
    __metadata("design:paramtypes", [])
], UserController);
export { UserController };
