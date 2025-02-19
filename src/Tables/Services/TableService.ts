import { User } from '@modules/Users/Data/User'
import { Table } from '../Data/Table'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { TableModel } from '../Data/TableModel'
import { Pagination } from '@modules/Core/Data/Pagination'
import { TableRepository } from '../Data/TableRepository'
import { TableCellRepository } from '../Data/TableCellRepository'

export class TableService {
  private readonly tableRepository: TableRepository

  private readonly cellRepository: TableCellRepository

  public constructor() {
    this.tableRepository = new TableRepository()
    this.cellRepository = new TableCellRepository()
  }

  public async getTables(userId: string, pagination: Pagination) {
    return this.tableRepository.search(
      {
        user: { id: userId },
      },
      pagination
    )
  }

  public async getTable(id: Table['id'], userId: User['id']): Promise<Table> {
    const table = await this.tableRepository.findOne(
      {
        id,
        user: { id: userId },
      },
      ['cells']
    )

    if (!table) {
      throw new NotFoundError('Таблица не найдена')
    }

    return table
  }

  public async createTable(
    data: Partial<Table>,
    userId: User['id']
  ): Promise<Table> {
    const table = new TableModel({
      ...data,
      user: { id: userId } as User,
    })

    return this.tableRepository.create(table)
  }

  public async updateTable(
    id: Table['id'],
    data: Partial<Table>,
    userId: User['id']
  ): Promise<Table> {
    const table = await this.tableRepository.findOne({
      id,
      user: { id: userId },
    })

    if (!table) {
      throw new NotFoundError('Таблица не найдена')
    }

    return this.tableRepository.update({
      ...table,
      ...data,
      id,
      user: { id: userId } as User,
    })
  }

  public async deleteTable(id: Table['id'], userId: User['id']) {
    const table = await this.tableRepository.findOne({
      id,
      user: { id: userId },
    })

    if (!table) {
      throw new NotFoundError('Таблица не найдена')
    }

    await this.tableRepository.delete(id)
  }
}
