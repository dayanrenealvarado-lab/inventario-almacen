# Manual institucional
# Sistema de Inventario - Almacén v2

## Portada

Sistema de Inventario  
Almacén v2  
Manual de Usuario e Institucional

Versión: 2.0  
Fecha: 2026  
Departamento: Administración y Almacén  
Empresa: Almacén / Inventario General

---

## Índice

1. Introducción  
2. Objetivo del sistema  
3. Alcance funcional  
4. Requisitos del sistema  
5. Acceso y autenticación  
6. Vista principal  
7. Módulo de Retenedores  
8. Módulo de Rodamientos  
9. Módulo de Proveedores  
10. Registro de información  
11. Edición y actualización  
12. Eliminación de registros  
13. Búsqueda y filtrado  
14. Control de stock mínimo  
15. Seguridad y sesión  
16. Procedimiento operativo recomendado  
17. Recomendaciones de uso  
18. Solución de problemas  
19. Anexos  
20. Conclusión

---

## 1. Introducción

El sistema de inventario "Almacén v2" fue desarrollado para apoyar la administración y gestión técnica del inventario de la empresa. Su propósito principal es mantener un control ordenado de los productos del almacén, facilitar la clasificación por módulos y asegurar la actualización de la información en tiempo real.

El sistema permite:
- registrar productos,
- observar niveles de stock,
- actualizar datos,
- consultar información de proveedores,
- controlar inventarios críticos.

---

## 2. Objetivo del sistema

El objetivo principal del sistema es gestionar de manera eficiente los inventarios del almacén, reduciendo errores operativos y agilizando los procesos de registro y consulta.

Objetivos específicos:
- registrar y consultar retenedores,
- registrar y consultar rodamientos,
- administrar proveedores,
- controlar stock mínimo,
- facilitar la operación del almacén con una interfaz clara y organizada.

---

## 3. Alcance funcional

El sistema cubre las siguientes funciones:
- autenticación de usuarios,
- navegación por módulos,
- búsqueda rápida,
- registro de nuevos elementos,
- edición de registros,
- eliminación de registros,
- visualización de stock,
- control de stock mínimo,
- gestión de proveedores.

---

## 4. Requisitos del sistema

Para garantizar el correcto funcionamiento del sistema, se deben cumplir los siguientes requisitos:

### Hardware
- computadora con conexión estable,
- acceso a la red interna o localhost.

### Software
- navegador web actualizado,
- API del sistema ejecutándose,
- base de datos MySQL disponible.

### Usuario
- usuario administrador autenticado.

---

## 5. Acceso y autenticación

Para ingresar al sistema, el usuario debe acceder a la pantalla de inicio de sesión.

Se requieren:
- usuario,
- contraseña.

### Proceso
1. Ingresar el usuario.
2. Ingresar la contraseña.
3. Hacer clic en "Iniciar sesión".
4. El sistema valida la información.
5. Si es correcta, se abre el panel principal.

Si la sesión expira:
- el sistema muestra un mensaje de sesión cerrada,
- solicita autenticación nuevamente.

### Pantalla 1: Inicio de sesión

```text
+------------------------------------------------------+
|                     Iniciar sesión                   |
|------------------------------------------------------|
| Usuario:     [____________________]                  |
| Contraseña:  [____________________]                  |
|------------------------------------------------------|
|             [ Iniciar sesión ]                      |
+------------------------------------------------------+
```

---

## 6. Vista principal

La vista principal está compuesta por:
- barra superior con nombre del usuario,
- botón de cierre de sesión,
- título del sistema,
- buscador rápido,
- selector de módulos,
- formulario principal,
- tablas de información.

### Pantalla principal

```text
+-----------------------------------------------------------------------+
| Sesión iniciada como: administrador           [Cerrar sesión]        |
|-----------------------------------------------------------------------|
| SISTEMA DE INVENTARIO - ALMACÉN V2                                    |
| Monitoreo de repuestos técnicos en tiempo real                        |
|                                                                       |
| 🔍 Buscar por código o marca...                   [Limpiar]            |
|                                                                       |
| [⬤ Retenedores] [⚙ Rodamientos] [🏢 Proveedores]                       |
|                                                                       |
| +-----------------------------------------------------------------+ |
| | Formulario de registro / edición                              | |
| | ...                                                           | |
| | [Guardar] [Cancelar]                                          | |
| +-----------------------------------------------------------------+ |
|                                                                       |
| +-----------------------------------------------------------------+ |
| | Módulo de Retenedores                                        | |
| | ...                                                             | |
| +-----------------------------------------------------------------+ |
+-----------------------------------------------------------------------+
```

---

## 7. Módulo de Retenedores

El módulo de retenedores permite administrar los datos básicos de cada retenedor.

### Información registrada
- código
- marca
- stock actual
- stock mínimo
- ubicación
- diámetro interno
- diámetro externo
- altura
- material

### Proceso operativo
1. Seleccionar "Retenedores".
2. Completar los campos requeridos.
3. Guardar registro.
4. Revisar la tabla final.

### Pantalla 3: Módulo de retenedores

```text
+--------------------------------------------------------------------------+
| Módulo de Retenedores                                                    |
|--------------------------------------------------------------------------|
| ID | Código | Marca | Stock | Mínimo | Ubicación | Ø Int | Ø Ext | Alt | |
|----|--------|-------|-------|--------|------------|-------|-------|-----| |
| 1  | R-100  | SKF   | 25    | 10     | A-01       | 20    | 30    | 15  | |
| 2  | R-101  | FAG   | 8     | 12     | B-02       | 18    | 32    | 18  | |
|--------------------------------------------------------------------------|
| [Modificar] [Borrar]                                                   |
+--------------------------------------------------------------------------+
```

---

## 8. Módulo de Rodamientos

El módulo de rodamientos permite administrar información técnica y operativa de los rodamientos del almacén.

### Información registrada
- código
- marca
- stock actual
- stock mínimo
- ubicación
- diámetro interno
- diámetro externo
- ancho
- tipo de sellado

### Proceso operativo
1. Seleccionar "Rodamientos".
2. Completar campos.
3. Guardar.
4. Revisar la tabla.

### Pantalla 4: Módulo de rodamientos

```text
+--------------------------------------------------------------------------+
| Módulo de Rodamientos                                                    |
|--------------------------------------------------------------------------|
| ID | Código | Marca | Stock | Mínimo | Ubicación | Ø Int | Ø Ext | Ancho | |
|----|--------|-------|-------|--------|------------|-------|-------|-------| |
| 1  | R-201  | NSK   | 15    | 8      | C-05       | 25    | 52    | 18    | |
| 2  | R-202  | NTN   | 6     | 10     | C-06       | 30    | 62    | 20    | |
|--------------------------------------------------------------------------|
| [Modificar] [Borrar]                                                   |
+--------------------------------------------------------------------------+
```

---

## 9. Módulo de Proveedores

El módulo de proveedores permite administrar el listado de proveedores asociados al almacén.

### Información registrada
- nombre
- NIT
- contacto
- teléfono
- email
- dirección

### Proceso operativo
1. Seleccionar "Proveedores".
2. Completar formulario.
3. Guardar.
4. Validar los datos en la tabla.

### Pantalla 5: Módulo de proveedores

```text
+--------------------------------------------------------------------------+
| Módulo de Proveedores                                                    |
|--------------------------------------------------------------------------|
| ID | Nombre | NIT | Contacto | Teléfono | Email | Dirección | Acciones |
|----|--------|-----|----------|----------|-------|-----------|----------|
| 1  | Proveed 1 | 900... | Ana | 300123 | ana@... | Calle 12 | Mod/Borr |
| 2  | Proveed 2 | 900... | Luis | 300456 | luis@...| Av 90 | Mod/Borr |
|--------------------------------------------------------------------------|
| [Modificar] [Borrar]                                                   |
+--------------------------------------------------------------------------+
```

---

## 10. Registro de información

Para registrar un nuevo dato, se deben seguir los siguientes pasos:
1. Elegir el módulo correspondiente.
2. Completar la información correcta.
3. Confirmar campos obligatorios.
4. Presionar el botón "Guardar".

### Validación
- Si faltan datos obligatorios, el sistema no completa la acción.
- Si el stock es crítico, se muestra una alerta.

---

## 11. Edición y actualización

La edición permite modificar los datos de un registro ya existente.

### Proceso
1. Localizar el registro en la tabla.
2. Hacer clic en "Modificar".
3. El sistema:
   - carga la información,
   - desplaza la vista al formulario,
   - activa el modo edición,
   - resalta visualmente el formulario.
4. Hacer los cambios.
5. Presionar "Actualizar".

### Pantalla 6: Actualización de registro

```text
+-----------------------------------------------------------------------+
| Editar Retenedor                                                       |
|-----------------------------------------------------------------------|
| Código: [R-100]  Marca: [SKF]                                         |
| Stock actual: [25]  Stock mínimo: [10]  Ubicación: [A-01]             |
| Ø Int: [20]  Ø Ext: [30]  Altura: [15]  Material: [Metal]             |
|-----------------------------------------------------------------------|
| [Actualizar] [Cancelar]                                              |
+-----------------------------------------------------------------------+
```

---

## 12. Eliminación de registros

La eliminación se realiza con la acción "Borrar".

### Proceso
1. Localizar el registro.
2. Hacer clic en "Borrar".
3. Confirmar la acción.
4. El sistema elimina el registro y recarga la información.

Nota:
- La eliminación debe realizarse con precaución.
- El sistema solicita confirmación antes de borrar.

---

## 13. Búsqueda y filtrado

La funcionalidad de búsqueda rápida está enfocada en facilitar la localización de registros.

### Uso
- escribir por código o marca,
- el sistema filtra automáticamente,
- si no se desea filtrar, se presiona "Limpiar".

### Ventajas
- reduce tiempo de búsqueda,
- evita revisión manual de varias tablas,
- ayuda a priorizar tareas del almacén.

---

## 14. Control de stock mínimo

El sistema monitorea si el stock disponible es igual o menor al stock mínimo.

Esto genera una alerta visual y ayuda a:
- identificar artículos críticos,
- programar compras,
- anticipar faltantes,
- mantener inventario saludable.

---

## 15. Seguridad y sesión

El sistema requiere autenticación obligatoria.

### Recomendaciones
- no compartir credenciales,
- cerrar sesión al terminar operación,
- evitar accesos desde equipos compartidos,
- mantener contraseñas seguras.

---

## 16. Procedimiento operativo recomendado

Para una operación eficiente se recomienda el siguiente flujo:
1. Iniciar sesión.
2. Buscar el módulo requerido.
3. Revisar la información previa.
4. Registrar o editar el registro.
5. Validar stock.
6. Confirmar la operación.
7. Cerrar sesión al finalizar.

---

## 17. Recomendaciones de uso

- Mantener actualizados los datos de proveedores.
- Revisar el stock mínimo con frecuencia.
- Usar el módulo correcto para cada tipo de registro.
- Verificar antes de eliminar un registro.
- Mantener la información del almacén ordenada.

---

## 18. Solución de problemas

### Problema 1: No se inicia sesión
**Solución:**
- revisar usuario y contraseña,
- confirmar que la API está disponible,
- comprobar conexión a la base de datos.

### Problema 2: No aparecen registros
**Solución:**
- verificar sesión activa,
- revisar conexión con la API,
- recargar la vista.

### Problema 3: No se actualiza un registro
**Solución:**
- entrar a modo edición,
- verificar que el registro se cargó,
- presionar "Actualizar".

### Problema 4: El registro no se guarda
**Solución:**
- revisar campos obligatorios,
- validar que la información sea correcta,
- revisar si la API respondió con error.

---

## 19. Anexos

### Anexo A: Flujograma general del sistema
- Inicio de sesión
- acceso al panel
- selección de módulo
- creación o edición
- validación
- cierre

### Anexo B: Mapa de módulos
- Retenedores
- Rodamientos
- Proveedores

### Anexo C: Botones y funciones principales
- Guardar
- Actualizar
- Cancelar
- Modificar
- Borrar
- Cerrar sesión

---

## 20. Conclusión

El sistema de inventario es una herramienta funcional, ordenada y operativa que facilita la gestión del almacén. Su diseño modular permite manejar información de manera clara y segura, y sus funciones principales aseguran una administración más eficiente del inventario, la seguridad de la información y la trazabilidad de los procesos.

Este manual institucional puede servir como referencia base para:
- usuarios del sistema,
- personal operativo del almacén,
- administración,
- soporte técnico.

---

Fin del manual.
