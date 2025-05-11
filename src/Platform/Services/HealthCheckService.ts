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
      const userCount = await this.userRepository.count()

      results.push({
        label: 'Users',
        status: userCount > 0 ? 'ok' : 'warning',
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
