import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  CloudAppRestService, CloudAppEventsService, Request, HttpMethod,
  Entity, PageInfo, RestErrorResponse, CloudAppConfigService
} from '@exlibris/exl-cloudapp-angular-lib';
import{ GlobalConstants } from '../global-constants';

@Component({
  selector: 'app-print',
  templateUrl: './print.component.html',
  styleUrls: ['./print.component.scss']
})
export class PrintComponent implements OnInit {

  private pageLoad$: Subscription;
  pageEntities: Entity[];
  private _apiResult: any;

  hasApiResult: boolean = false;
  loading = false;

  relevantURL: boolean = false;
  libstickAccountURL: string = '';
  private barcode: string;

  private libstickWindow: Window = GlobalConstants.libstickWindow;


  constructor(private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private toastr: ToastrService,
    private configService: CloudAppConfigService) {

    this.configService.get().subscribe( (config) => {
      this.libstickAccountURL = config;
      if (this.pageEntities.length > 0) {
        this.barcode = this.pageEntities[0].description;
      }
    });
  }

  ngOnInit() {
    this.pageLoad$ = this.eventsService.onPageLoad(this.onPageLoad);

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
  
  private updateRelevantURL(): void {
    if (this.pageEntities.length > 0 && (String(this.pageEntities[0].type) == 'ITEM' || (String(this.pageEntities[0].type) == 'SET' && this.pageEntities.length == 1))) {
      this.relevantURL = true;
    } else {
      this.relevantURL = false;
    }
  }

  private clickedPrintInLIBstick(): void {
    if (String(this.pageEntities[0].type) == 'ITEM') { // ITEM/S
      if (this.pageEntities.length == 1) {
        this.toastr.success('Barcode sent to LIBstick', '', { positionClass: 'toast-bottom-center' });
      } else {
        this.toastr.success('Bar-codes sent to LIBstick', '', { positionClass: 'toast-bottom-center' });
      }
      
      if (this.libstickWindow != null && !this.libstickWindow.closed) { // LIBstick tab is already open
        this.libstickWindow.postMessage('{"itemOrSet": "item", "id": "' + this.prepareBarcodesString() + '", "libstickUrl": "' + this.libstickAccountURL + '"}', this.libstickAccountURL + "/*");
      } else { // LIBstick tab is closed
        if (this.pageEntities.length == 1) { // Single barcode
          this.libstickWindow = window.open(this.libstickAccountURL + "?barcode=" + this.pageEntities[0].description);
        } else { // List of barcodes
          this.libstickWindow = window.open(decodeURI(this.libstickAccountURL + "?barcode=" + this.prepareBarcodesString()));
        } 
      }
    }

    if (String(this.pageEntities[0].type) == 'SET') { // SET
      if (this.pageEntities.length == 1) {
        this.toastr.success('Set sent to LIBstick', '', { positionClass: 'toast-bottom-center' });
      }
      
      if (this.libstickWindow != null && !this.libstickWindow.closed) { // LIBstick tab is already open
        this.libstickWindow.postMessage('{"itemOrSet": "set", "id": "' + this.pageEntities[0].id + '", "libstickUrl": "' + this.libstickAccountURL + '"}', this.libstickAccountURL + "/*");
      } else { // LIBstick tab is closed        
        this.libstickWindow = window.open(this.libstickAccountURL + "?setid=" + this.pageEntities[0].id);
      }
    }

  }

  private prepareBarcodesString(): string {
    let barcodesString = '';
    for (let i = 0; i < this.pageEntities.length; i++) { // Prepare the barcodes string e.g. "123,456,789"
      if (i < this.pageEntities.length - 1) {
        barcodesString += this.pageEntities[i].description + ',';
      } else {
        barcodesString += this.pageEntities[i].description;
      }
    }
    return barcodesString;
  }

}
