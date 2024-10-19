import { Repository } from '../../Core/Data/Repository.js';
import { UserSettingsModel } from './UserSettingsModel.js';
export class UserSettingsRepository extends Repository {
    constructor() {
        super(UserSettingsModel);
    }
}
