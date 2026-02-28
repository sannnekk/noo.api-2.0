export class Version {
  public readonly major: number

  public readonly minor: number

  public readonly patch: number

  public constructor(version: string) {
    const [major, minor, patch] = version.split('.').map(Number)

    this.major = major
    this.minor = minor
    this.patch = patch
  }

  public compare(version: Version): number {
    if (this.major !== version.major) {
      return this.major - version.major
    }

    if (this.minor !== version.minor) {
      return this.minor - version.minor
    }

    return this.patch - version.patch
  }
}
