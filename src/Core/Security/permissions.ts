export const Permissions = Object.freeze({
	checkWorks: 1 << 0,
	createWorks: 1 << 1,
	createCourses: 1 << 2,
} as const)

export class PermissionResolver {
	private permissions: number

	constructor(permissions: number) {
		this.permissions = permissions
	}

	public has(permission: keyof typeof Permissions): boolean {
		return (
			(this.permissions & Permissions[permission]) ===
			Permissions[permission]
		)
	}
}
