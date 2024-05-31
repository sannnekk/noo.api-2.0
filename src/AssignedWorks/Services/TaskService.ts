import { AssignedWorkAnswer } from '../Data/Relations/AssignedWorkAnswer'
import { AssignedWorkComment } from '../Data/Relations/AssignedWorkComment'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'

export class TaskService {
	public automatedCheck(
		tasks: WorkTask[],
		answers: AssignedWorkAnswer[]
	): AssignedWorkComment[] {
		const comments: AssignedWorkComment[] = []

		for (const answer of answers) {
			const relatedTask = tasks.find((task) => task.id === answer.taskId)

			if (!relatedTask || relatedTask.type === 'text') {
				continue
			}

			const comment: Omit<AssignedWorkComment, 'id' | 'slug'> = {
				content: {
					ops: [
						{
							insert: '',
						},
					],
				},
				score: this.checkAnswer(answer, relatedTask),
				task: answer.taskId as any,
				taskId: answer.taskId,
				createdAt: new Date(),
				updatedAt: new Date(),
			}

			comments.push(<AssignedWorkComment>comment)
		}

		return comments
	}

	private checkAnswer(answer: AssignedWorkAnswer, task: WorkTask): number {
		const maxScore = task.highestScore

		if (task.rightAnswer?.includes('|')) {
			const rightAnswers = task.rightAnswer.split('|')

			const scores = rightAnswers.map((rightAnswer) => {
				switch (task.type) {
					case 'word':
						return this.checkWord(
							answer.word,
							rightAnswer,
							maxScore,
							task.checkingStrategy
						)
					default:
						return 0
				}
			})

			return Math.max(...scores)
		}

		switch (task.type) {
			case 'word':
				return this.checkWord(
					answer.word,
					task.rightAnswer,
					maxScore,
					task.checkingStrategy
				)
			default:
				return 0
		}
	}

	private checkWord(
		word: string | undefined,
		rightAnswer: string | undefined,
		maxScore: number,
		checkingStrategy: WorkTask['checkingStrategy']
	): number {
		if (!word || !rightAnswer) {
			return 0
		}

		word = word.toLowerCase().replaceAll(' ', '')
		rightAnswer = rightAnswer.toLowerCase().replaceAll(' ', '')

		switch (checkingStrategy) {
			case 'type1':
				return this.checkType1(word, rightAnswer, maxScore)
			case 'type2':
				return this.checkType2(word, rightAnswer, maxScore)
			case 'type3':
				return this.checkType3(word, rightAnswer, maxScore)
			case 'type4':
			default:
				return this.checkType4(word, rightAnswer, maxScore)
		}
	}

	/**
	 * First type (exact match or 0):
	 *  - 1 symbol difference: 0
	 */
	private checkType1(word: string, exact: string, maxScore: number): number {
		return word.trim().toLowerCase() === exact.trim().toLowerCase()
			? maxScore
			: 0
	}

	/**
	 * Second type (for everu wrong character -1):
	 *  - 1 symbol difference: -1
	 */
	private checkType2(word: string, exact: string, maxScore: number): number {
		exact = exact.trim().toLowerCase()
		word = word.trim().toLowerCase().padEnd(exact.length, ' ')
		let score = maxScore

		for (let i = 0; i < word.length; i++) {
			if (word[i] !== exact[i]) {
				score--
			}
		}

		return score < 0 ? 0 : score
	}

	/**
	 * Third type (for every wrong character -1, for every extra character -1, for every missing character -1):
	 *  - 1 symbol difference: -1
	 */
	private checkType3(word: string, exact: string, maxScore: number): number {
		exact = exact.trim().toLowerCase()
		let score = maxScore - Math.abs(word.length - exact.length)
		word = word.trim().toLowerCase().padEnd(exact.length, ' ')

		for (let i = 0; i < exact.length; i++) {
			if (word[i] !== exact[i]) {
				score--
			}
		}

		return score < 0 ? 0 : score
	}

	/**
	 * Fourth type:
	 *  - 2 or less symbol difference: -1
	 *  - for every extra character -1
	 *  - else 0
	 */
	private checkType4(word: string, exact: string, maxScore: number): number {
		exact = exact.trim().toLowerCase()
		word = word.trim().toLowerCase()

		maxScore = maxScore - Math.abs(word.length - exact.length)

		word = word.padEnd(exact.length, ' ')

		let errorCount = 0

		for (let i = 0; i < word.length; i++) {
			if (word[i] !== exact[i]) {
				errorCount++
			}
		}

		return errorCount === 0 ? maxScore : errorCount <= 2 ? maxScore - 1 : 0
	}
}
