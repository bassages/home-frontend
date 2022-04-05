import {inject, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {KlimaatService} from './klimaat.service';
import {Klimaat} from './klimaat';
import * as dayjs from 'dayjs';

describe('OpgenomenVermogenService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KlimaatService],
      imports: [HttpClientTestingModule],
    });
  });

  afterEach(inject([HttpTestingController], (httpMock: HttpTestingController) => {
    httpMock.verify();
  }));

  it('should get klimaat in period for sensorcode by getting it from the backend api',
    inject([HttpTestingController, KlimaatService],
      (httpMock: HttpTestingController, service: KlimaatService) => {

        // Call the service
        const from = dayjs('2020-10-04T16:11:11');
        const to = dayjs('2021-11-02T12:21:36');
        service.getKlimaat('someSensorCode', from, to).subscribe(data => {
          expect(data.length).toBe(2);
        });

        // Set the expectations for the HttpClient mock
        const req = httpMock.expectOne( '/api/klimaat/someSensorCode?from=2020-10-04&to=2021-11-02');
        expect(req.request.method).toEqual('GET');

        // Set the fake data to be returned by the mock
        const klimaat1: Klimaat = new Klimaat();
        const klimaat2: Klimaat = new Klimaat();
        const result = [klimaat1, klimaat2];
        req.flush(result);
      })
  );

  it('should get top in period for sensorcode by getting it from the backend api',
    inject([HttpTestingController, KlimaatService],
      (httpMock: HttpTestingController, service: KlimaatService) => {

        // Call the service
        const from = dayjs('2020-10-04T16:11:11');
        const to = dayjs('2021-11-02T12:21:36');
        const limit = 10;
        service.getTop('someSensorCode', 'someSensorType', 'someTopType', from, to, limit).subscribe(data => {
          expect(data.length).toBe(2);
        });

        // Set the expectations for the HttpClient mock
        const req = httpMock.expectOne( '/api/klimaat/someSensorCode/someTopType?from=2020-10-04&to=2021-11-02&sensorType=someSensorType&limit=10');
        expect(req.request.method).toEqual('GET');

        // Set the fake data to be returned by the mock
        const klimaat1: Klimaat = new Klimaat();
        const klimaat2: Klimaat = new Klimaat();
        const result = [klimaat1, klimaat2];
        req.flush(result);
      })
  );

  it('should get average per month in a given year for a sensorcode and sensorType by getting it from the backend api',
    inject([HttpTestingController, KlimaatService],
      (httpMock: HttpTestingController, service: KlimaatService) => {

        // Call the service
        service.getGemiddeldeKlimaatPerMaand('someSensorCode', 'someSensorType', 2017)
          .subscribe(data => {
            expect(data.length).toBe(2);
            expect(data[0].gemiddelde).toEqual(10.32);
            expect(data[0].maand.format('Y-MM-DD')).toEqual('2017-01-01');
            expect(data[1].gemiddelde).toEqual(12.32);
            expect(data[1].maand.format('Y-MM-DD')).toEqual('2017-02-01');
          });

        // Set the expectations for the HttpClient mock
        const req = httpMock.expectOne( '/api/klimaat/someSensorCode/gemiddeld-per-maand-in-jaar?jaar=2017&sensorType=someSensorType');
        expect(req.request.method).toEqual('GET');

        // Set the fake data to be returned by the mock
        const result = [[
          {
            maand: '2017-01-01',
            gemiddelde: 10.32
          }, {
            maand: '2017-02-01',
            gemiddelde: 12.32
          }
        ]];
        req.flush(result);
      })
  );
});
