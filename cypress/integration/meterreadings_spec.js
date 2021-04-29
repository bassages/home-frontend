import dayjs from "dayjs";
import 'dayjs/locale/nl'

describe('Meterreadings', () => {
  dayjs.locale('nl')

  function interceptSuccesfullLogin() {
    cy.intercept('GET', '/api/user', {
      statusCode: 200,
      body: '{"name":"home"}'
    })
  }

  it('shows meterreadings from backend', () => {
    interceptSuccesfullLogin();

    const from = dayjs().date(1).format('YYYY-MM-DD');
    const to = dayjs().date(1).add(1, 'month').format('YYYY-MM-DD');
    cy.intercept('GET', `/api/meterstanden/per-dag/${from}/${to}`, { fixture: 'meterreadings-today.json' })

    cy.visit('http://localhost:4200/#/meterstand');

    let expectedSelectedDate = dayjs().format('MMMM YYYY');
    cy.get('home-date-navigator > form > div > input').should('have.value', expectedSelectedDate);

    cy.get('table').find('tr').should('have.length', 3);

    cy.get('table > tbody > tr:nth-child(1) > td:nth-child(1)').contains('za.');
    cy.get('table > tbody > tr:nth-child(1) > td:nth-child(2)').contains('01-01-2000');
    cy.get('table > tbody > tr:nth-child(1) > td:nth-child(3)').contains('1,000');
    cy.get('table > tbody > tr:nth-child(1) > td:nth-child(4)').contains('1,100');
    cy.get('table > tbody > tr:nth-child(1) > td:nth-child(5)').contains('10,101');

    cy.get('table > tbody > tr:nth-child(2) > td:nth-child(1)').contains('zo.');
    cy.get('table > tbody > tr:nth-child(2) > td:nth-child(2)').contains('02-01-2000');
    cy.get('table > tbody > tr:nth-child(2) > td:nth-child(3)').contains('2,000');
    cy.get('table > tbody > tr:nth-child(2) > td:nth-child(4)').contains('2,200');
    cy.get('table > tbody > tr:nth-child(2) > td:nth-child(5)').contains('20,202');
  })
})
