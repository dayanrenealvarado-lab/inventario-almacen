// Importa el framework Express para construir el servidor y las rutas de la API
const express = require('express');

// Inicializa la aplicación de Express para empezar a configurar el backend
const app = express();

// Define el puerto del servidor: usa el del sistema operativo o el 3000 por defecto
const PORT = process.env.PORT || 3000;

// Middleware para procesar solicitudes en formato JSON
app.use(express.json());

// Inicia el servidor antes de conectar la base de datos para evitar bloqueos
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 SERVIDOR EN REGLA: Escuchando en el puerto ${PORT}`);
  console.log(`==================================================`);
});

// Importar la conexión a la base de datos MySQL
const db = require('./db'); 

// ==========================================
// ENDPOINTS PARA RODAMIENTOS
// ==========================================

// GET: Obtener todos los rodamientos unificados con la tabla productos
app.get('/api/rodamientos', async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.codigo, p.marca, p.stock_actual, p.stock_minimo, p.ubicacion_almacen,
             r.diametro_interno_mm, r.diametro_externo_mm, r.ancho_mm, r.tipo_sellado
      FROM productos p
      INNER JOIN rodamientos r ON p.id = r.producto_id
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los rodamientos", detalle: error.message });
  }
});

// POST: Registrar un nuevo rodamiento (Usa transacciones SQL para asegurar ambas tablas)
app.post('/api/rodamientos', async (req, res) => {
  const { codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, diametro_interno_mm, diametro_externo_mm, ancho_mm, tipo_sellado } = req.body;
  
  try {
    // 1. Insertar primero en la tabla padre (productos)
    const queryProducto = `INSERT INTO productos (codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, tipo_producto) VALUES (?, ?, ?, ?, ?, 'rodamiento')`;
    const [resultProducto] = await db.query(queryProducto, [codigo, marca, stock_actual, stock_minimo, ubicacion_almacen]);
    
    // Obtiene el ID generado automáticamente para el nuevo producto
    const nuevoId = resultProducto.insertId;

    // 2. Insertar en la tabla hija (rodamientos) usando el ID generado
    const queryRodamiento = `INSERT INTO rodamientos (producto_id, diametro_interno_mm, diametro_externo_mm, ancho_mm, tipo_sellado) VALUES (?, ?, ?, ?, ?)`;
    await db.query(queryRodamiento, [nuevoId, diametro_interno_mm, diametro_externo_mm, ancho_mm, tipo_sellado]);

    res.status(201).json({ mensaje: "Rodamiento registrado con éxito", id: nuevoId });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el rodamiento", detalle: error.message });
  }
});
// ==========================================
// ENDPOINTS PARA RETENEDORES
// ==========================================

// GET: Obtiene todos los retenedores directo desde su tabla física de medidas
app.get('/api/retenedores', async (req, res) => {
  try {
    // Cambiamos la consulta para que lea directamente la tabla existente
    const query = 'SELECT * FROM retenedores_4_5_10';
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los retenedores", detalle: error.message });
  }
});

// POST: Registrar un nuevo retenedor directamente en su tabla correspondiente
app.post('/api/retenedores', async (req, res) => {
  const { codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, diametro_interno_mm, diametro_externo_mm, altura_mm, material } = req.body;
  
  try {
    const query = `
      INSERT INTO retenedores_4_5_10 (codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, diametro_interno_mm, diametro_externo_mm, altura_mm, material) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, diametro_interno_mm, diametro_externo_mm, altura_mm, material]);
    
    res.status(201).json({ mensaje: "Retenedor registrado con éxito", id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar el retenedor", detalle: error.message });
  }
});
// ==========================================
// ENDPOINTS DE ACTUALIZACIÓN (PUT)
// ==========================================

// PUT: Actualizar un retenedor específico por su ID
app.put('/api/retenedores/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, diametro_interno_mm, diametro_externo_mm, altura_mm, material } = req.body;
  
  try {
    const query = `
      UPDATE retenedores_4_5_10 
      SET codigo = ?, marca = ?, stock_actual = ?, stock_minimo = ?, ubicacion_almacen = ?, diametro_interno_mm = ?, diametro_externo_mm = ?, altura_mm = ?, material = ?
      WHERE id = ?
    `;
    const [result] = await db.query(query, [codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, diametro_interno_mm, diametro_externo_mm, altura_mm, material, id]);
    
    // Si no se modificó ninguna fila, significa que el ID no existía
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Retenedor no encontrado" });
    }
    
    res.status(200).json({ mensaje: "Retenedor actualizado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el retenedor", detalle: error.message });
  }
});

// PUT: Actualiza un rodamiento usando una transacción para modificar las dos tablas juntas
app.put('/api/rodamientos/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, 
    diametro_interno_mm, diametro_externo_mm, ancho_mm, tipo_sellado 
  } = req.body;
  
  // Solicita una conexión dedicada para poder gestionar la transacción
  const connection = await db.getConnection();
  try {

    // Inicia la transacción: si algo falla de aquí en adelante, nada se guarda
    await connection.beginTransaction();

    // 1. Actualiza los datos de almacén en la tabla padre (productos)
    const queryProducto = `
      UPDATE productos 
      SET codigo = ?, marca = ?, stock_actual = ?, stock_minimo = ?, ubicacion_almacen = ?
      WHERE id = ? AND tipo_producto = 'rodamiento'
    `;
    const [resultProducto] = await connection.query(queryProducto, [
      codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, id
    ]);
    
    // Si el ID no existe, cancela todo el proceso inmediatamente (Rollback)
    if (resultProducto.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Rodamiento no encontrado" });
    }
    
    // 2. Actualiza los datos específicos del rodamiento en la tabla hija (rodamientos)
    const queryRodamiento = `
      UPDATE rodamientos 
      SET diametro_interno_mm = ?, diametro_externo_mm = ?, ancho_mm = ?, tipo_sellado = ?
      WHERE producto_id = ?
    `;
    await connection.query(queryRodamiento, [diametro_interno_mm, diametro_externo_mm, ancho_mm, tipo_sellado, id]);
    
    // Confirma y consolida de forma permanente los cambios en la base de datos
    await connection.commit();
    res.status(200).json({ mensaje: "Rodamiento actualizado con éxito en ambas tablas" });
  } catch (error) {
    
    // Cancela cualquier cambio realizado en este intento si se produce una falla
    await connection.rollback();
    res.status(500).json({ error: "Error al actualizar el rodamiento", detalle: error.message });
  } finally {
    
    // Libera y regresa la conexión al pool para que pueda ser reutilizada
    connection.release();
  }
});

// ==========================================
// ENDPOINTS DE ELIMINACIÓN (DELETE)
// ==========================================

// DELETE: Eliminar un retenedor específico de la base de datos por su ID
app.delete('/api/retenedores/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const query = 'DELETE FROM retenedores_4_5_10 WHERE id = ?';
    const [result] = await db.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Retenedor no encontrado" });
    }
    
    res.status(200).json({ mensaje: "Retenedor eliminado del almacén con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el retenedor", detalle: error.message });
  }
});

// DELETE: Eliminar un rodamiento por su ID (Borra en cascada en la tabla rodamientos automáticamente gracias a la FK)
app.delete('/api/rodamientos/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Al borrar el producto padre, MySQL elimina al hijo en la tabla rodamientos por el ON DELETE CASCADE
    const query = 'DELETE FROM productos WHERE id = ?';
    const [result] = await db.query(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Rodamiento no encontrado" });
    }
    
    res.status(200).json({ mensaje: "Rodamiento eliminado del almacén con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el rodamiento", detalle: error.message });
  }
});

