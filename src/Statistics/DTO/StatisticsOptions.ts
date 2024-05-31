import { Work } from '@modules/Works/Data/Work'

export interface StatisticsOptions {
	from: Date
	to: Date
	type?: Work['type']
}
