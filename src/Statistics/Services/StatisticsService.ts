import { AssignedWorkRepository } from './../../AssignedWorks/Data/AssignedWorkRepository'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { WrongRoleError } from '@modules/core/Errors/WrongRoleError'
import { Brackets } from 'typeorm'
import { Statistics } from '../DTO/Statistics'
import { PlotService } from './PlotService'
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { Work } from '@modules/Works/Data/Work'

export class StatisticsService {
	private readonly assignedWorkRepository: AssignedWorkRepository
	private readonly userRepository: UserRepository
	private readonly plotService: PlotService

	public constructor() {
		this.assignedWorkRepository = new AssignedWorkRepository()
		this.userRepository = new UserRepository()
		this.plotService = new PlotService()
	}

	public async getStatistics(
		username: string,
		from: Date,
		to: Date,
		type?: Work['type']
	) {
		const user = await this.userRepository.findOne({ username })

		if (!user) {
			throw new Error('Пользователь не найден')
		}

		switch (user.role) {
			case 'teacher':
				return this.getTeacherStatistics(user.id, from, to, type)
			case 'mentor':
				return this.getMentorStatistics(user.id, from, to, type)
			case 'student':
				return this.getStudentStatistics(user.id, from, to, type)
			case 'admin':
			default:
				throw new WrongRoleError('У администраторов нет статистики')
		}
	}

	private async getTeacherStatistics(
		teacherId: string,
		from: Date,
		to: Date,
		type?: Work['type']
	): Promise<Statistics> {
		return {
			entries: [],
			plots: [],
		}
	}

	private async getMentorStatistics(
		mentorId: string,
		from: Date,
		to: Date,
		type?: Work['type']
	): Promise<Statistics> {
		const assignedWorksQueryBuilder = this.assignedWorkRepository
			.queryBuilder('assigned_work')
			.leftJoin('assigned_work.mentors', 'mentor')
			.where('mentor.id = :mentorId', { mentorId })
			.andWhere(this.getDateRange('assigned_work.created_at', from, to))

		if (type) {
			assignedWorksQueryBuilder
				.leftJoin('assigned_work.work', 'work')
				.andWhere('work.type = :type', { type })
		}

		let total: number | string = await assignedWorksQueryBuilder
			.clone()
			.getCount()

		const checked = await assignedWorksQueryBuilder
			.clone()
			.andWhere('assigned_work.checked_at IS NOT NULL')
			.getCount()

		const notChecked = total - checked

		const checkedInDeadline = await assignedWorksQueryBuilder
			.clone()
			.andWhere('assigned_work.solve_status = :solve_status', {
				solve_status: 'checked-in-deadline',
			})
			.getCount()

		const checkedAfterDeadline = await assignedWorksQueryBuilder
			.clone()
			.andWhere('assigned_work.solve_status = :solve_status', {
				solve_status: 'checked-after-deadline',
			})
			.getCount()

		const deadlinesShifted = await assignedWorksQueryBuilder
			.clone()
			.andWhere('assigned_work.solve_deadline_shifted = true')
			.getCount()

		// TODO: Implement transfered works count
		/* const transfered = await assignedWorksQueryBuilder
			.leftJoin('assigned_work.mentors', 'mentor')
			.where('mentor.id = :mentorId', { mentorId })
			.andWhere('transfered = true')
			.andWhere(this.getDateRange('created_at', from, to))
			.getCount() */

		const scores = (await assignedWorksQueryBuilder
			.clone()
			.select([
				'AVG(assigned_work.score / assigned_work.max_score * 100) as score',
				'assigned_work.created_at as created_at',
			])
			.andWhere('assigned_work.score IS NOT NULL')
			.groupBy('created_at')
			.getRawMany()) as {
			score: string
			created_at: Date
		}[]

		const scorePlot = this.plotService.generatePlot<(typeof scores)[0]>(
			'Средний балл по работам учеников (в %)',
			scores,
			'secondary',
			(e) => e.created_at.toISOString().split('T')[0],
			(e) => parseFloat(e.score || '0')
		)

		return {
			entries: [
				{
					name: 'Всего работ',
					value: total,
				},
				{
					name: 'Проверено',
					value: checked,
				},
				{
					name: 'Не проверено',
					value: notChecked,
				},
				{
					name: 'Проверено в дедлайн',
					value: checkedInDeadline,
				},
				{
					name: 'Проверено после дедлайна',
					value: checkedAfterDeadline,
				},
				{
					name: 'Сдвиги дедлайнов',
					value: deadlinesShifted,
				},
				// {
				// 	name: 'Передано другому куратору',
				// 	value: transfered,
				// },
			],
			plots: [scorePlot],
		}
	}

	private async getStudentStatistics(
		studentId: string,
		from: Date,
		to: Date,
		type?: Work['type']
	): Promise<Statistics> {
		const assignedWorksQueryBuilder = this.assignedWorkRepository
			.queryBuilder('assigned_work')
			.where('assigned_work.studentId = :studentId', { studentId })
			.andWhere(this.getDateRange('assigned_work.created_at', from, to))

		if (type) {
			assignedWorksQueryBuilder
				.leftJoin('assigned_work.work', 'work')
				.andWhere('work.type = :type', { type })
		}

		const total = await assignedWorksQueryBuilder.clone().getCount()

		const completedInDeadline = await assignedWorksQueryBuilder
			.clone()
			.andWhere('assigned_work.solve_status = :solve_status', {
				solve_status: 'made-in-deadline',
			})
			.getCount()

		const completedAfterDeadline = await assignedWorksQueryBuilder
			.clone()
			.andWhere('assigned_work.solve_status = :solve_status', {
				solve_status: 'made-after-deadline',
			})
			.getCount()

		const completed = completedInDeadline + completedAfterDeadline
		const notCompleted =
			total - completedInDeadline - completedAfterDeadline

		const { averageScore } = (await assignedWorksQueryBuilder
			.clone()
			.select(
				'AVG(assigned_work.score / assigned_work.max_score * 100)',
				'averageScore'
			)
			.andWhere('assigned_work.score IS NOT NULL')
			.getRawOne()) as { averageScore: string }

		const deadlineShiftCount = await assignedWorksQueryBuilder
			.clone()
			.andWhere('assigned_work.solve_deadline_shifted = true')
			.getCount()

		const scores = (await assignedWorksQueryBuilder
			.clone()
			.select([
				'ROUND(assigned_work.score / assigned_work.max_score * 100) as score',
				'assigned_work.solve_status as solve_status',
				'assigned_work.created_at as created_at',
			])
			.andWhere('assigned_work.score IS NOT NULL')
			.getRawMany()) as {
			score: string
			solve_status: AssignedWork['solveStatus']
			created_at: Date
		}[]

		const scorePlot = this.plotService.generatePlot<(typeof scores)[0]>(
			'Балл по работам (в %)',
			scores,
			'secondary',
			(e) => e.created_at.toISOString().split('T')[0],
			(e) => parseFloat(e.score || '0'),
			(e) => AssignedWorkModel.readableSolveStatus(e.solve_status)
		)

		return {
			entries: [
				{
					name: 'Всего работ',
					value: total,
				},
				{
					name: 'Выполнено',
					value: completed,
				},
				{
					name: 'Не выполнено',
					value: notCompleted,
				},
				{
					name: 'Выполнено в дедлайн',
					value: completedInDeadline,
				},
				{
					name: 'Выполнено после дедлайна',
					value: completedAfterDeadline,
				},
				{
					name: 'Сдвиги дедлайнов',
					value: deadlineShiftCount,
				},
				{
					name: 'Средний балл (в %)',
					value: parseFloat(parseFloat(averageScore).toFixed(3)) || 0,
				},
			],
			plots: [scorePlot],
		}
	}

	private getDateRange(prop: string, from: Date, to: Date): Brackets {
		return new Brackets((qb) => {
			qb.where(`${prop} >= :from`, { from })
			qb.andWhere(`${prop} <= :to`, { to })
		})
	}
}
