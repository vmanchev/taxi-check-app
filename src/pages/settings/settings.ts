import {Component} from '@angular/core';
import {NavController, NavParams, ModalController, AlertController, LoadingController, Loading} from 'ionic-angular';
import {AppVersion} from '@ionic-native/app-version';
import {ConfigService} from '../../providers/config-service/config-service';
import {OfflineService} from '../../providers/offline-service/offline-service';
import {ConfigModel} from '../../models/config/config.model';
import {OfflineLogModel} from '../../models/dump/offlinelog.model';
import {LanguagePage} from '../language/language';
import {TranslateService} from '@ngx-translate/core';
import moment from "moment";
import _ from "lodash";

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  public appName: any;
  public packageName: any;
  public versionCode: any;
  public versionNumber: any;
  public webLanguage: string;
  public configModel: ConfigModel;
  public loading: Loading;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public configService: ConfigService,
    public OfflineService: OfflineService,
    public loadingCtrl: LoadingController,
    public appVersion: AppVersion,
    public alertCtrl: AlertController,
    public translateService: TranslateService) {

    this.setWebLanguage(this.translateService.currentLang);
  }

  presentLoadingDefault() {
    this.loading = this.loadingCtrl.create({
      spinner: 'bubbles',
      dismissOnPageChange: true
    });
    this.loading.present();
  }

  ionViewDidEnter() {

    this.configService.getAll().then((configModel: ConfigModel) => {
      this.configModel = configModel;
    });

    this.appVersion.getAppName().then(data => this.appName = data);
    this.appVersion.getPackageName().then(data => this.packageName = data);
    this.appVersion.getVersionCode().then(data => this.versionCode = data);
    this.appVersion.getVersionNumber().then(data => this.versionNumber = data);
  }

  onLocalDataChange(toggleValue: Boolean) {

    this.presentLoadingDefault();

    if (toggleValue) {

      let $this = this;

      this.OfflineService.check().subscribe((data: OfflineLogModel) => {
        this.OfflineService.update(data.file_name);
        this.configModel.localDataLastUpdatedAt = data.created_at;
        this.configService.save(this.configModel);
        
        setTimeout(function(){
          $this.loading.dismiss();
        }, 3000);
      });

    } else {
      this.OfflineService.dropDatabase();
      this.configModel.localDataLastUpdatedAt = null;
      this.configService.save(this.configModel);
      this.loading.dismiss();
    }
  }


  setWebLanguage(code: string) {
    this.webLanguage = (code !== 'bg') ? code : null;
  }

  changeLanguage() {
    let languageModal = this.modalCtrl.create(LanguagePage, {isModal: true}, {
      cssClass: 'language-modal'
    });

    languageModal.onDidDismiss((data: ConfigModel) => {
      if (!_.isUndefined(data)) {
        this.setWebLanguage(data.selectedLanguage.code);
      }
    });

    languageModal.present();
  }

  checkForLocalDataUpdate() {
    
    this.presentLoadingDefault();
    
    this.OfflineService.check().subscribe((data: OfflineLogModel) => {

      this.loading.dismiss();

      if (moment(data.created_at).isAfter(moment(this.configModel.localDataLastUpdatedAt))) {
        this.showUpdateAlert(data);
      } else {
        this.showNoUpdateAlert();
      }

    })
  }

  showUpdateAlert(data: any) {

    let $this = this;

    let since = moment(this.configModel.localDataLastUpdatedAt).from(moment(data.created_at));

    let alert = this.alertCtrl.create({
      title: this.translateService.instant('page.settings.offline.title'),
      message: this.translateService.instant('page.settings.offline.message.newData', {since: since}),
      buttons: [
        {
          text: this.translateService.instant('page.settings.offline.buttons.close'),
          role: 'cancel'
        },
        {
          text: this.translateService.instant('page.settings.offline.buttons.update'),
          role: 'updateNow',
          handler: function () {
            $this.OfflineService.update(data.file_name);
          }
        }
      ]
    });

    alert.present();

  }

  showNoUpdateAlert() {
    let alert = this.alertCtrl.create({
      title: this.translateService.instant('page.settings.offline.title'),
      message: this.translateService.instant('page.settings.offline.message.noNewData'),
      buttons: [this.translateService.instant('page.settings.offline.buttons.close')]
    });
    alert.present();
  }
}
