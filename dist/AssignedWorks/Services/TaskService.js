import Dates from '../../Core/Utils/date.js';
import { AssignedWorkCommentModel } from '../Data/Relations/AssignedWorkCommentModel.js';
import { isAutomaticallyCheckable } from '../Utils/Task.js';
export class TaskService {
    automatedCheck(tasks, answers) {
        const comments = [];
        const checkedTaskIds = new Set();
        for (const answer of answers) {
            if (checkedTaskIds.has(answer.taskId)) {
                continue;
            }
            const relatedTask = tasks.find((task) => task.id === answer.taskId);
            if (!relatedTask) {
                continue;
            }
            if (!isAutomaticallyCheckable(relatedTask.type)) {
                continue;
            }
            const comment = {
                content: {
                    ops: [
                        {
                            insert: '',
                        },
                    ],
                },
                score: this.checkAnswer(answer, relatedTask),
                detailedScore: null,
                taskId: answer.taskId,
                createdAt: Dates.now(),
                updatedAt: Dates.now(),
            };
            comments.push(new AssignedWorkCommentModel(comment));
            checkedTaskIds.add(answer.taskId);
        }
        return comments;
    }
    checkAnswer(answer, task) {
        const maxScore = task.highestScore;
        if (task.rightAnswer?.includes('|')) {
            const rightAnswers = task.rightAnswer.split('|');
            const scores = rightAnswers.map((rightAnswer) => {
                switch (task.type) {
                    case 'word':
                        return this.checkWord(answer.word, rightAnswer, maxScore, task.checkingStrategy);
                    default:
                        return 0;
                }
            });
            return Math.max(...scores);
        }
        switch (task.type) {
            case 'word':
                return this.checkWord(answer.word, task.rightAnswer, maxScore, task.checkingStrategy);
            default:
                return 0;
        }
    }
    checkWord(word, rightAnswer, maxScore, checkingStrategy) {
        if (!word || !rightAnswer) {
            return 0;
        }
        word = word.toLowerCase().replaceAll(' ', '');
        rightAnswer = rightAnswer.toLowerCase().replaceAll(' ', '');
        switch (checkingStrategy) {
            case 'type1':
                return this.checkType1(word, rightAnswer, maxScore);
            case 'type2':
                return this.checkType2(word, rightAnswer, maxScore);
            case 'type3':
                return this.checkType3(word, rightAnswer, maxScore);
            case 'type4':
            default:
                return this.checkType4(word, rightAnswer, maxScore);
        }
    }
    /**
     * First type (exact match or 0):
     *  - 1 symbol difference: 0
     */
    checkType1(word, exact, maxScore) {
        return word.trim().toLowerCase() === exact.trim().toLowerCase()
            ? maxScore
            : 0;
    }
    /**
     * Second type (for everu wrong character -1):
     *  - 1 symbol difference: -1
     */
    checkType2(word, exact, maxScore) {
        exact = exact.trim().toLowerCase();
        word = word.trim().toLowerCase().padEnd(exact.length, ' ');
        let score = maxScore;
        for (let i = 0; i < word.length; i++) {
            if (word[i] !== exact[i]) {
                score--;
            }
        }
        return score < 0 ? 0 : score;
    }
    /**
     * Third type (for every wrong character -1, for every extra character -1, for every missing character -1):
     *  - 1 symbol difference: -1
     */
    checkType3(word, exact, maxScore) {
        exact = exact.trim().toLowerCase();
        word = word.trim().toLowerCase();
        let score = maxScore;
        for (let i = 0; i < exact.length; i++) {
            if (!word.includes(exact[i])) {
                score--;
            }
        }
        let missingLetters = 0;
        if (exact.length < word.length) {
            for (let i = 0; i < word.length; i++) {
                if (!exact.includes(word[i])) {
                    missingLetters++;
                }
            }
            if (word.length - exact.length !== missingLetters) {
                return 0;
            }
        }
        score = score - missingLetters;
        return score < 0 ? 0 : score;
    }
    /**
     * Fourth type:
     *  - 2 or less symbol difference: -1
     *  - for every extra character -1
     *  - else 0
     */
    checkType4(word, exact, maxScore) {
        exact = exact.trim().toLowerCase();
        word = word.trim().toLowerCase();
        maxScore -= Math.abs(word.length - exact.length);
        word = word.padEnd(exact.length, ' ');
        let errorCount = 0;
        for (let i = 0; i < word.length; i++) {
            if (word[i] !== exact[i]) {
                errorCount++;
            }
        }
        return errorCount === 0 ? maxScore : errorCount <= 2 ? maxScore - 1 : 0;
    }
}
