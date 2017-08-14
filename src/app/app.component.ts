import {Component} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {ScreenOrientation} from '@ionic-native/screen-orientation';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from '../providers/config-service/config-service';
import {ConfigModel} from '../models/config/config.model';
import {LanguagePage} from '../pages/language/language';
import {AreaPage} from '../pages/area/area';
import {TabsPage} from '../pages/tabs/tabs';
import _ from "lodash";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    public translate: TranslateService,
    public configService: ConfigService,
    public screenOrientation: ScreenOrientation) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY);
      
      this.setRootPage();
    });
  }

  setRootPage() {

    this.configService.getAll().then((configModel: ConfigModel) => {

      if (_.isNull(configModel)) {
        //no config model at all, lets start with language selection
        this.rootPage = LanguagePage;
      } else if (_.isUndefined(configModel.selectedLanguage) || _.isEmpty(configModel.selectedLanguage)) {
        //config model exists, but no language has been previously selected, lets do it now
        this.rootPage = LanguagePage;
      } else if (_.isUndefined(configModel.selectedArea) || _.isEmpty(configModel.selectedArea)) {
        //language has already been selected last time, but no default area, lets select one now
        this.configService.setSessionData(configModel);
        this.rootPage = AreaPage;
      } else {
        //both language and area are provided, go to the main screen
        this.configService.setSessionData(configModel);
        this.rootPage = TabsPage;
      }
    });

  }
}
