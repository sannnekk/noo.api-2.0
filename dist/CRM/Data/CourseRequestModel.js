var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '@core';
import { Column, Entity } from 'typeorm';
let CourseRequestModel = class CourseRequestModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    courseId;
    email;
};
__decorate([
    Column({
        name: 'course_id',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], CourseRequestModel.prototype, "courseId", void 0);
__decorate([
    Column({
        name: 'email',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], CourseRequestModel.prototype, "email", void 0);
CourseRequestModel = __decorate([
    Entity('course_request'),
    __metadata("design:paramtypes", [Object])
], CourseRequestModel);
export { CourseRequestModel };
