export class HealthCheckService {
    // TODO: Implement healthcheck
    async healthcheck() {
        return [
            {
                label: 'Database',
                status: 'ok',
            },
        ];
    }
}
