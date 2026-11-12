// cypress/support/commands.js

Cypress.Commands.add('loginAdminProgramatico', () => {
  const usuario = Cypress.env('adminUser')
  const password = Cypress.env('adminPassword')

  if (typeof usuario !== 'string' || typeof password !== 'string' || !usuario || !password) {
    throw new Error('Configura adminUser y adminPassword en las variables de entorno de Cypress.')
  }

  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/login',
    body: { usuario, password },
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.autenticado).to.be.true;
  });
});

