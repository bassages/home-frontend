import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {User} from './user';

const API_PATH_USER = '/api/user';

@Injectable()
export class AuthService {

  public authenticatedSubject = new BehaviorSubject<boolean>(false);

  public constructor(private readonly http: HttpClient,
                     private readonly router: Router,
                     private readonly spinnerService: NgxSpinnerService) {
  }

  public determineCurrentLoginStatus(): Observable<User> {
    return this.http.get(API_PATH_USER).pipe(this.tapAuthResponseToUpdateSubject());
  }

  public updateAuthenticatedSubject(): void {
    this.determineCurrentLoginStatus().subscribe();
  }

  public authenticate(credentials) {
    const headers = this.createBasicAuthHeader(credentials);
    return this.http.get(API_PATH_USER, {headers: headers}).pipe(this.tapAuthResponseToUpdateSubject());
  }

  // noinspection JSMethodCanBeStatic
  private createBasicAuthHeader(credentials): HttpHeaders {
    return new HttpHeaders({
      authorization: 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
    });
  }

  private tapAuthResponseToUpdateSubject() {
    return tap((_user: User) => {
      this.authenticatedSubject.next(true);
    });
  }

  public logout() {
    this.http.post('/logout', null).subscribe({
      complete: () => this.loggedOut()
    });
  }

  public loggedOut() {
    this.authenticatedSubject.next(false);
    this.spinnerService.hide();
    this.router.navigate(['/login']);
  }
}
