import {enableProdMode} from '@angular/core';
import {registerLocaleData} from '@angular/common';
import localeNl from '@angular/common/locales/nl';
import {bootstrapApplication} from '@angular/platform-browser';
import {environment} from './environments/environment';
import './dayjs-setup';
import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';

if (environment.production) {
  enableProdMode();
}

registerLocaleData(localeNl);

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.log(err));
