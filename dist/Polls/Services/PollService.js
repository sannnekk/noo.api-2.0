import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
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
import { NotificationService } from '../../Notifications/Services/NotificationService.js';
import { PollModel } from '../Data/PollModel.js';
import { PollAlreadyEndedError } from '../Errors/PollAlreadyEndedError.js';
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
        return this.pollRepository.search(undefined, pagination);
    }
    async getMyPolls(userId, pagination) {
        const myPollIds = await this.pollAnswerRepository.getMyPollIds(userId);
        return this.pollRepository.search({
            id: TypeORM.In(myPollIds),
        }, pagination);
    }
    async createPoll(poll) {
        return this.pollRepository.create(poll);
    }
    async updatePoll(id, data) {
        const poll = await this.pollRepository.findOne({ id });
        if (!poll) {
            throw new NotFoundError('Опрос не найден');
        }
        const updatedPoll = new PollModel({ ...poll, ...data, id });
        await this.pollRepository.update(updatedPoll);
    }
    async searchQuestions(pagination, pollId) {
        return this.pollQuestionRepository.search(pollId
            ? {
                poll: {
                    id: pollId,
                },
            }
            : undefined, pagination, ['poll']);
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
        return this.userRepository.search({
            votedPolls: {
                id: pollId,
            },
        }, pagination);
    }
    async searchWhoVotedUnregistered(userRole, pollId, pagination) {
        if (!(await this.canSeeResults(userRole, pollId))) {
            throw new UnauthorizedError();
        }
        return this.pollAnswerRepository.search({
            userAuthType: TypeORM.Not('api'),
            question: {
                poll: {
                    id: pollId,
                },
            },
        }, pagination, undefined, 'userAuthData', {
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
    }
    async getAnswers(userId, userRole, pollId, idOrTelegramUsername) {
        const isRegistered = z
            .string()
            .ulid()
            .safeParse(idOrTelegramUsername).success;
        if (!(await this.canSeeResults(userRole, pollId))) {
            if (idOrTelegramUsername !== userId) {
                throw new UnauthorizedError();
            }
        }
        const conditions = {
            question: {
                poll: {
                    id: pollId,
                },
            },
        };
        if (isRegistered) {
            conditions.user = {
                id: idOrTelegramUsername,
            };
        }
        else {
            conditions.userAuthIdentifier = TypeORM.ILike(`%${idOrTelegramUsername}%`);
        }
        return this.pollAnswerRepository.findAll(conditions);
    }
    async saveAnswers(userId, userRole, pollId, answers) {
        if (!(await this.canVote(userRole, pollId))) {
            throw new CantVoteInPollError();
        }
        const isRegistered = !!userId;
        if (isRegistered && (await this.userAlreadyVoted(userId, pollId))) {
            throw new AlreadyVotedError();
        }
        if (!isRegistered &&
            (await this.unregisteredUserAlreadyVoted(answers, pollId))) {
            throw new AlreadyVotedError();
        }
        const poll = await this.pollRepository.findOne({ id: pollId }, [
            'votedUsers',
        ]);
        if (!poll) {
            throw new NotFoundError();
        }
        if (poll.isStopped) {
            throw new PollAlreadyEndedError();
        }
        if (!isRegistered) {
            this.answersHaveValidAuth(answers);
        }
        const answerModels = answers.map((answer) => {
            let data = { ...answer };
            if (isRegistered) {
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
        poll.votedCount += 1;
        this.pollRepository.update(poll);
        this.pollAnswerRepository.createMany(answerModels);
        if (isRegistered) {
            this.pollRepository.addVotedUser(poll.id, userId);
            this.notificationService.generateAndSend('poll.poll-answered', userId, {
                poll,
            });
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
    async deletePoll(id) {
        const poll = await this.pollRepository.findOne({ id });
        if (!poll) {
            throw new NotFoundError('Опрос не найден');
        }
        await this.pollRepository.delete(poll.id);
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
    async unregisteredUserAlreadyVoted(answers, pollId) {
        if (answers.length === 0) {
            return true;
        }
        const answer = answers[0];
        const authIdentifier = this.removeEmojisAndNonUTF8((answer.userAuthData.username ||
            '_telegram_id_' + answer.userAuthData.id));
        const existingAnswer = await this.pollAnswerRepository.findOne({
            question: {
                poll: {
                    id: pollId,
                },
            },
            userAuthIdentifier: authIdentifier,
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
