import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ConfigComponent } from './config/config.component';
import { PrintComponent } from './print/print.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'config', component: ConfigComponent },
  { path: 'print', component: PrintComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
