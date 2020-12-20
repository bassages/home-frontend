import dayjs from "dayjs";
import 'dayjs/locale/nl'

describe('Dashboard', () => {
  dayjs.locale('nl')

  function interceptSuccesfullLogin() {
    cy.intercept('GET', '/api/user', {
      statusCode: 200,
      body: '{"name":"home"}'
    })
  }

  it('shows current recent power usage', () => {
    interceptSuccesfullLogin();

    cy.intercept('GET', '/api/opgenomen-vermogen/meest-recente', { fixture: 'power-usage-most-recent.json' })

    cy.visit('http://localhost:4200/#/dashboard');

    cy.get('.current-power-usage').contains('43');
  })

  it('shows most recent electricity meterreading', () => {
    interceptSuccesfullLogin();

    cy.intercept('GET', '/api/meterstanden/meest-recente', { fixture: 'meterreading-most-recent.json' })

    cy.visit('http://localhost:4200/#/dashboard');

    cy.get('.mostrecent-meterreading-tariff1').contains('1,222');
    cy.get('.mostrecent-meterreading-tariff2').contains('3,444');
  })
})
