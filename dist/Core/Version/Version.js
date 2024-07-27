export class Version {
    major;
    minor;
    patch;
    constructor(version) {
        const [major, minor, patch] = version.split('.').map(Number);
        this.major = major;
        this.minor = minor;
        this.patch = patch;
    }
    compare(version) {
        if (this.major !== version.major) {
            return this.major - version.major;
        }
        if (this.minor !== version.minor) {
            return this.minor - version.minor;
        }
        return this.patch - version.patch;
    }
}
