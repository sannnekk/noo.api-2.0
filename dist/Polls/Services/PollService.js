import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
import { UserRepository } from '../../Users/Data/UserRepository.js';
import { PollRepository } from '../Data/PollRepository.js';
import { PollAnswerRepository } from '../Data/PollAnswerRepository.js';
import { PollAnswerModel } from '../Data/Relations/PollAnswerModel.js';
import { AlreadyVotedError } from '../Errors/AlreadyVotedError.js';
import { CantVoteInPollError } from '../Errors/CantVoteInPollError.js';
import { InvalidAuthTypeError } from '../Errors/InvalidAuthTypeError.js';
import { PollAuthService } from './PollAuthService.js';
import { z } from 'zod';
import * as TypeORM from 'typeorm';
import { PollQuestionRepository } from '../Data/PollQuestionRepository.js';
import { UnknownError } from '../../Core/Errors/UnknownError.js';
import { NotificationService } from '../../Notifications/Services/NotificationService.js';
export class PollService {
    pollRepository;
    pollAnswerRepository;
    pollQuestionRepository;
    userRepository;
    pollAuthService;
    notificationService;
    constructor() {
        this.pollRepository = new PollRepository();
        this.pollAnswerRepository = new PollAnswerRepository();
        this.pollQuestionRepository = new PollQuestionRepository();
        this.userRepository = new UserRepository();
        this.pollAuthService = new PollAuthService();
        this.notificationService = new NotificationService();
    }
    async getPolls(pagination) {
        pagination = new Pagination().assign(pagination);
        const relations = [];
        const conditions = {};
        return this.pollRepository.search(conditions, pagination, relations);
    }
    async searchQuestions(pagination, pollId) {
        pagination = new Pagination().assign(pagination);
        const relations = ['poll'];
        const conditions = {
            poll: {
                post: {
                    id: TypeORM.Not(TypeORM.IsNull()),
                },
            },
        };
        if (pollId) {
            conditions.poll.id = pollId;
        }
        return this.pollQuestionRepository.search(conditions, pagination, relations);
    }
    async getPollById(id, userId) {
        const poll = await this.pollRepository.findOne({ id }, ['questions'], {
            questions: {
                order: 'ASC',
            },
        });
        if (!poll) {
            throw new NotFoundError('Опрос не найден');
        }
        if (poll.requireAuth && !userId) {
            throw new UnauthorizedError('Необходимо авторизоваться для голосования');
        }
        return poll;
    }
    async getPollInfo(id) {
        const poll = await this.pollRepository.findOne({ id });
        if (!poll) {
            throw new NotFoundError('Опрос не найден');
        }
        return poll;
    }
    async searchWhoVoted(userRole, pollId, pagination) {
        if (!(await this.canSeeResults(userRole, pollId))) {
            throw new UnauthorizedError();
        }
        pagination = new Pagination().assign(pagination);
        const relations = [];
        const conditions = {
            votedPolls: {
                id: pollId,
            },
        };
        /* return {
          entities: [],
          meta: {
            total: 0,
            relations: [],
          },
        } */
        return this.userRepository.search(conditions, pagination, relations);
    }
    // !!! TEST THIS
    async searchWhoVotedUnregistered(userRole, pollId, pagination) {
        if (!(await this.canSeeResults(userRole, pollId))) {
            throw new UnauthorizedError();
        }
        pagination = new Pagination().assign(pagination);
        const relations = [];
        const groupBy = 'userAuthData';
        const conditions = {
            userAuthType: TypeORM.Not('api'),
            question: {
                poll: {
                    id: pollId,
                },
            },
        };
        const { entities, meta } = await this.pollAnswerRepository.search(conditions, pagination, relations, groupBy, {
            useEagerRelations: false,
            select: [
                ['user_auth_identifier', ' identifier'],
                ['JSON_EXTRACT(user_auth_data, "$.id")', 'id'],
                [
                    'JSON_UNQUOTE(JSON_EXTRACT(user_auth_data, "$.photo_url"))',
                    'avatarUrl',
                ],
                [
                    'JSON_UNQUOTE(JSON_EXTRACT(user_auth_data, "$.username"))',
                    'username',
                ],
                [
                    'JSON_UNQUOTE(JSON_EXTRACT(user_auth_data, "$.first_name"))',
                    'firstName',
                ],
                [
                    'JSON_UNQUOTE(JSON_EXTRACT(user_auth_data, "$.last_name"))',
                    'lastName',
                ],
            ],
        });
        return { entities, meta };
    }
    async getAnswers(userRole, pollId, idOrTelegramUsername) {
        if (!(await this.canSeeResults(userRole, pollId))) {
            throw new UnauthorizedError();
        }
        const relations = [];
        const conditions = {
            question: {
                poll: {
                    id: pollId,
                },
            },
            userAuthIdentifier: TypeORM.ILike(`%${idOrTelegramUsername}%`),
        };
        if (z.string().ulid().safeParse(idOrTelegramUsername).success) {
            // @ts-expect-error TypeORM doesn't support union types
            conditions.user = {
                id: idOrTelegramUsername,
            };
            // @ts-expect-error TypeORM doesn't support union types
            delete conditions.userAuthIdentifier;
        }
        const { entities: answers } = await this.pollAnswerRepository.search(conditions, new Pagination(1, 250), relations);
        return answers;
    }
    async saveAnswers(userId, userRole, pollId, answers) {
        if (!(await this.canVote(userRole, pollId))) {
            throw new CantVoteInPollError();
        }
        if (userId && (await this.userAlreadyVoted(userId, pollId))) {
            throw new AlreadyVotedError();
        }
        const poll = await this.pollRepository.findOne({ id: pollId }, [
            'votedUsers',
        ]);
        if (!poll) {
            throw new NotFoundError();
        }
        // TODO: add user more efficient
        if (userId) {
            poll.votedUsers.push({ id: userId });
        }
        else {
            this.answersHaveValidAuth(answers);
        }
        poll.votedCount += 1;
        const answerModels = answers.map((answer) => {
            let data = { ...answer };
            if (userId) {
                data = { ...data, user: { id: userId } };
            }
            else {
                data = {
                    ...data,
                    userAuthData: this.removeEmojisAndNonUTF8(JSON.stringify(answer.userAuthData)),
                    userAuthIdentifier: (answer.userAuthData.username ||
                        '_telegram_id_' + answer.userAuthData.id),
                };
            }
            return new PollAnswerModel(data);
        });
        this.pollRepository.update(poll);
        try {
            this.pollAnswerRepository.createMany(answerModels);
            if (userId) {
                this.notificationService.generateAndSend('poll.poll-answered', userId, {
                    poll,
                });
            }
        }
        catch (error) {
            throw new UnknownError('Не удалось сохранить ответы');
        }
    }
    async editAnswer(id, data) {
        const answer = await this.pollAnswerRepository.findOne({ id });
        if (!answer) {
            throw new NotFoundError('Ответ не найден');
        }
        const newAnswer = new PollAnswerModel({ ...answer, ...data, id });
        await this.pollAnswerRepository.update(newAnswer);
    }
    async userAlreadyVoted(userId, pollId) {
        const existingAnswer = await this.pollAnswerRepository.findOne({
            question: {
                poll: {
                    id: pollId,
                },
            },
            user: {
                id: userId,
            },
        });
        return existingAnswer !== null;
    }
    async canVote(role, pollId) {
        const poll = await this.pollRepository.findOne({
            id: pollId,
        });
        if (!poll) {
            throw new NotFoundError('Опрос не найден');
        }
        if (poll.requireAuth && !role) {
            throw new UnauthorizedError('Необходимо авторизоваться для голосования');
        }
        else if (!poll.requireAuth && !role) {
            return true;
        }
        return poll.canVote.includes(role) || poll.canVote.includes('everyone');
    }
    async canSeeResults(role, pollId) {
        const poll = await this.pollRepository.findOne({
            id: pollId,
        });
        if (!poll) {
            throw new NotFoundError('Опрос не найден');
        }
        return (poll.canSeeResults.includes(role) ||
            poll.canSeeResults.includes('everyone'));
    }
    answersHaveValidAuth(answers) {
        for (const answer of answers) {
            switch (answer.userAuthType) {
                case 'telegram':
                    this.pollAuthService.checkTelegramAuth(answer.userAuthData);
                    break;
                case 'api':
                    break;
                default:
                    throw new InvalidAuthTypeError();
            }
        }
    }
    removeEmojisAndNonUTF8(str) {
        // Remove emojis and symbols, including those outside the BMP
        // This targets symbols and pictographs, including emojis
        return (str
            .replace(/[\p{So}\p{C}]/gu, '')
            // Remove surrogate pairs for characters outside the BMP
            .replace(/[\uD800-\uDFFF]/g, ''));
    }
}
