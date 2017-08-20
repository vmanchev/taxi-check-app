import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {TranslateService} from '@ngx-translate/core';
import {DetailsPage} from '../details/details';
import {CompanyModel} from '../../models/company.model';
import {TaxiModel} from '../../models/taxi/taxi.model';
import _ from 'lodash';

@Component({
  selector: 'page-results',
  templateUrl: 'results.html',
})
export class ResultsPage {

  public companies: Array<CompanyModel>;
  public items: Array<TaxiModel>;
  public validAt: Date;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public translateService: TranslateService) {
    
    this.companies = this.navParams.get('companies');
    this.items = this.navParams.get('items');
    this.validAt = this.navParams.get('validAt');
  }

  /**
   * Redirect to the details page, when a result is selected
   */
  showDetails(item: TaxiModel) {

    //lookup the taxi operator company and add pass it to the next page
    this.navCtrl.push(DetailsPage, {
      taxi: item,
      company: _.find(this.companies, {id: item.operatorId}),
      validAt: this.validAt
    });
  }

}
