import {Component, OnInit} from '@angular/core';
import * as moment from 'moment';
import 'moment/locale/nl';
import {AuthService} from './auth/auth.service';

@Component({
  selector: 'home-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  public constructor(private readonly authService: AuthService) {
  }

  public ngOnInit(): void {
    moment.locale('nl');
    this.authService.updateAuthenticatedSubject();
  }
}
