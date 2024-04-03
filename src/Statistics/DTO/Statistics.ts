import { Plot } from '../Data/Plot'

export interface Statistics {
	entries: {
		name: string
		value: number
	}[]
	plots: Plot[]
}
