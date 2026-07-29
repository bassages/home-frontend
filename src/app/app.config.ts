import {ApplicationConfig, importProvidersFrom, LOCALE_ID} from '@angular/core';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerIntl, MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {withHashLocation, provideRouter} from '@angular/router';
import {RxStomp, RxStompConfig} from '@stomp/rx-stomp';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgxSpinnerModule} from 'ngx-spinner';
import SockJS from 'sockjs-client';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AuthorizationInterceptor} from './auth/authorization-interceptor';
import {AuthService} from './auth/auth.service';
import {ChartService} from './chart/chart.service';
import {ChartStatisticsService} from './chart/statistics/chart-statistics.service';
import {DutchMatDatepickerIntl} from './shared/material/dutch-mat-datepicker-intl';
import {EnergieVerbruikService} from './energie-verbruik/energie-verbruik.service';
import {EnergieVerbruikUurHistorieService} from './energie-verbruik/energie-verbruik-uur-historie.service';
import {EnergieVerbruikDagHistorieService} from './energie-verbruik/energie-verbruik-dag-historie.service';
import {EnergieVerbruikMaandHistorieService} from './energie-verbruik/energie-verbruik-maand-historie.service';
import {EnergieVerbruikJaarHistorieService} from './energie-verbruik/energie-verbruik-jaar-historie.service';
import {EnergieVerbruikHistorieServiceProvider} from './energie-verbruik/energie-verbruik-historie-service-provider';
import {EnergiecontractService} from './energiecontract/energiecontract.service';
import {ErrorHandingService} from './error-handling/error-handing.service';
import {KlimaatSensorService} from './klimaat/klimaatsensor.service';
import {KlimaatService} from './klimaat/klimaat.service';
import {MeterstandService} from './meterstand/meterstand.service';
import {MindergasnlService} from './mindergasnl/mindergasnl.service';
import {OpgenomenVermogenService} from './opgenomen-vermogen/opgenomen-vermogen.service';
import {StandbyPowerService} from './standby-power/standby-power.service';
import {environment} from '../environments/environment';
import {appRoutes} from './app.routes';
import {DecimalPipe} from '@angular/common';

export function socketProvider() {
  return new SockJS('/ws');
}

const myRxStompConfig: RxStompConfig = {
  webSocketFactory: socketProvider,
  connectHeaders: {},
  heartbeatIncoming: 0,
  heartbeatOutgoing: 60000,
  reconnectDelay: 20000,
  debug: (str) => {
    if (!environment.production) {
      console.log(new Date(), str);
    }
  }
};

export function rxStompFactory() {
  const rxStomp = new RxStomp();
  rxStomp.configure(myRxStompConfig);
  rxStomp.activate();
  return rxStomp;
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      NgbModule,
      NgxSpinnerModule,
      MatDatepickerModule,
      MatInputModule,
      MatNativeDateModule,
      FontAwesomeModule
    ),
    AuthService,
    DecimalPipe,
    ChartService,
    ChartStatisticsService,
    MeterstandService,
    OpgenomenVermogenService,
    EnergieVerbruikService,
    EnergieVerbruikUurHistorieService,
    EnergieVerbruikDagHistorieService,
    EnergieVerbruikMaandHistorieService,
    EnergieVerbruikJaarHistorieService,
    EnergieVerbruikHistorieServiceProvider,
    EnergiecontractService,
    MindergasnlService,
    KlimaatService,
    KlimaatSensorService,
    StandbyPowerService,
    ErrorHandingService,
    {
      provide: RxStomp,
      useFactory: rxStompFactory
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthorizationInterceptor,
      multi: true
    },
    {
      provide: LOCALE_ID,
      useValue: 'nl'
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'nl-NL'
    },
    {
      provide: MatDatepickerIntl,
      useClass: DutchMatDatepickerIntl
    },
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(appRoutes, withHashLocation())
  ]
};

