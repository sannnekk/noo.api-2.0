import { UserRepository } from '@modules/Users/Data/UserRepository'
import { WrongRoleError } from '@modules/Core/Errors/WrongRoleError'
import { Brackets } from 'typeorm'
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel'
import { Work } from '@modules/Works/Data/Work'
import { User } from '@modules/Users/Data/User'
import { PlotService } from './PlotService'
import { Statistics } from '../DTO/Statistics'
import { AssignedWorkRepository } from '../../AssignedWorks/Data/AssignedWorkRepository'
import { StatisticsOptions } from '../DTO/StatisticsOptions'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { SessionService } from '@modules/Sessions/Services/SessionService'

export class StatisticsService {
  private readonly assignedWorkRepository: AssignedWorkRepository

  private readonly userRepository: UserRepository

  private readonly sessionService: SessionService

  private readonly plotService: PlotService

  public constructor() {
    this.assignedWorkRepository = new AssignedWorkRepository()
    this.userRepository = new UserRepository()
    this.sessionService = new SessionService()
    this.plotService = new PlotService()
  }

  public async getStatistics(username: string, options: StatisticsOptions) {
    const { from, to, type } = options
    const user = await this.userRepository.findOne({ username })

    if (!user) {
      throw new NotFoundError('Пользователь не найден')
    }

    switch (user.role) {
      case 'teacher':
        return this.getTeacherStatistics(user.id, from, to)
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
    to: Date
  ): Promise<Statistics> {
    const userRepositoryQueryBuilder = this.userRepository.queryBuilder('user')

    const assignedWorkRepositoryQueryBuilder =
      this.assignedWorkRepository.queryBuilder('assigned_work')

    const usersCount = await userRepositoryQueryBuilder.clone().getCount()

    const usersOnlineCount = await this.sessionService.getOnlineUsersCount()

    const studentsCount = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'student' })
      .getCount()

    const mentorsCount = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'mentor' })
      .getCount()

    const teachersCount = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'teacher' })
      .getCount()

    const usersCountInRange = await userRepositoryQueryBuilder
      .clone()
      .andWhere(this.getDateRange('user.created_at', from, to))
      .getCount()

    const studentsCountInRange = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'student' })
      .andWhere(this.getDateRange('user.created_at', from, to))
      .getCount()

    const mentorsCountInRange = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'mentor' })
      .andWhere(this.getDateRange('user.created_at', from, to))
      .getCount()

    const teachersCountInRange = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'teacher' })
      .andWhere(this.getDateRange('user.created_at', from, to))
      .getCount()

    const totalAssignedWorks = await assignedWorkRepositoryQueryBuilder
      .clone()
      .getCount()

    const checkedWorks = await assignedWorkRepositoryQueryBuilder
      .clone()
      .andWhere('assigned_work.checked_at IS NOT NULL')
      .getCount()

    const totalAssignedWorksInDateRange =
      await assignedWorkRepositoryQueryBuilder
        .clone()
        .andWhere(this.getDateRange('assigned_work.created_at', from, to))
        .getCount()

    const checkedWorksInDateRange = await assignedWorkRepositoryQueryBuilder
      .clone()
      .andWhere('assigned_work.checked_at IS NOT NULL')
      .andWhere(this.getDateRange('assigned_work.created_at', from, to))
      .getCount()

    const newUsersPerDay = (
      await userRepositoryQueryBuilder
        .clone()
        .select(['COUNT(user.id) as count', 'DATE(user.created_at) as date'])
        .groupBy('date')
        .getRawMany()
    ).map((item) => ({ date: new Date(item.date), count: item.count }))

    const newUsersPerDayPlot = this.plotService.generatePlot<
      (typeof newUsersPerDay)[0]
    >(
      'Новые пользователи в день',
      newUsersPerDay,
      'secondary',
      (e) => e.date.toISOString().split('T')[0],
      (e) => parseInt(e.count)
    )

    const worksSolvedPerDay = (
      await assignedWorkRepositoryQueryBuilder
        .clone()
        .select([
          'COUNT(assigned_work.id) as count',
          'DATE(assigned_work.checked_at) as date',
        ])
        .andWhere('assigned_work.checked_at IS NOT NULL')
        .groupBy('date')
        .getRawMany()
    ).map((item) => ({ date: new Date(item.date), count: item.count }))

    const worksSolvedPerDayPlot = this.plotService.generatePlot<
      (typeof worksSolvedPerDay)[0]
    >(
      'Сдано работ в день',
      worksSolvedPerDay,
      'secondary',
      (e) => e.date.toISOString().split('T')[0],
      (e) => parseInt(e.count)
    )

    return {
      entries: [
        {
          name: 'Всего пользователей',
          value: usersCount,
        },
        {
          name: 'Пользователей онлайн',
          value: usersOnlineCount,
        },
        {
          name: 'Всего учеников',
          value: studentsCount,
        },
        {
          name: 'Всего кураторов',
          value: mentorsCount,
        },
        {
          name: 'Всего учителей',
          value: teachersCount,
        },
        {
          name: 'Всего пользователей за период',
          value: usersCountInRange,
        },
        {
          name: 'Всего учеников за период',
          value: studentsCountInRange,
        },
        {
          name: 'Всего кураторов за период',
          value: mentorsCountInRange,
        },
        {
          name: 'Всего учителей за период',
          value: teachersCountInRange,
        },
        {
          name: 'Всего работ',
          value: totalAssignedWorks,
        },
        {
          name: 'Проверено работ',
          value: checkedWorks,
        },
        {
          name: 'Всего работ за период',
          value: totalAssignedWorksInDateRange,
        },
        {
          name: 'Проверено работ за период',
          value: checkedWorksInDateRange,
        },
      ],
      plots: [newUsersPerDayPlot, worksSolvedPerDayPlot],
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

    const total: number | string = await assignedWorksQueryBuilder
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

    const checkedInDeadlinePercent = Math.round(
      (checkedInDeadline / total) * 100
    )

    const checkedAfterDeadline = await assignedWorksQueryBuilder
      .clone()
      .andWhere('assigned_work.solve_status = :solve_status', {
        solve_status: 'checked-after-deadline',
      })
      .getCount()

    const checkedAfterDeadlinePercent = Math.round(
      (checkedAfterDeadline / total) * 100
    )

    const deadlinesShifted = await assignedWorksQueryBuilder
      .clone()
      .andWhere(
        'assigned_work.check_deadline_shifted = :check_deadline_shifted',
        {
          check_deadline_shifted: true,
        }
      )
      .getCount()

    // TODO: Implement transfered works count
    /* const transfered = await assignedWorksQueryBuilder
			.leftJoin('assigned_work.mentors', 'mentor')
			.where('mentor.id = :mentorId', { mentorId })
			.andWhere('transfered = true')
			.andWhere(this.getDateRange('created_at', from, to))
			.getCount() */

    const scores = await assignedWorksQueryBuilder
      .clone()
      .select([
        'AVG(assigned_work.score / assigned_work.max_score * 100) as score',
        'assigned_work.created_at as created_at',
      ])
      .andWhere('assigned_work.score IS NOT NULL')
      .groupBy('created_at')
      .getRawMany()

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
          name: 'Проверено в дедлайн (%)',
          value: checkedInDeadlinePercent || 0,
        },
        {
          name: 'Проверено после дедлайна',
          value: checkedAfterDeadline,
        },
        {
          name: 'Проверено после дедлайна (%)',
          value: checkedAfterDeadlinePercent || 0,
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

    const completedInDeadlinePercent = Math.round(
      (completedInDeadline / total) * 100
    )

    const completedAfterDeadline = await assignedWorksQueryBuilder
      .clone()
      .andWhere('assigned_work.solve_status = :solve_status', {
        solve_status: 'made-after-deadline',
      })
      .getCount()

    const completedAfterDeadlinePercent = Math.round(
      (completedAfterDeadline / total) * 100
    )

    const completed = completedInDeadline + completedAfterDeadline
    const notCompleted = total - completedInDeadline - completedAfterDeadline

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
      .andWhere(
        'assigned_work.solve_deadline_shifted = :solve_deadline_shifted',
        {
          solve_deadline_shifted: true,
        }
      )
      .getCount()

    const scores = await assignedWorksQueryBuilder
      .clone()
      .select([
        'ROUND(assigned_work.score / assigned_work.max_score * 100) as score',
        'assigned_work.solve_status as solve_status',
        'assigned_work.created_at as created_at',
      ])
      .andWhere('assigned_work.score IS NOT NULL')
      .getRawMany()

    const scorePlot = this.plotService.generatePlot<(typeof scores)[0]>(
      'Балл по работам (в %)',
      scores,
      'secondary',
      (e) => e.created_at.toISOString().split('T')[0],
      (e) => parseFloat(e.score || '0'),
      (e) => AssignedWorkModel.readableSolveStatus(e.solve_status)
    )

    const monthPlot = await this.getStudentMonthPlot(studentId)

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
          name: 'Выполнено в дедлайн (%)',
          value: completedInDeadlinePercent || 0,
        },
        {
          name: 'Выполнено после дедлайна',
          value: completedAfterDeadline,
        },
        {
          name: 'Выполнено после дедлайна (%)',
          value: completedAfterDeadlinePercent || 0,
        },
        {
          name: 'Сдвиги дедлайнов',
          value: deadlineShiftCount,
        },
        {
          name: 'Средний балл (в %)',
          value: parseFloat(parseFloat(averageScore).toFixed(2)) || 0,
        },
      ],
      plots: [scorePlot, monthPlot],
    }
  }

  private async getStudentMonthPlot(
    studentId: User['id']
  ): Promise<Statistics['plots'][0]> {
    const scores = await this.assignedWorkRepository
      .queryBuilder('assigned_work')
      .select([
        'AVG(ROUND(assigned_work.score / assigned_work.max_score * 100)) as score',
        'COUNT(assigned_work.id) as count',
        "CONCAT(MONTH(assigned_work.created_at), ' ', YEAR(assigned_work.created_at)) as date",
      ])
      .where('assigned_work.studentId = :studentId', { studentId })
      .andWhere('assigned_work.score IS NOT NULL')
      .groupBy('date')
      .getRawMany()

    const monthPlot = this.plotService.generatePlot<(typeof scores)[0]>(
      'Балл по работам (в %) по месяцам',
      scores,
      'secondary',
      (e) =>
        `${this.getMonth(parseInt(e.date.split(' ')[0]) - 1)} ${
          e.date.split(' ')[1]
        }`,
      (e) => parseFloat(e.score || '0'),
      (e) => `Количество работ: ${e.count.toString()}`
    )

    return monthPlot
  }

  private getMonth(month: number): string {
    switch (month) {
      case 0:
        return 'Январь'
      case 1:
        return 'Февраль'
      case 2:
        return 'Март'
      case 3:
        return 'Апрель'
      case 4:
        return 'Май'
      case 5:
        return 'Июнь'
      case 6:
        return 'Июль'
      case 7:
        return 'Август'
      case 8:
        return 'Сентябрь'
      case 9:
        return 'Октябрь'
      case 10:
        return 'Ноябрь'
      case 11:
      default:
        return 'Декабрь'
    }
  }

  private getDateRange(prop: string, from: Date, to: Date): Brackets {
    return new Brackets((qb) => {
      qb.where(`${prop} >= :from`, { from })
      qb.andWhere(`${prop} <= :to`, { to })
    })
  }
}
