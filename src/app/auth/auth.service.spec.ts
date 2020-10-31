import {AuthService} from './auth.service';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {instance, mock, when} from 'ts-mockito';
import {of} from 'rxjs';
import {User} from './user';

describe('AuthService', () => {
  const url = '/api/user';

  let httpClientMock: HttpClient;
  let routerMock: Router;
  let spinnerServiceMock: NgxSpinnerService;
  let authService: AuthService;

  beforeEach(() => {
    httpClientMock = mock(HttpClient);
    routerMock = mock(Router);
    spinnerServiceMock = mock(NgxSpinnerService);
    authService = new AuthService(instance(httpClientMock), instance(routerMock), instance(spinnerServiceMock));
  });

  it('should return current user when logged in', done => {
    // given
    const user: User = { name: 'steve' };
    const httpGetObservable = of(user);

    when(httpClientMock.get(url)).thenReturn(httpGetObservable);

    // when
    authService.determineCurrentLoginStatus().subscribe((responseUser: User) => {
      // then
      expect(responseUser).toEqual(user);
      done();
    });
  });

  it('should update authenticatedSubject when logged in', done => {
    // given
    const user: User = { name: 'steve' };
    const httpResponse: HttpResponse<User> = new HttpResponse<User>({body: user});
    const httpGetObservable = of(httpResponse);

    when(httpClientMock.get(url)).thenReturn(httpGetObservable);

    // when
    authService.determineCurrentLoginStatus().subscribe();

    // then
    authService.authenticatedSubject.subscribe(authenticated => {
      expect(authenticated).toBeTrue();
      done();
    });
  });
});
