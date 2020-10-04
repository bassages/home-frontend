import {inject, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {OpgenomenVermogenService} from './opgenomen-vermogen.service';
import {OpgenomenVermogen} from './opgenomen-vermogen';
import * as moment from 'moment';

describe('OpgenomenVermogenService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpgenomenVermogenService],
      imports: [HttpClientTestingModule],
    });
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should get most recent by getting it from the backend api',
    inject([HttpTestingController, OpgenomenVermogenService],
      (httpMock: HttpTestingController, service: OpgenomenVermogenService) => {

        // Call the service
        service.getMostRecent().subscribe(data => {
          expect(data.watt).toBe(136);
          expect(data.datumtijd).toEqual(moment('2020-10-04T16:11:11').toDate());
          expect(data.tariefIndicator).toBe('DAL');
        });

        // Set the expectations for the HttpClient mock
        const req = httpMock.expectOne( '/api/opgenomen-vermogen/meest-recente');
        expect(req.request.method).toEqual('GET');

        // Set the fake data to be returned by the mock
        const mostRecentOpgenomenVermogen: OpgenomenVermogen = new OpgenomenVermogen();
        mostRecentOpgenomenVermogen.tariefIndicator = 'DAL';
        mostRecentOpgenomenVermogen.watt = 136;
        mostRecentOpgenomenVermogen.datumtijd = moment('2020-10-04T16:11:11').toDate();
        req.flush(mostRecentOpgenomenVermogen);
      })
  );
});
