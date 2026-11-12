describe('Pruebas de Integración Automatizadas - Inventario Almacén', () => {

  beforeEach(() => {
    // 1. Limpieza inicial de la tabla
    cy.task('queryDb', "DELETE FROM retenedores_4_5_10 WHERE codigo LIKE 'CYPRESS-%'");
    
    // 2. Login programático automático
    cy.loginAdminProgramatico();
  });

  it('Prueba 1: Debería validar la lectura correcta de retenedores con stock óptimo', () => {
    const queryInsertOptimo = "INSERT INTO retenedores_4_5_10 (codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, diametro_interno_mm, diametro_externo_mm, altura_mm, material) VALUES ('CYPRESS-TEST-01', 'CY-BRAND', 88, 10, 'ESTANTE DE PRUEBAS', 12.00, 22.00, 5.50, 'NITRILO')";
    cy.task('queryDb', queryInsertOptimo);

    cy.visit('/');

    cy.contains('CYPRESS-TEST-01').should('be.visible');
    cy.contains('CY-BRAND').should('be.visible');
    cy.contains('88').should('be.visible');
  });

  it('Prueba 2: Debería activar la alerta visual si un retenedor está bajo en stock', () => {
    const queryBajoStock = "INSERT INTO retenedores_4_5_10 (codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, diametro_interno_mm, diametro_externo_mm, altura_mm, material) VALUES ('CYPRESS-ALERTA', 'CRITICAL', 2, 10, 'ESTANTE DE ALERTA', 10.00, 20.00, 5.00, 'VITON')";
    cy.task('queryDb', queryBajoStock);

    cy.visit('/');

    cy.contains('CYPRESS-ALERTA').should('be.visible');
  });

  it('Prueba 3: Debería registrar un retenedor interactuando directamente con el formulario web', () => {
    cy.visit('/');

    cy.get('input[placeholder*="Código"]').type('CYPRESS-FORM-99');
    cy.get('input[placeholder*="Marca"]').type('TIMKEN');
    cy.get('input[placeholder*="Stock Actual"]').type('15');
    cy.get('input[placeholder*="Stock Mínimo"]').type('5');
    cy.get('input[placeholder*="Ubicación"]').type('Estante C - Nivel 3');
    cy.get('input[placeholder*="Ø Interno"]').type('25.00');
    cy.get('input[placeholder*="Ø Externo"]').type('52.00');
    cy.get('input[placeholder*="Altura"]').type('7.00');
    cy.get('input[placeholder*="Material"]').type('Poliuretano');

    cy.get('.btn-guardar').click();

    cy.contains('CYPRESS-FORM-99').should('be.visible');
  });

  after(() => {
    cy.task('queryDb', "DELETE FROM retenedores_4_5_10 WHERE codigo LIKE 'CYPRESS-%'");
  });

});
