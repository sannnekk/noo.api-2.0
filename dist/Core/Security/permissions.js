export const Permissions = Object.freeze({
    checkWorks: 1 << 0,
    createWorks: 1 << 1,
    createCourses: 1 << 2,
});
export class PermissionResolver {
    permissions;
    constructor(permissions) {
        this.permissions = permissions;
    }
    has(permission) {
        return ((this.permissions & Permissions[permission]) ===
            Permissions[permission]);
    }
}
