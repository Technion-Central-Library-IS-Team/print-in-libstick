import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CloudAppRestService, CloudAppEventsService, Request, HttpMethod,
  Entity, PageInfo, RestErrorResponse, CloudAppConfigService
} from '@exlibris/exl-cloudapp-angular-lib';
import{ GlobalConstants } from '../global-constants';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  private pageLoad$: Subscription;
  pageEntities: Entity[];
  private _apiResult: any;

  hasApiResult: boolean = false;
  loading = false;

  relevantURL: boolean = false;
  libstickAccountURL: string;
  private barcode: string;

  private libstickWindow: Window = GlobalConstants.libstickWindow;

  constructor(private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private toastr: ToastrService,
    private configService: CloudAppConfigService) { }

  ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);
    this.configService.get().subscribe( (config) => {
      this.libstickAccountURL = config;
      this.barcode = this.pageEntities[0].description;
    });
  }

  ngOnDestroy(): void {
    this.pageLoad$.unsubscribe();
  }

  get apiResult() {
    return this._apiResult;
  }

  set apiResult(result: any) {
    this._apiResult = result;
    this.hasApiResult = result && Object.keys(result).length > 0;
  }

  onPageLoad = (pageInfo: PageInfo) => {
    this.pageEntities = pageInfo.entities;
    if ((pageInfo.entities || []).length == 1) {
      const entity = pageInfo.entities[0];
      this.restService.call(entity.link).subscribe(result => this.apiResult = result);
    } else {
      this.apiResult = {};
    }

    this.updateRelevantURL();
  }

  update(value: any) {
    this.loading = true;
    let requestBody = this.tryParseJson(value);
    if (!requestBody) {
      this.loading = false;
      return this.toastr.error('Failed to parse json');
    }
    this.sendUpdateRequest(requestBody);
  }

  refreshPage = () => {
    this.loading = true;
    this.eventsService.refreshPage().subscribe({
      next: () => this.toastr.success('Success!'),
      error: e => {
        console.error(e);
        this.toastr.error('Failed to refresh page');
      },
      complete: () => this.loading = false
    });
  }

  private sendUpdateRequest(requestBody: any) {
    let request: Request = {
      url: this.pageEntities[0].link,
      method: HttpMethod.PUT,
      requestBody
    };
    this.restService.call(request).subscribe({
      next: result => {
        this.apiResult = result;
        this.refreshPage();
      },
      error: (e: RestErrorResponse) => {
        this.toastr.error('Failed to update data');
        console.error(e);
        this.loading = false;
      }
    });
  }

  private tryParseJson(value: any) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(e);
    }
    return undefined;
  }

  private updateRelevantURL() {
    if (this.pageEntities.length == 1 && 
        this.pageEntities[0].type == 'ITEM') {
      this.relevantURL = true;
    } else {
      this.relevantURL = false;
    }
  }

  clickedPrintInLIBstick() {
    this.toastr.success('Barcode sent to LIBstick', '', { positionClass: 'toast-bottom-center' });
    if (this.libstickWindow != null && !this.libstickWindow.closed) { 
      this.libstickWindow.postMessage('{"itemOrSet": "item", "id": "' + this.pageEntities[0].description + '", "libstickUrl": "' + this.libstickAccountURL + '"}', this.libstickAccountURL + "/*");
    } else {
      this.libstickWindow = window.open(this.libstickAccountURL + "?barcode=" + this.pageEntities[0].description);
    }
  }

}
