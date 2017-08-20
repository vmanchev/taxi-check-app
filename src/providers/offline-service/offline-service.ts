import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {ConfigService} from '../config-service/config-service';
import {ApiConfig} from '../api-config/api-config';
import {AreaModel} from '../../models/area.model';
import {ConfigModel} from '../../models/config/config.model';
import {ApiResponseTaxiModel} from '../../models/taxi/api-response-taxi.model';
import {ApiResultTaxiModel} from '../../models/taxi/api-result-taxi.model';
import {TaxiModel} from '../../models/taxi/taxi.model';
import {CompanyModel} from '../../models/company.model';
import {DumpModel} from '../../models/dump/dump.model';
import {OfflineLogModel} from '../../models/dump/offlinelog.model';
import {ReplaySubject} from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import _ from "lodash";
import moment from "moment";

declare var require: any;
var loki = require('lokijs');

var LokiCordovaFSAdapter = require("loki-cordova-fs-adapter");

var adapter = new LokiCordovaFSAdapter({"prefix": "taxicheck"});


@Injectable()
export class OfflineService {

  private resourceUri: string = '/offline';

  private db: any;
  public results: ReplaySubject<any> = new ReplaySubject(1);
  public response: ApiResponseTaxiModel;
  public configModel: ConfigModel;
  public companyResults: Array<CompanyModel>;
  public taxiResults: Array<TaxiModel>;
  public offlineLog: OfflineLogModel;

  constructor(
    public configService: ConfigService,
    public apiConfig: ApiConfig,
    public http: Http) {

    this.configService.getAll().then((data: ConfigModel) => {
      this.configModel = data;
    })
  }

  /**
   * Check for new version
   */
  check() {

    return this.http
      .get(this.apiConfig.getVersionUrl() + this.resourceUri + '/check')
      .map(res => {
        return res.json();
      });
  }

  getDbInstance() {

    if (_.isUndefined(this.db)) {
      this.db = new loki('offline.json', {
        adapter: adapter,
        autoload: true,
        autosave: true,
        autosaveInterval: 4000
      });
    }

    return this.db;
  }

  update(file_name: string) {

    this.downloadDbDump(file_name)
      .subscribe(
      (data: DumpModel) => {

        this.db = this.getDbInstance();

        let company = this.db.addCollection('company');
        company.insert(data.company);

        let taxi = this.db.addCollection('taxi');
        taxi.insert(data.taxi);

        let offlinelog = this.db.addCollection('offlinelog');
        offlinelog.insert(data.offlinelog);

      });
  }

  dropDatabase() {
    this.getDbInstance().deleteDatabase();
  }

  downloadDbDump(file_name: string) {
    return this.http.get(this.apiConfig.getBaseUrl() + '/offline/' + file_name)
      .map(res => {
        return res.json();
      });
  };

  search(area: AreaModel, q: string) {


    let db = this.getDbInstance();

    //search for taxi
    this.taxiResults = db.getCollection('taxi').chain().find({'area.code': area.code, 'car.plate': {'$regex': q}}).data();

    if (this.taxiResults.length) {
      this.companyResults = db.getCollection('company').chain().find({'id': {'$in': _.map(this.taxiResults, 'operatorId')}}).data();
      this.offlineLog = db.getCollection('offlinelog').findOne();
    }

    this.response = ApiResponseTaxiModel.fromObject({
      cachedAt: this.configModel.localDataLastUpdatedAt,
      status: (this.taxiResults.length) ? 200 : 404,
      totalItems: this.taxiResults.length,
      msg: 'search.results',
      result: ApiResultTaxiModel.fromObject({
        items: this.taxiResults,
        companies: this.companyResults,
        validAt: moment(this.offlineLog.created_at).toDate()
      })
    });


    this.results.next(this.response);
    return this.results;
  }

}
