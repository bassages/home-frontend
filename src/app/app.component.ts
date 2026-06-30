import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth/auth.service';

@Component({
    selector: 'home-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent implements OnInit {

  public constructor(private readonly authService: AuthService) {
  }

  public ngOnInit(): void {
    this.authService.updateAuthenticatedSubject();
  }
}
