import { AssignedWorkCommentModel } from '../../AssignedWorks/Data/Relations/AssignedWorkCommentModel.js';
import { AssignedWorkService } from '../../AssignedWorks/Services/AssignedWorkService.js';
import { isAutomaticallyCheckable } from '../../AssignedWorks/Utils/Task.js';
import { TaskCanNotBeCheckedByAiError } from '../Errors/TaskCanNotBeCheckedByAiError.js';
import { workAlreadyChecked, workAlreadyMade, } from '../../AssignedWorks/Utils/AssignedWork.js';
import { WorkIsNotSolvedYetError } from '../../AssignedWorks/Errors/WorkIsNotSolvedYetError.js';
import { WorkAlreadyCheckedError } from '../../AssignedWorks/Errors/WorkAlreadyCheckedError.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { isDeltaEmpty, toDelta } from '../../Core/Utils/delta.js';
import { log } from '../../Core/Logs/Logger.js';
import { AiInteractor } from './AiInteractor.js';
import { AiPromptGenerator } from './AiPromptGenerator.js';
import { AiResponseParser } from './AiResponseParser.js';
import { TASK_CRITERIA } from '../Criteria/TaskCriteria.js';
export class ShpuntikService {
    assignedWorkService;
    aiInteractor;
    aiPromptGenerator;
    aiResponseParser;
    constructor() {
        this.assignedWorkService = new AssignedWorkService();
        this.aiInteractor = new AiInteractor();
        this.aiPromptGenerator = new AiPromptGenerator();
        this.aiResponseParser = new AiResponseParser();
    }
    async checkTask(workId, taskId) {
        const work = await this.getCheckableWork(workId);
        const task = work.work.tasks.find((t) => t.id === taskId);
        if (!task) {
            throw new NotFoundError('Задание не найдено');
        }
        if (isAutomaticallyCheckable(task.type)) {
            throw new TaskCanNotBeCheckedByAiError('Это задание проверяется автоматически.');
        }
        const comment = await this.checkTaskOfWork(work, task);
        if (!comment) {
            throw new TaskCanNotBeCheckedByAiError('Ответ на задание пустой или задание уже прокомментировано.');
        }
        await this.assignedWorkService.saveAiComments(work.id, [comment]);
    }
    async removeComment(workId, taskId) {
        const work = await this.getCheckableWork(workId);
        if (!work.work.tasks.some((t) => t.id === taskId)) {
            throw new NotFoundError('Задание не найдено');
        }
        await this.assignedWorkService.removeTaskComment(work.id, taskId);
    }
    async getCheckableWork(workId) {
        const work = await this.assignedWorkService.getWorkById(workId, 'teacher');
        if (!workAlreadyMade(work)) {
            throw new WorkIsNotSolvedYetError();
        }
        if (workAlreadyChecked(work)) {
            throw new WorkAlreadyCheckedError();
        }
        return work;
    }
    /**
     * Checks a single task with AI.
     * Returns the comment to save or null if the task should be skipped.
     */
    async checkTaskOfWork(work, task) {
        const answer = work.answers.find((a) => a.taskId === task.id);
        let comment = work.comments.find((c) => c.taskId === task.id);
        if (!answer?.content ||
            isDeltaEmpty(answer.content) ||
            !isDeltaEmpty(comment?.content)) {
            return null;
        }
        if (!comment) {
            comment = new AssignedWorkCommentModel({ taskId: task.id, score: 0 });
        }
        const criteria = TASK_CRITERIA[task.type] ?? [];
        const prompt = this.aiPromptGenerator.generateCheckPrompt(task, answer.content, criteria);
        let aiResponse;
        try {
            aiResponse = await this.aiInteractor.sendRequest(prompt);
        }
        catch (error) {
            log('error', 'Shpuntik AI request failed', error?.message ?? error);
            aiResponse = '';
        }
        const parsed = this.aiResponseParser.parseTaskCheckResponse(aiResponse, task.highestScore, criteria);
        if (parsed.status === 'error') {
            comment.content = toDelta(`НОО.Шпунтик не смог проверить задание из-за ошибки: ${parsed.error}\n`);
            comment.score = comment.score ?? 0;
        }
        else {
            comment.content = parsed.feedback;
            comment.score = parsed.score;
            comment.detailedScore = parsed.detailedScore;
        }
        return comment;
    }
}
