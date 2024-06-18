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
export class PollService extends Service {
    pollRepository;
    pollAnswerRepository;
    userRepository;
    constructor() {
        super();
        this.pollRepository = new PollRepository();
        this.pollAnswerRepository = new PollAnswerRepository();
        this.userRepository = new UserRepository();
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
    async getAnswers(userRole, pollId, userId) {
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
            user: {
                id: userId,
            },
        };
        const answers = await this.pollAnswerRepository.find(conditions, relations);
        return answers;
    }
    async saveAnswers(userId, userRole, pollId, answers) {
        if (userId && userRole) {
            if (!(await this.canVote(userRole, pollId))) {
                throw new CantVoteInPollError();
            }
            if (await this.userAlreadyVoted(userId, pollId)) {
                throw new AlreadyVotedError();
            }
        }
        const poll = await this.pollRepository.findOne({ id: pollId }, [
            'votedUsers',
        ]);
        if (!poll) {
            throw new NotFoundError();
        }
        if (poll.requireAuth && !userId) {
            throw new UnauthorizedError('Необходимо авторизоваться для голосования');
        }
        // TODO: add user more efficient
        if (userId) {
            poll.votedUsers.push({ id: userId });
        }
        const answerModels = answers.map((answer) => new PollAnswerModel({ ...answer, user: { id: userId } }));
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
}
