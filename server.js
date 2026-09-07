const express = require('express');
const db = require('./db'); // Importamos la conexión
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// GET: Obtener todos los rodamientos con sus detalles técnicos
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
    // Insertar primero en la tabla padre (productos)
    const queryProducto = `INSERT INTO productos (codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, tipo_producto) VALUES (?, ?, ?, ?, ?, 'rodamiento')`;
    const [resultProducto] = await db.query(queryProducto, [codigo, marca, stock_actual, stock_minimo, ubicacion_almacen]);
    
    const nuevoId = resultProducto.insertId;

    // Insertar en la tabla hija (rodamientos) usando el ID generado
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

// GET: Obtener todos los retenedores con sus especificaciones técnicas
app.get('/api/retenedores', async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.codigo, p.marca, p.stock_actual, p.stock_minimo, p.ubicacion_almacen,
             ret.diametro_interno_mm, ret.diametro_externo_mm, ret.altura_mm, ret.material
      FROM productos p
      INNER JOIN retenedores ret ON p.id = ret.producto_id
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los retenedores", detalle: error.message });
  }
});

// POST: Registrar un nuevo retenedor utilizando transacciones
app.post('/api/retenedores', async (req, res) => {
  const { 
    codigo, 
    marca, 
    stock_actual, 
    stock_minimo, 
    ubicacion_almacen, 
    diametro_interno_mm, 
    diametro_externo_mm, 
    altura_mm, 
    material 
  } = req.body;
  
  // Obtener una conexión del pool para manejar la transacción manualmente
  const connection = await db.getConnection();
  
  try {
    // Iniciar transacción para asegurar consistencia en ambas tablas
    await connection.beginTransaction();

    // 1. Insertar en la tabla base (productos) especificando el tipo 'retenedor'
    const queryProducto = `
      INSERT INTO productos (codigo, marca, stock_actual, stock_minimo, ubicacion_almacen, tipo_producto) 
      VALUES (?, ?, ?, ?, ?, 'retenedor')
    `;
    const [resultProducto] = await connection.query(queryProducto, [codigo, marca, stock_actual, stock_minimo, ubicacion_almacen]);
    
    const nuevoId = resultProducto.insertId;

    // 2. Insertar en la tabla específica (retenedores) usando el ID recién creado
    const queryRetenedor = `
      INSERT INTO retenedores (producto_id, diametro_interno_mm, diametro_externo_mm, altura_mm, material) 
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.query(queryRetenedor, [nuevoId, diametro_interno_mm, diametro_externo_mm, altura_mm, material]);

    // Confirmar los cambios si todo salió bien
    await connection.commit();

    res.status(201).json({ mensaje: "Retenedor registrado con éxito", id: nuevoId });
  } catch (error) {
    // Cancelar cualquier cambio si ocurre un error
    await connection.rollback();
    res.status(500).json({ error: "Error al registrar el retenedor", detalle: error.message });
  } finally {
    // Siempre liberar la conexión de vuelta al pool
    connection.release();
  }
});
