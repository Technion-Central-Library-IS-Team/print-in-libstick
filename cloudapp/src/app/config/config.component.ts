import { Component, OnInit } from '@angular/core';
import { CloudAppConfigService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
  libstickAccountURL:string;

  constructor( private configService: CloudAppConfigService) { }

  ngOnInit(): void {
    this.configService.get().subscribe( (config) => {
      if (Object.keys(config).length !== 0 && config.constructor !== Object) {
        this.libstickAccountURL = config;
      } else {
        this.libstickAccountURL = '';
      }
    });
  }

  onSubmit(): void {
    this.configService.set(this.libstickAccountURL).subscribe((response) => { 
      console.log('Saved');
      window.location.href = '';
    });
  }

  libstickAccountURLvalidOrNot($url) {
    // return !(($url.startsWith("https://libraries.technion.ac.il/") || $url.startsWith("http://libraries.technion.ac.il/")) && 
    //          ($url.endsWith("-libstick") || $url.endsWith("-libstick/")));
    return !(($url.startsWith("https://libdev.web3dev.technion.ac.il/") || $url.startsWith("http://libdev.web3dev.technion.ac.il/")) && 
             ($url.endsWith("-libstick") || $url.endsWith("-libstick/")));
  }
}
