import { Controller, Post, Req, Res } from '@decorators/express'
import { DealsService } from './Services/DealsService'
import { Context } from '@modules/Core/Request/Context'
import CrmAsserts from './Security/CrmAsserts'
import { Request, Response } from 'express'

@Controller('/crm')
export class CRMController {
	private readonly dealsService: DealsService

	constructor() {
		this.dealsService = new DealsService()
	}

	@Post('/deal/create')
	public async onDealCreation(
		@Req() req: Request,
		@Res() res: Response
	) {
		// @ts-ignore
		const context = req.context as Context

		try {
			CrmAsserts.hasSecret(context)
		} catch (error: any) {
		} finally {
			res.status(201).send({ data: null })
		}
	}

	@Post('/deal/cancel')
	public async onDealrefund(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			CrmAsserts.hasSecret(context)
		} catch (error: any) {
		} finally {
			res.status(201).send({ data: null })
		}
	}
}
