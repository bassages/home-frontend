import {inject, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';
import {HTTP_INTERCEPTORS, HttpClient} from '@angular/common/http';
import {AuthorizationInterceptor} from './authorization-interceptor';
import {instance, mock} from 'ts-mockito';
import {AuthService} from '../auth.service';

describe('AuthorizationInterceptor', () => {
  const authServiceMock = mock(AuthService);
  const authServiceMockInstance = instance(authServiceMock);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthorizationInterceptor,
          multi: true
        },
        {
          provide: AuthService,
          useFactory: () => authServiceMockInstance
        }
      ]
    });
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should add header to request which prevents browsers from opening a basic auth login popup',
    inject([HttpClient, HttpTestingController], (httpClient: HttpClient, httpMock: HttpTestingController) => {

      // given
      const url = '/some-url';
      const httpResponseBody = 'some-response-body';

      // when
      const httpGetObservable = httpClient.get(url);

      // then
      httpGetObservable.subscribe(
        value => expect(value).toEqual(httpResponseBody),
        error => fail('expected request to succeed')
      );

      const expectedHeaderName = 'X-Requested-With';
      const expectedHeaderValue = 'XMLHttpRequest';
      const httpRequest: TestRequest = httpMock.expectOne(
            request => request.headers.has(expectedHeaderName) &&
                     request.headers.get(expectedHeaderName) === expectedHeaderValue);
      httpRequest.flush(httpResponseBody);
  }));
});
