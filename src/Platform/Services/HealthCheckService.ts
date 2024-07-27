export type HealthCheckResult = {
  label: string
  status: 'ok' | 'error' | 'warning'
}

export class HealthCheckService {
  // TODO: Implement healthcheck
  public async healthcheck(): Promise<HealthCheckResult[]> {
    return [
      {
        label: 'Database',
        status: 'ok',
      },
    ]
  }
}
