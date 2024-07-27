import { config } from '@modules/config'
import {
  type HealthCheckResult,
  HealthCheckService,
} from './HealthCheckService'
import { type ChangelogItem } from '../Types/Changelog'
import fs from 'fs'
import { CantReadChangelogError } from '../Errors/CantReadChangelogError'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Version } from '@modules/Core/Version/Version'

export class PlatformService {
  private readonly healthCheckService: HealthCheckService

  public constructor() {
    this.healthCheckService = new HealthCheckService()
  }

  public async version(): Promise<string> {
    return config.version
  }

  public async healthcheck(): Promise<HealthCheckResult[]> {
    return this.healthCheckService.healthcheck()
  }

  public async changelog(): Promise<ChangelogItem[]> {
    return this.readChangelog()
  }

  public async changelogForVersion(version: Version): Promise<ChangelogItem> {
    const changelog = await this.readChangelog()

    const item = changelog.find((change) =>
      version.compare(new Version(change.version))
    )

    if (!item) {
      throw new NotFoundError('Версия не найдена')
    }

    return item
  }

  private async readChangelog(): Promise<ChangelogItem[]> {
    try {
      const raw = await fs.promises.readFile(config.changelogPath, 'utf8')

      return JSON.parse(raw)
    } catch (error: any) {
      throw new CantReadChangelogError()
    }
  }
}
