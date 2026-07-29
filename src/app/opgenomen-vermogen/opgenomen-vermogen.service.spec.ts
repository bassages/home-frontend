import {inject, TestBed} from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {OpgenomenVermogenService} from './opgenomen-vermogen.service';
import {OpgenomenVermogen} from './opgenomen-vermogen';
import dayjs from 'dayjs/esm';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('OpgenomenVermogenService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [OpgenomenVermogenService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});
  });

  afterEach(inject([HttpTestingController], (httpTestingController: HttpTestingController) => {
    httpTestingController.verify();
  }));

  it('should get most recent by getting it from the backend api',
    inject([HttpTestingController, OpgenomenVermogenService],
      (httpMock: HttpTestingController, service: OpgenomenVermogenService) => {

        // Call the service
        service.getMostRecent().subscribe(data => {
          expect(data.activePowerTotalInWatts).toBe(136);
          expect(data.activePowerL1InWatts).toBe(40);
          expect(data.activePowerL2InWatts).toBe(45);
          expect(data.activePowerL3InWatts).toBe(51);
          expect(data.datumtijd).toEqual(dayjs('2020-10-04T16:11:11').toDate());
          expect(data.tariefIndicator).toBe('DAL');
        });

        // Set the expectations for the HttpClient mock
        const req = httpMock.expectOne( '/api/opgenomen-vermogen/meest-recente');
        expect(req.request.method).toEqual('GET');

        // Set the fake data to be returned by the mock
        const mostRecentOpgenomenVermogen: OpgenomenVermogen = new OpgenomenVermogen();
        mostRecentOpgenomenVermogen.tariefIndicator = 'DAL';
        mostRecentOpgenomenVermogen.activePowerTotalInWatts = 136;
        mostRecentOpgenomenVermogen.activePowerL1InWatts = 40;
        mostRecentOpgenomenVermogen.activePowerL2InWatts = 45;
        mostRecentOpgenomenVermogen.activePowerL3InWatts = 51;
        mostRecentOpgenomenVermogen.datumtijd = dayjs('2020-10-04T16:11:11').toDate();
        req.flush(mostRecentOpgenomenVermogen);
      })
  );
});
