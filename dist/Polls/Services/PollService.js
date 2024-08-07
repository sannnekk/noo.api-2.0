import { Service } from '../../Core/Services/Service.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { Pagination } from '../../Core/Data/Pagination.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
import { UserRepository } from '../../Users/Data/UserRepository.js';
import { UserModel } from '../../Users/Data/UserModel.js';
import { PollRepository } from '../Data/PollRepository.js';
import { PollAnswerRepository } from '../Data/PollAnswerRepository.js';
import { PollAnswerModel } from '../Data/Relations/PollAnswerModel.js';
import { AlreadyVotedError } from '../Errors/AlreadyVotedError.js';
import { CantVoteInPollError } from '../Errors/CantVoteInPollError.js';
import { InvalidAuthTypeError } from '../Errors/InvalidAuthTypeError.js';
import { PollAuthService } from './PollAuthService.js';
import { z } from 'zod';
import * as TypeORM from 'typeorm';
import { PollModel } from '../Data/PollModel.js';
import { PollQuestionModel } from '../Data/Relations/PollQuestionModel.js';
import { PollQuestionRepository } from '../Data/PollQuestionRepository.js';
export class PollService extends Service {
    pollRepository;
    pollAnswerRepository;
    pollQuestionRepository;
    userRepository;
    pollAuthService;
    constructor() {
        super();
        this.pollRepository = new PollRepository();
        this.pollAnswerRepository = new PollAnswerRepository();
        this.pollQuestionRepository = new PollQuestionRepository();
        this.userRepository = new UserRepository();
        this.pollAuthService = new PollAuthService();
    }
    async getPolls(pagination) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = PollModel.entriesToSearch();
        const relations = [];
        const conditions = {};
        const polls = await this.pollRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.pollRepository, conditions, pagination, relations);
        return { polls, meta };
    }
    async searchQuestions(pagination, pollId) {
        pagination = new Pagination().assign(pagination);
        pagination.entriesToSearch = PollQuestionModel.entriesToSearch();
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
        const questions = await this.pollQuestionRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.pollQuestionRepository, conditions, pagination, relations);
        return { questions, meta };
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
        pagination.entriesToSearch = UserModel.entriesToSearch();
        const relations = [];
        const conditions = {
            votedPolls: {
                id: pollId,
            },
        };
        const users = await this.userRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.userRepository, conditions, pagination, relations);
        return { users, meta };
    }
    async searchWhoVotedUnregistered(userRole, pollId, pagination) {
        if (!(await this.canSeeResults(userRole, pollId))) {
            throw new UnauthorizedError();
        }
        pagination = new Pagination().assign(pagination);
        pagination.take = 1000;
        pagination.entriesToSearch = PollAnswerModel.entriesToSearch();
        const relations = [];
        const conditions = {
            userAuthType: TypeORM.Not('api'),
            question: {
                poll: {
                    id: pollId,
                },
            },
        };
        const answers = await this.pollAnswerRepository.find(conditions, relations, pagination);
        const meta = await this.getRequestMeta(this.pollAnswerRepository, conditions, pagination, relations);
        // group by user
        const users = answers.reduce((acc, answer) => {
            if (!answer.userAuthData) {
                return acc;
            }
            let data = null;
            try {
                data = JSON.parse(answer.userAuthData);
            }
            catch (error) { }
            acc[answer.userAuthIdentifier] = {
                identifier: answer.userAuthIdentifier,
                id: data?.id,
                firstName: data?.first_name,
                lastName: data?.last_name,
                avatarUrl: data?.photo_url,
                username: data?.username,
            };
            return acc;
        }, {});
        return { users: Object.values(users), meta };
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
        const answers = await this.pollAnswerRepository.find(conditions, relations, new Pagination(1, 250));
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
        }
        catch (error) {
            throw new Error('Не удалось сохранить ответы.');
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
