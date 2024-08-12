import { SelectQueryBuilder } from 'typeorm'
import { BaseModel, Model } from './Model'

export abstract class SearchableModel extends Model {
  /**
   * Used to add search to a query
   *
   * @param query The query to add the search to
   * @param needle The search string
   * @return Relations to join to the query
   */
  public abstract addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[]
}
