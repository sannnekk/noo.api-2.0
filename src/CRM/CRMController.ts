import { Controller, Post } from 'express-controller-decorator'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { DealsService } from './Services/DealsService'
import CrmAsserts from './Security/CrmAsserts'

@Controller('/crm')
export class CRMController {
  private readonly dealsService: DealsService

  constructor() {
    this.dealsService = new DealsService()
  }

  @Post('/deal/create')
  public async onDealCreation(context: Context): Promise<ApiResponse> {
    try {
      CrmAsserts.hasSecret(context)

      await this.dealsService.create('mock', 'abracadabra')

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Post('/deal/cancel')
  public async onDealrefund(context: Context): Promise<ApiResponse> {
    try {
      CrmAsserts.hasSecret(context)

      await this.dealsService.remove('mock')

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
