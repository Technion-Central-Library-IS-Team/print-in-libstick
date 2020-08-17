import { Component, OnInit } from '@angular/core';
import { CloudAppConfigService } from '@exlibris/exl-cloudapp-angular-lib';

import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  faCoffee = faCoffee;
  faVideo = faVideo;
  private libstickAccountURL: string = '';
  private loading: boolean = true;
  private showSocialICONS = false;

  constructor(private configService: CloudAppConfigService) {
    this.configService.get().subscribe( (config) => {
      this.libstickAccountURL = config;
      this.loading = false;
    });
  }

  ngOnInit(): void {

  }

  private checkIfLIBstickAccountExists(): boolean {
    return typeof(this.libstickAccountURL) == 'object' || this.libstickAccountURL == ''; 
  }

  onNOLIBstickAccount() {
    this.showSocialICONS = true;
  } 

  onJoinLIBstick() {
    console.log(123);
    window.open('https://libraries.technion.ac.il/libstick/#join_us');
  }
}
