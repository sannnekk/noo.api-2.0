export class HealthCheckService {
    async healthcheck() {
        return [
            {
                label: 'Event loop',
                status: 'ok',
            },
        ];
    }
}
