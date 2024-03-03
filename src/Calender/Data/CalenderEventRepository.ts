import { Repository } from '@core'
import { CalenderEvent } from './CalenderEvent'
import { CalenderEventModel } from './CalenderEventModel'

export class CalenderEventRepository extends Repository<CalenderEvent> {
	constructor() {
		super(CalenderEventModel)
	}
}
