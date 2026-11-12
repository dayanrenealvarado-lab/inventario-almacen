describe('Inventario Almacén', () => {
  it('solicita iniciar sesión antes de mostrar el inventario', () => {
    cy.visit('/');

    cy.get('#usuario').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.contains('button', 'Iniciar sesión').should('be.visible');
    cy.contains('h1', 'Sistema de Inventario - Almacén v2').should('not.exist');
  })
})