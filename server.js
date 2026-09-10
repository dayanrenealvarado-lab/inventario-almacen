const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🔥 MOVER AQUÍ EL ESCUCHA DEL PUERTO (Al principio, antes de MySQL)
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 SERVIDOR EN REGLA: Escuchando en el puerto ${PORT}`);
  console.log(`==================================================`);
});

// Importar la conexión después para que no bloquee el encendido
const db = require('./db'); 


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
// ENDPOINTS PARA RETENEDORES (ACTUALIZADO)
// ==========================================

// GET: Obtener todos los retenedores desde la tabla real en la base de datos
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

// POST: Registrar un nuevo retenedor en la tabla real
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

