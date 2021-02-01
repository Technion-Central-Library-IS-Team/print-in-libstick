import { Component, OnInit } from '@angular/core';
import { CloudAppConfigService } from '@exlibris/exl-cloudapp-angular-lib';
import { Router } from '@angular/router';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  libstickAccountURL: string = '';
  loadingStatus: string = 'Loading...';

  constructor( private configService: CloudAppConfigService,
               private router: Router ) {
    this.configService.get().subscribe(config => {
      this.loadingStatus = '';
      if (Object.keys(config).length !== 0 && config.constructor !== Object) {
        this.libstickAccountURL = config;
      } else {
        this.libstickAccountURL = '';
      }
    });
  }

  ngOnInit(): void {

  }

  onSubmit(): void {
    this.configService.set(this.libstickAccountURL).subscribe((response) => { 
      this.router.navigate(['']);
    });
  }

  libstickAccountURLvalidOrNot($url): boolean {
    // return false;
    return !($url.startsWith("https://libstick.org/") || $url.startsWith("http://libstick.org/"));
  }
}
