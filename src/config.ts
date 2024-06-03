export const config = {
	expressJson: {
		limit: process.env.MAX_REQUEST_SIZE,
		reviver: (_: never, value: any) => {
			if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
				return new Date(value)
			}

			return value
		},
	},
	expressUrlencoded: { extended: true, limit: process.env.MAX_REQUEST_SIZE },
}
