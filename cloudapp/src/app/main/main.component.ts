import { Component, OnInit } from '@angular/core';
import { CloudAppConfigService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  libstickAccountURL: string = '';
  loading: boolean = true;
  showSocialICONS = false;

  constructor(private configService: CloudAppConfigService) {
    this.configService.get().subscribe( (config) => {
      this.libstickAccountURL = config;
      this.loading = false;
    });
  }

  ngOnInit(): void {

  }

  checkIfLIBstickAccountExists(): boolean {
    return typeof(this.libstickAccountURL) == 'object' || this.libstickAccountURL == ''; 
  }

  onNOLIBstickAccount() {
    this.showSocialICONS = true;
  } 

  onJoinLIBstick() {
    window.open('https://libraries.technion.ac.il/libstick/#join_us');
  }
}
