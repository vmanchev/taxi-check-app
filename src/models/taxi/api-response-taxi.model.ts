import {ApiResultTaxiModel} from './api-result-taxi.model';

export class ApiResponseTaxiModel {
  
  public status: number;
  public totalItems: number;
  public msg: string;
  public cachedAt: string;
  public result: ApiResultTaxiModel;
  

  static fromObject = function (data: ApiResponseTaxiModel) {

    var obj = new ApiResponseTaxiModel();

    for(var i in data){
        obj[i] = data[i];
    }

    obj.result = ApiResultTaxiModel.fromObject(data['result']);

    return obj;
  }

}
