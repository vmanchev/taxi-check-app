import {Component} from '@angular/core';
import {NavController, ModalController, LoadingController, Loading} from 'ionic-angular';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {TaxiService} from '../../providers/taxi-service/taxi-service';
import {OfflineService} from '../../providers/offline-service/offline-service';
import {ConfigService} from '../../providers/config-service/config-service';
import {ConfigModel} from '../../models/config/config.model';
import {ApiResponseTaxiModel} from '../../models/taxi/api-response-taxi.model';
import {ResultsPage} from '../results/results';
import {AreaPage} from '../area/area';
import _ from "lodash";

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {

  private formData: FormGroup;
  public response: ApiResponseTaxiModel;
  public configModel: ConfigModel;
  public loading: Loading;
  public companies: any;

  constructor(
    public navCtrl: NavController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder,
    public taxiService: TaxiService,
    public OfflineService: OfflineService,
    public configService: ConfigService) {

    //search form setup
    this.formData = this.formBuilder.group({
      q: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  presentLoadingDefault() {
    this.loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      dismissOnPageChange: true
    });
    this.loading.present();
  }

  ionViewDidEnter() {
    this.clearData();
    this.getConfigModelData();
  }

  getConfigModelData() {
    this.configService.getAll().then(data => {
      this.configModel = data;
    })
  }

  /**
   * Handle form submittion
   */
  process() {

    this.presentLoadingDefault();
    
    let service = (this.configModel.useLocalData) ? this.OfflineService : this.taxiService;

    service
      .search(this.configModel.selectedArea, this.formData.get('q').value)
      .subscribe((data: ApiResponseTaxiModel) => this.showResults(data));
  }

  /**
   * Clear the form data
   */
  clearData() {
    this.formData.reset();
    delete this.response;
  }

  /**
   * Redirect to the details page, when a result is selected
   */
  showResults(response: ApiResponseTaxiModel) {

    this.response = response;
    this.loading.dismiss();

    if (response.totalItems > 0) {
      return this.navCtrl.push(ResultsPage, response.result);
    }
  }

  changeArea() {
    let areaModal = this.modalCtrl.create(AreaPage, {isModal: true}, {
      cssClass: 'area-modal',
      enableBackdropDismiss: false
    });

    areaModal.onDidDismiss(data => {
      if (!_.isUndefined(data)) {
        this.configModel = data;
      }
    });

    areaModal.present();
  }
}
