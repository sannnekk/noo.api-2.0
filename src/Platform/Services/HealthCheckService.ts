export type HealthCheckResult = {
  label: string
  status: 'ok' | 'error' | 'warning'
}

export class HealthCheckService {
  public async healthcheck(): Promise<HealthCheckResult[]> {
    return [
      {
        label: 'Event loop',
        status: 'ok',
      },
    ]
  }
}
