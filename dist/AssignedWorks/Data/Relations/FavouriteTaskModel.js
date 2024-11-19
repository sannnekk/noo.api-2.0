var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { UserModel } from '../../../Users/Data/UserModel.js';
import { Brackets, Column, Entity, ManyToOne, } from 'typeorm';
import { WorkTaskModel } from '../../../Works/Data/Relations/WorkTaskModel.js';
import { SearchableModel } from '../../../Core/Data/SearchableModel.js';
let FavouriteTaskModel = class FavouriteTaskModel extends SearchableModel {
    constructor(data) {
        super();
        if (data) {
            this.set(data);
        }
    }
    answer;
    comment;
    user;
    task;
    addSearchToQuery(query, needle) {
        query.andWhere(new Brackets((qb) => {
            qb.where('LOWER(favourite_task__task.content) LIKE LOWER(:needle)', {
                needle: `%${needle}%`,
            });
        }));
        return ['task'];
    }
};
__decorate([
    Column({
        name: 'answer',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], FavouriteTaskModel.prototype, "answer", void 0);
__decorate([
    Column({
        name: 'comment',
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], FavouriteTaskModel.prototype, "comment", void 0);
__decorate([
    ManyToOne(() => UserModel, (user) => user.favouriteTasks),
    __metadata("design:type", Object)
], FavouriteTaskModel.prototype, "user", void 0);
__decorate([
    ManyToOne(() => WorkTaskModel, (task) => task.favourites),
    __metadata("design:type", Object)
], FavouriteTaskModel.prototype, "task", void 0);
FavouriteTaskModel = __decorate([
    Entity('favourite_task'),
    __metadata("design:paramtypes", [Object])
], FavouriteTaskModel);
export { FavouriteTaskModel };
