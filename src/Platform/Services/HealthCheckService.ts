import { UserRepository } from '@modules/Users/Data/UserRepository'

export type HealthCheckResult = {
  label: string
  status: 'ok' | 'error' | 'warning'
}

export class HealthCheckService {
  private readonly userRepository: UserRepository

  public constructor() {
    this.userRepository = new UserRepository()
  }

  public async healthcheck(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [
      {
        label: 'Event loop',
        status: 'ok',
      },
    ]

    try {
      const user = await this.userRepository.findOne({
        username: 'akjcbdytceuiocbjdcjsbskcdbc7689sidbjchsd',
      })

      results.push({
        label: 'Database: User table check',
        status: user === null ? 'ok' : 'warning',
      })
    } catch (error: any) {
      results.push({
        label: 'Database: ' + error.message,
        status: 'error',
      })
    }

    return results
  }
}
