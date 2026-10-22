describe('pruebas de inventario', () => {
  it('debería cargar la página de inventario', () => {
    cy.visit('http://localhost:3000/inventario');
  })
})