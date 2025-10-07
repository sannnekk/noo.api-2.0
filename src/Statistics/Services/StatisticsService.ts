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
import Dates, { DatePrecision } from '@modules/Core/Utils/date'

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
        return this.getTeacherStatistics(user.id, from, to, type)
      case 'mentor':
        return this.getMentorStatistics(user.id, from, to, type)
      case 'student':
        return this.getStudentStatistics(user.id, from, to, type)
      case 'admin':
      case 'assistant':
      default:
        throw new WrongRoleError(
          'У администраторов и ассистентов нет статистики'
        )
    }
  }

  private async getTeacherStatistics(
    teacherId: string,
    from: Date,
    to: Date,
    type?: Work['type']
  ): Promise<Statistics> {
    const userRepositoryQueryBuilder = this.userRepository.queryBuilder('user')

    const assignedWorkRepositoryQueryBuilder =
      this.assignedWorkRepository.queryBuilder('assigned_work')

    if (type) {
      assignedWorkRepositoryQueryBuilder
        .leftJoin('assigned_work.work', 'work')
        .andWhere('work.type = :type', { type })
    }

    const usersCount = await userRepositoryQueryBuilder.clone().getCount()

    const studentsCount = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'student' })
      .getCount()

    const mentorsCount = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'mentor' })
      .getCount()

    const assistantCount = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'assistant' })
      .getCount()

    const teachersCount = await userRepositoryQueryBuilder
      .clone()
      .where('user.role = :role', { role: 'teacher' })
      .getCount()

    const usersOnlineCount = await this.sessionService.getOnlineUsersCount()

    const studentOnlineCount = await this.sessionService.getOnlineUsersCount({
      user: { role: 'student' },
    })

    const mentorOnlineCount = await this.sessionService.getOnlineUsersCount({
      user: { role: 'mentor' },
    })

    const assistantOnlineCount = await this.sessionService.getOnlineUsersCount({
      user: { role: 'assistant' },
    })

    const teacherOnlineCount = await this.sessionService.getOnlineUsersCount({
      user: { role: 'teacher' },
    })

    const usersActiveCount = await this.sessionService.getActiveUsersCount()

    const studentActiveCount = await this.sessionService.getActiveUsersCount({
      user: { role: 'student' },
    })

    const mentorActiveCount = await this.sessionService.getActiveUsersCount({
      user: { role: 'mentor' },
    })

    const totalAppUsers = await this.sessionService.getAppUsersCount()

    const onlineIOSAppUsers = await this.sessionService.getOnlineUsersCount({
      isApp: true,
      os: 'ios',
    })

    const onlineAndroidAppUsers = await this.sessionService.getOnlineUsersCount(
      {
        isApp: true,
        os: 'android',
      }
    )

    const totalAssignedWorks = await assignedWorkRepositoryQueryBuilder
      .clone()
      .getCount()

    const checkedWorks = await assignedWorkRepositoryQueryBuilder
      .clone()
      .andWhere('assigned_work.checked_at IS NOT NULL')
      .getCount()

    const automaticallyCheckedWorksCount =
      await assignedWorkRepositoryQueryBuilder
        .clone()
        .andWhere('assigned_work.check_status = :check_status', {
          check_status: 'checked-automatically',
        })
        .getCount()

    const totalAssignedWorksInDateRange =
      await assignedWorkRepositoryQueryBuilder
        .clone()
        .andWhere(this.getDateRange('assigned_work.created_at', from, to))
        .getCount()

    const checkedWorksInDateRange = await assignedWorkRepositoryQueryBuilder
      .clone()
      .andWhere('assigned_work.checked_at IS NOT NULL')
      .andWhere(this.getDateRange('assigned_work.checked_at', from, to))
      .getCount()

    const automaticallyCheckedWorksInDateRange =
      await assignedWorkRepositoryQueryBuilder
        .clone()
        .andWhere('assigned_work.check_status = :check_status', {
          check_status: 'checked-automatically',
        })
        .andWhere(this.getDateRange('assigned_work.checked_at', from, to))
        .getCount()

    const newUsersPerDay = (
      await userRepositoryQueryBuilder
        .clone()
        .select(['COUNT(user.id) as count', 'DATE(user.created_at) as date'])
        .where(this.getDateRange('user.created_at', from, to))
        .groupBy('date')
        .getRawMany()
    ).map((item) => ({
      date: Dates.format(item.date, 'YYYY-MM-DD'),
      count: item.count,
    }))

    const newUsersPerDayPlot = this.plotService.generatePlot<
      (typeof newUsersPerDay)[0]
    >(
      'Новые пользователи в день',
      newUsersPerDay,
      'secondary',
      (e) => e.date,
      (e) => parseInt(e.count)
    )

    const worksSolvedPerDay = (
      await assignedWorkRepositoryQueryBuilder
        .clone()
        .select([
          'COUNT(assigned_work.id) as count',
          'DATE(assigned_work.solved_at) as date',
        ])
        .andWhere('assigned_work.solved_at IS NOT NULL')
        .andWhere(this.getDateRange('assigned_work.solved_at', from, to))
        .groupBy('date')
        .orderBy('date', 'ASC')
        .getRawMany()
    ).map((item) => ({
      date: Dates.format(item.date, 'YYYY-MM-DD'),
      count: item.count,
    }))

    const worksSolvedPerDayPlot = this.plotService.generatePlot<
      (typeof worksSolvedPerDay)[0]
    >(
      'Сдано работ в день',
      worksSolvedPerDay,
      'secondary',
      (e) => e.date,
      (e) => parseInt(e.count)
    )

    return {
      sections: [
        {
          name: 'Пользователи',
          description: 'Статистика по ученикам, кураторам и преподавателям',
          plots: [newUsersPerDayPlot],
          entries: [
            {
              name: 'Всего пользователей',
              value: usersCount,
              subEntries: [
                {
                  name: 'Учителей',
                  value: teachersCount,
                },
                {
                  name: 'Ассистентов',
                  value: assistantCount,
                },
                {
                  name: 'Кураторов',
                  value: mentorsCount,
                },
                {
                  name: 'Учеников',
                  value: studentsCount,
                },
              ],
            },
            {
              name: 'Пользователей онлайн',
              description:
                'Количество пользователей, сделавших запрос за последние 15 минут',
              value: usersOnlineCount,
              subEntries: [
                {
                  name: 'Учителей',
                  value: teacherOnlineCount,
                },
                {
                  name: 'Ассистентов',
                  value: assistantOnlineCount,
                },
                {
                  name: 'Кураторов',
                  value: mentorOnlineCount,
                },
                {
                  name: 'Учеников',
                  value: studentOnlineCount,
                },
              ],
            },
            {
              name: 'Активных пользователей',
              description:
                'Количество пользователей, зашедших на платформу за последнюю неделю',
              value: usersActiveCount,
              subEntries: [
                {
                  name: 'Кураторов',
                  value: mentorActiveCount,
                },
                {
                  name: 'Учеников',
                  value: studentActiveCount,
                },
              ],
            },
            {
              name: 'Пользователи приложения',
              description:
                'Общее количество пользователей приложения iOS и Android',
              value: totalAppUsers,
              subEntries: [
                {
                  name: 'iOS-Онлайн',
                  value: onlineIOSAppUsers,
                },
                {
                  name: 'Android-Онлайн',
                  value: onlineAndroidAppUsers,
                },
              ],
            },
          ],
        },
        {
          name: 'Работы',
          description: 'Статистика по работам',
          plots: [worksSolvedPerDayPlot],
          entries: [
            {
              name: 'Всего работ',
              value: totalAssignedWorks,
              subEntries: [
                {
                  name: 'Проверено',
                  value: checkedWorks,
                },
                {
                  name: 'Проверено автоматически',
                  value: automaticallyCheckedWorksCount,
                },
              ],
            },
            {
              name: 'Работы за период',
              value: totalAssignedWorksInDateRange,
              subEntries: [
                {
                  name: 'Проверено',
                  value: checkedWorksInDateRange,
                },
                {
                  name: 'Проверено автоматически',
                  value: automaticallyCheckedWorksInDateRange,
                },
              ],
            },
          ],
        },
      ],
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
      .andWhere('assigned_work.solved_at IS NOT NULL')
      .getCount()

    const checked = await assignedWorksQueryBuilder
      .clone()
      .andWhere('assigned_work.check_status IN (:...statuses)', {
        statuses: ['checked-in-deadline', 'checked-after-deadline'],
      })
      .getCount()

    const notChecked = total - checked

    const checkedInDeadline = await assignedWorksQueryBuilder
      .clone()
      .andWhere('assigned_work.check_status = :solve_status', {
        solve_status: 'checked-in-deadline',
      })
      .getCount()

    const checkedAfterDeadline = await assignedWorksQueryBuilder
      .clone()
      .andWhere('assigned_work.check_status = :solve_status', {
        solve_status: 'checked-after-deadline',
      })
      .getCount()

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
      sections: [
        {
          name: 'Работы',
          description: 'Статистика по работам',
          plots: [scorePlot],
          entries: [
            {
              name: 'Всего работ',
              value: total,
              subEntries: [
                {
                  name: 'Проверено',
                  value: checked,
                  percentage: this.percentage(checked, total),
                },
                {
                  name: 'Не проверено',
                  value: notChecked,
                  percentage: this.percentage(notChecked, total),
                },
              ],
            },
            {
              name: 'Сдвиги дедлайнов',
              value: deadlinesShifted,
              subEntries: [
                {
                  name: 'Проверено в дедлайн',
                  value: checkedInDeadline,
                  percentage: this.percentage(checkedInDeadline, checked),
                },
                {
                  name: 'Проверено после дедлайна',
                  value: checkedAfterDeadline,
                  percentage: this.percentage(checkedAfterDeadline, checked),
                },
              ],
            },
          ],
        },
      ],
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
    const notCompleted = total - completed

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
      sections: [
        {
          name: 'Работы',
          description: 'Статистика по работам',
          plots: [scorePlot],
          entries: [
            {
              name: 'Всего работ',
              value: total,
              subEntries: [
                {
                  name: 'Сдано в дедлайн',
                  value: completedInDeadline,
                  percentage: this.percentage(completedInDeadline, total),
                },
                {
                  name: 'Сдано после дедлайна',
                  value: completedAfterDeadline,
                  percentage: this.percentage(completedAfterDeadline, total),
                },
                {
                  name: 'Не сдано',
                  value: notCompleted,
                  percentage: this.percentage(notCompleted, total),
                },
              ],
            },
            {
              name: 'Средний балл',
              value: parseFloat(averageScore || '0'),
            },
            {
              name: 'Сдвиги дедлайнов',
              value: deadlineShiftCount,
            },
          ],
        },
        {
          name: 'Статистика по месяцам',
          description:
            'Статистика по работам по месяцам. Показывает средний балл по работам (в %) за каждый месяц',
          plots: [monthPlot],
          entries: [],
        },
      ],
    }
  }

  private async getStudentMonthPlot(
    studentId: User['id']
  ): Promise<Statistics['sections'][0]['plots'][0]> {
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

  private getDateRange(
    prop: string,
    from: Date,
    to: Date,
    precision: DatePrecision = 'day'
  ): Brackets {
    switch (precision) {
      case 'day':
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        break
      case 'hour':
        from.setMinutes(0, 0, 0)
        to.setMinutes(59, 59, 999)
        break
      case 'minute':
        from.setSeconds(0, 0)
        to.setSeconds(59, 999)
        break
      case 'second':
        from.setMilliseconds(0)
        to.setMilliseconds(999)
        break
      case 'millisecond':
      default:
        break
    }

    return new Brackets((qb) => {
      qb.where(`${prop} >= :from`, { from })
      qb.andWhere(`${prop} <= :to`, { to })
    })
  }

  private percentage(part: number, total: number): number {
    return Math.round((part / total) * 100)
  }
}
