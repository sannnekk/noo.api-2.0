var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Model } from '../../../Core/Data/Model.js';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { CourseMaterialModel } from './CourseMaterialModel.js';
import { UserModel } from '../../../Users/Data/UserModel.js';
let CourseMaterialReactionModel = class CourseMaterialReactionModel extends Model {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    material;
    materialId;
    user;
    reaction;
};
__decorate([
    ManyToOne(() => CourseMaterialModel, (matetrial) => matetrial.reactions),
    __metadata("design:type", Object)
], CourseMaterialReactionModel.prototype, "material", void 0);
__decorate([
    RelationId((reaction) => reaction.material),
    __metadata("design:type", Object)
], CourseMaterialReactionModel.prototype, "materialId", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.materialReactions),
    __metadata("design:type", Object)
], CourseMaterialReactionModel.prototype, "user", void 0);
__decorate([
    Column({
        name: 'reaction',
        type: 'varchar',
        nullable: false,
    }),
    __metadata("design:type", String)
], CourseMaterialReactionModel.prototype, "reaction", void 0);
CourseMaterialReactionModel = __decorate([
    Entity('course_material_reaction'),
    __metadata("design:paramtypes", [Object])
], CourseMaterialReactionModel);
export { CourseMaterialReactionModel };
