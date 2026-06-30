import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth/auth.service';
import { NavbarComponent } from './navbar/navbar.component';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { ErrorHandlingComponent } from './error-handling/error-handling.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'home-root',
    templateUrl: './app.component.html',
    imports: [NavbarComponent, NgxSpinnerComponent, ErrorHandlingComponent, RouterOutlet]
})
export class AppComponent implements OnInit {

  public constructor(private readonly authService: AuthService) {
  }

  public ngOnInit(): void {
    this.authService.updateAuthenticatedSubject();
  }
}
