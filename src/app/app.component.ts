import {Component, OnInit} from '@angular/core';
import 'dayjs/locale/nl';
import {AuthService} from './auth/auth.service';
import dayjs from 'dayjs';

@Component({
  selector: 'home-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  public constructor(private readonly authService: AuthService) {
  }

  public ngOnInit(): void {
    dayjs.locale('nl');
    this.authService.updateAuthenticatedSubject();
  }
}
