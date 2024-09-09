import { config } from '../../config.js';
import { HealthCheckService, } from './HealthCheckService.js';
import fs from 'fs';
import { CantReadChangelogError } from '../Errors/CantReadChangelogError.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { Version } from '../../Core/Version/Version.js';
export class PlatformService {
    healthCheckService;
    constructor() {
        this.healthCheckService = new HealthCheckService();
    }
    async version() {
        return config.version;
    }
    async healthcheck() {
        return this.healthCheckService.healthcheck();
    }
    async changelog() {
        return this.readChangelog();
    }
    async changelogForVersion(version) {
        const changelog = await this.readChangelog();
        const item = changelog.find((change) => version.compare(new Version(change.version)));
        if (!item) {
            throw new NotFoundError('Версия не найдена');
        }
        return item;
    }
    async readChangelog() {
        try {
            const raw = await fs.promises.readFile(config.changelogPath, 'utf8');
            return JSON.parse(raw);
        }
        catch (error) {
            throw new CantReadChangelogError();
        }
    }
    /**
     * Makes a heapdump using v8-profiler-next and returns the path to the file
     *
     * @returns {string} Path to the heapdump file
     */
    async heapdump() {
        // TODO: Implement heapdump
        /*  const { writeSnapshot } = await import('v8-profiler-next')
    
        const path = `${config.heapdumpPath}/${Date.now()}.heapsnapshot`
    
        writeSnapshot(path) */
        return '';
    }
}
