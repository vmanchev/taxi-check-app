import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {TranslateService} from '@ngx-translate/core';
import {DetailsPage} from '../details/details';
import _ from 'lodash';

@Component({
  selector: 'page-results',
  templateUrl: 'results.html',
})
export class ResultsPage {

  public results: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translateService: TranslateService) {

    this.results = this.navParams.get('items');
  }

  /**
   * Redirect to the details page, when a result is selected
   */
  showDetails(item: any) {

    //lookup the taxi operator company and add pass it to the next page
    this.navCtrl.push(DetailsPage, {
      taxi: item,
      company: _.find(this.results.companies, {id: item.operatorId}),
      validAt: this.results.validAt
    });
  }

}
