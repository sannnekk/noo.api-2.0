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
export class PollService extends Service {
    pollRepository;
    pollAnswerRepository;
    userRepository;
    pollAuthService;
    constructor() {
        super();
        this.pollRepository = new PollRepository();
        this.pollAnswerRepository = new PollAnswerRepository();
        this.userRepository = new UserRepository();
        this.pollAuthService = new PollAuthService();
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
        pagination.entriesToSearch = PollAnswerModel.entriesToSearch();
        const relations = [];
        const conditions = {
            userId: null,
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
            acc[answer.userAuthIdentifier] = {
                identifier: answer.userAuthIdentifier,
                id: answer.userAuthData?.id,
                firstName: answer.userAuthData?.first_name,
                lastName: answer.userAuthData?.last_name,
                avatarUrl: answer.userAuthData?.photo_url,
                username: answer.userAuthData?.username,
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
            userAuthData: TypeORM.ILike(`%${idOrTelegramUsername}%`),
        };
        if (z.string().ulid().safeParse(idOrTelegramUsername).success) {
            // @ts-expect-error TypeORM doesn't support union types
            conditions.user = {
                id: idOrTelegramUsername,
            };
            // @ts-expect-error TypeORM doesn't support union types
            conditions.userAuthData = undefined;
        }
        const answers = await this.pollAnswerRepository.find(conditions, relations);
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
                    userAuthIdentifier: answer.userAuthData.username,
                };
            }
            return new PollAnswerModel(data);
        });
        this.pollRepository.update(poll);
        this.pollAnswerRepository.createMany(answerModels);
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
}
