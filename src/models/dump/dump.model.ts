import {CompanyModel} from '../company.model';
import {TaxiModel} from '../taxi/taxi.model';
import {OfflineLogModel} from './offlinelog.model';

  export class DumpModel {
  company: Array<CompanyModel>;
  taxi: Array<TaxiModel>;
  offlinelog: OfflineLogModel;
}
