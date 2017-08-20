import {TaxiModel} from './taxi.model';
import {CompanyModel} from '../company.model';
import moment from "moment";
import _ from 'lodash';

export class ApiResultTaxiModel {

  public items: Array<TaxiModel> = [];
  public companies: Array<CompanyModel> = [];
  public validAt: Date;

  static fromObject = function (data: ApiResultTaxiModel) {

    var obj = new ApiResultTaxiModel();

    if (!_.isUndefined(data)) {
      data.items.forEach(function (taxi) {
        obj.items.push(TaxiModel.fromObject(taxi));
      });

      data.companies.forEach(function (company) {
        obj.companies.push(CompanyModel.fromObject(company));
      });

      obj.validAt = (data['validAt']) ? moment(data['validAt']).toDate() : new Date();
    }

    return obj;
  }
}
