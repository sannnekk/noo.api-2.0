import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { GoogleAuthService } from './Google/GoogleAuthService.js';
import { GoogleDriveService } from './Google/GoogleDriveService.js';
import { UserRepository } from '../../Users/Data/UserRepository.js';
import { PollRepository } from '../../Polls/Data/PollRepository.js';
import { PollAnswerRepository } from '../../Polls/Data/PollAnswerRepository.js';
import { Pagination } from '../../Core/Data/Pagination.js';
export class BindingSyncService {
    googleAuthService;
    googleDriveService;
    userRepository;
    pollRepository;
    pollAnswerRepository;
    constructor() {
        this.googleAuthService = new GoogleAuthService();
        this.googleDriveService = new GoogleDriveService();
        this.userRepository = new UserRepository();
        this.pollRepository = new PollRepository();
        this.pollAnswerRepository = new PollAnswerRepository();
    }
    /**
     * Start sync process
     *
     * @param binding Binding to sync
     * @returns Array of file ids as file path
     */
    async sync(binding) {
        const data = await this.getBindingData(binding.entityName, binding.entitySelector);
        const auth = await this.googleAuthService.getAuthObject(binding.googleOAuthToken, binding.googleRefreshToken);
        return this.googleDriveService.syncFile(binding.name, binding.filePath, data, auth);
    }
    async getBindingData(entityName, entitySelector) {
        switch (entityName) {
            case 'user':
                return this.getUserData(entitySelector);
            case 'poll_answer':
                return this.getPollAnswerData(entitySelector);
            default:
                throw new NotFoundError('Модуль для синхронизации не найден');
        }
    }
    async getUserData(selector) {
        const header = [
            {
                title: 'Никнейм',
                key: 'username',
            },
            {
                title: 'Имя',
                key: 'name',
            },
            {
                title: 'Email',
                key: 'email',
            },
            {
                title: 'Роль',
                key: 'role',
            },
            {
                title: 'Дата регистрации',
                key: 'createdAt',
            },
            {
                title: 'Telegram',
                key: 'telegramUsername',
            },
        ];
        const condition = this.prepareCondition(selector);
        const { entities: users } = await this.userRepository.find(condition, undefined, new Pagination(1, 999999));
        return {
            header,
            data: users,
        };
    }
    async getPollAnswerData(selector) {
        const condition = this.prepareCondition(selector);
        const poll = await this.pollRepository.findOne(condition, ['questions'], undefined, {
            relationLoadStrategy: 'query',
        });
        if (!poll) {
            throw new NotFoundError('Опрос не найден');
        }
        // sort questions by order field
        poll.questions.sort((a, b) => a.order - b.order);
        const header = poll.questions.map((question, index) => ({
            title: `${index + 1}. ${question.text}`,
            key: question.id,
        }));
        header.push({
            title: 'Ссылка на ответы',
            key: 'pollLink',
        });
        const { entities: answers } = await this.pollAnswerRepository.find({
            question: {
                poll: {
                    id: selector.value,
                },
            },
        }, undefined, new Pagination(1, 999999));
        const userIds = answers.map((answer) => answer.userId).filter(Boolean);
        // remove duplicates
        const uniqueUserIds = Array.from(new Set(userIds));
        const usernames = await this.userRepository.getUsernamesFromIds(uniqueUserIds);
        // Record<userAuthIdentifier, Record<questionId, answerText>>
        const data = answers.reduce((acc, answer) => {
            const userAuthIdentifier = answer.userAuthIdentifier || answer.userId || '-';
            if (!acc[userAuthIdentifier]) {
                acc[userAuthIdentifier] = {};
            }
            let answerText;
            switch (answer.questionType) {
                case 'choice':
                    answerText = answer.choices?.join(', ') || '-';
                    break;
                case 'date':
                    answerText = answer.date ? answer.date.toLocaleString() : '-';
                    break;
                case 'number':
                    answerText = answer.number ? String(answer.number) : '-';
                    break;
                case 'rating':
                    answerText = answer.rating ? String(answer.rating) : '-';
                    break;
                case 'file':
                    answerText = answer.files
                        ? answer.files
                            .map((media) => process.env.CDN_URL + media.src)
                            .join(', ')
                        : '-';
                    break;
                case 'text':
                default:
                    answerText = answer.text || '-';
                    break;
            }
            const username = usernames[userAuthIdentifier] || null;
            acc[userAuthIdentifier][answer.questionId] = answerText;
            acc[userAuthIdentifier].pollLink = username
                ? `https://noo-school.ru/polls/${poll.id}/results/${username}`
                : '-';
            return acc;
        }, {});
        return {
            header,
            data: Object.values(data),
        };
    }
    prepareCondition(selector) {
        switch (selector.prop) {
            case 'pollId':
                return {
                    id: selector.value,
                };
            case 'courseId':
                return {
                    courseAssignments: {
                        course: {
                            id: selector.value,
                        },
                    },
                };
            case 'role':
                return {
                    role: selector.value,
                };
        }
        throw new NotFoundError('Тип селектора не найден');
    }
}
