<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'

const API_URL = '/api'
const tipoActivo = ref('retenedores') 
const autenticado = ref(false)
const verificandoSesion = ref(true)
const iniciandoSesion = ref(false)
const usuario = ref('')
const password = ref('')
const errorAcceso = ref('')

const rodamientos = ref([])
const retenedores = ref([])
const proveedores = ref([])
const errorRodamientos = ref(null)
const errorRetenedores = ref(null)
const errorProveedores = ref(null)
const idEdicion = ref(null)
const formularioRef = ref(null)

const obtenerValorProveedor = (item, claves) => {
  for (const clave of claves) {
    if (item && Object.prototype.hasOwnProperty.call(item, clave) && item[clave] !== undefined && item[clave] !== null) {
      return item[clave]
    }
  }
  return ''
}

// Estado para la barra de búsqueda rápida
const busqueda = ref('')

const estadoInicialFormulario = () => ({
  codigo: '', marca: '', stock_actual: 0, stock_minimo: 0, ubicacion_almacen: '',
  diametro_interno_mm: 0, diametro_externo_mm: 0, altura_mm: 0, material: '',
  ancho_mm: 0, tipo_sellado: '',
  NOMBRE: '', NIT: '', CONTACTO: '', TELEFONO: '', EMAIL: '', DIRECCION: ''
})

const formulario = ref(estadoInicialFormulario())

const manejarSesionExpirada = (respuesta) => {
  if (respuesta.status !== 401) return false
  autenticado.value = false
  errorAcceso.value = 'La sesión expiró. Inicia sesión nuevamente.'
  return true
}

// ==========================================
// FILTRADO EN TIEMPO REAL (COMPUTED)
// ==========================================
const rodamientosFiltrados = computed(() => {
  const termino = busqueda.value.toLowerCase().trim()
  if (!termino) return rodamientos.value
  return rodamientos.value.filter(rod => 
    rod.codigo.toLowerCase().includes(termino) || 
    rod.marca.toLowerCase().includes(termino)
  )
})

const retenedoresFiltrados = computed(() => {
  const termino = busqueda.value.toLowerCase().trim()
  if (!termino) return retenedores.value
  return retenedores.value.filter(ret => 
    ret.codigo.toLowerCase().includes(termino) || 
    ret.marca.toLowerCase().includes(termino)
  )
})

// ==========================================
// MÉTODOS CRUD (FETCH)
// ==========================================
const normalizarProveedores = (items = []) =>
  items.map((item) => ({
    ID: item.ID ?? item.id ?? null,
    NOMBRE: obtenerValorProveedor(item, ['NOMBRE', 'nombre', 'Nombre']),
    NIT: obtenerValorProveedor(item, ['NIT', 'nit']),
    CONTACTO: obtenerValorProveedor(item, ['CONTACTO', 'contacto', 'Contacto']),
    TELEFONO: obtenerValorProveedor(item, ['TELEFONO', 'telefono', 'Telefono']),
    EMAIL: obtenerValorProveedor(item, ['EMAIL', 'email', 'Email']),
    DIRECCION: obtenerValorProveedor(item, ['DIRECCION', 'direccion', 'Direccion'])
  }))

const normalizarProveedorFormulario = (item = {}) => {
  const proveedorNormalizado = normalizarProveedores([item])[0] ?? estadoInicialFormulario()
  return { ...estadoInicialFormulario(), ...proveedorNormalizado }
}

const obtenerDatos = async (endpoint, listaRef, errorRef) => {
  try {
    errorRef.value = null
    const respuesta = await fetch(`${API_URL}/${endpoint}`, { credentials: 'include' })
    if (manejarSesionExpirada(respuesta)) return
    if (!respuesta.ok) throw new Error(`Error en ${endpoint}`)

    const datos = await respuesta.json()
    console.log('Respuesta de', endpoint, datos)
    listaRef.value = endpoint === 'proveedores' ? normalizarProveedores(datos) : datos
  } catch (err) { errorRef.value = err.message }
}

const cargarTodo = async () => {
  await Promise.all([
    obtenerDatos('rodamientos', rodamientos, errorRodamientos),
    obtenerDatos('retenedores', retenedores, errorRetenedores),
    obtenerDatos('proveedores', proveedores, errorProveedores),
  ])
}

const verificarSesion = async () => {
  try {
    const respuesta = await fetch(`${API_URL}/auth/session`, { credentials: 'include' })
    if (!respuesta.ok) throw new Error('No se pudo verificar la sesión.')

    const sesion = await respuesta.json()
    autenticado.value = sesion.autenticado
    if (autenticado.value) await cargarTodo()
  } catch (error) {
    errorAcceso.value = 'No se pudo conectar con el servidor. Verifica que la API esté iniciada.'
  } finally {
    verificandoSesion.value = false
  }
}

const iniciarSesion = async () => {
  iniciandoSesion.value = true
  errorAcceso.value = ''

  try {
    const respuesta = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario: usuario.value, password: password.value })
    })
    const resultado = await respuesta.json()

    if (!respuesta.ok) throw new Error(resultado.error || 'No se pudo iniciar sesión.')

    autenticado.value = true
    password.value = ''
    await cargarTodo()
  } catch (error) {
    errorAcceso.value = error.message === 'Failed to fetch'
      ? 'No se pudo conectar con el servidor. Verifica que la API esté iniciada.'
      : error.message
  } finally {
    iniciandoSesion.value = false
  }
}

const cerrarSesion = async () => {
  try {
    const respuesta = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    if (manejarSesionExpirada(respuesta)) return
    if (!respuesta.ok) throw new Error('No se pudo cerrar la sesión.')

    autenticado.value = false
    usuario.value = ''
    password.value = ''
    rodamientos.value = []
    retenedores.value = []
  } catch (error) {
    errorAcceso.value = error.message
  }
}

const guardarItem = async () => {
  try {
    let datosAEnviar = {}

    if (tipoActivo.value === 'retenedores') {
      datosAEnviar = {
        codigo: formulario.value.codigo,
        marca: formulario.value.marca,
        stock_actual: formulario.value.stock_actual,
        stock_minimo: formulario.value.stock_minimo,
        ubicacion_almacen: formulario.value.ubicacion_almacen,
        diametro_interno_mm: formulario.value.diametro_interno_mm,
        diametro_externo_mm: formulario.value.diametro_externo_mm,
        altura_mm: formulario.value.altura_mm,
        material: formulario.value.material
      }
    } else if (tipoActivo.value === 'rodamientos') {
      datosAEnviar = {
        codigo: formulario.value.codigo,
        marca: formulario.value.marca,
        stock_actual: formulario.value.stock_actual,
        stock_minimo: formulario.value.stock_minimo,
        ubicacion_almacen: formulario.value.ubicacion_almacen,
        diametro_interno_mm: formulario.value.diametro_interno_mm,
        diametro_externo_mm: formulario.value.diametro_externo_mm,
        ancho_mm: formulario.value.ancho_mm,
        tipo_sellado: formulario.value.tipo_sellado
      }
    } else if (tipoActivo.value === 'proveedores') {
      datosAEnviar = {
        NOMBRE: formulario.value.NOMBRE,
        NIT: formulario.value.NIT,
        CONTACTO: formulario.value.CONTACTO,
        TELEFONO: formulario.value.TELEFONO,
        EMAIL: formulario.value.EMAIL,
        DIRECCION: formulario.value.DIRECCION
      }
    }

    const esEdicion = idEdicion.value !== null
    const url = esEdicion ? `${API_URL}/${tipoActivo.value}/${idEdicion.value}` : `${API_URL}/${tipoActivo.value}`

    const respuesta = await fetch(url, {
      method: esEdicion ? 'PUT' : 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosAEnviar)
    })
    
    if (manejarSesionExpirada(respuesta)) return

    if (respuesta.ok) {
      alert('¡Registro procesado con éxito!')
      cancelarEdicion()
      cargarTodo()
    } else {
      alert('Error en el servidor.')
    }
  } catch (error) { console.error('Error:', error) }
}

const eliminarItem = async (tipo, id) => {
  if (!confirm(`¿Eliminar este registro?`)) return
  try {
    const respuesta = await fetch(`${API_URL}/${tipo}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (manejarSesionExpirada(respuesta)) return
    if (respuesta.ok) {
      cargarTodo()
      if (idEdicion.value === id && tipoActivo.value === tipo) cancelarEdicion()
    }
  } catch (error) { console.error(error) }
}

const prepararEdicion = (tipo, item) => {
  tipoActivo.value = tipo

  if (tipo === 'proveedores') {
    idEdicion.value = item.id ?? item.ID ?? null
    formulario.value = normalizarProveedorFormulario(item)
  } else {
    idEdicion.value = item.id || item.ID
    formulario.value = { ...item }
  }

  requestAnimationFrame(() => {
    formularioRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const cancelarEdicion = () => {
  idEdicion.value = null
  formulario.value = estadoInicialFormulario()
}

const cambiarTipoFormulario = (tipo) => {
  tipoActivo.value = tipo
  cancelarEdicion()
  irASeccion(tipo)
}

const irASeccion = (tipo) => {
  const idsPorTipo = {
    retenedores: 'seccion-retenedores',
    rodamientos: 'seccion-rodamientos',
    proveedores: 'seccion-proveedores'
  }

  const idDestino = idsPorTipo[tipo]
  if (!idDestino) return

  requestAnimationFrame(() => {
    const seccion = document.getElementById(idDestino)
    if (seccion) {
      seccion.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

let observerSecciones = null

onMounted(() => {
  verificarSesion()

  const idsPorTipo = {
    retenedores: 'seccion-retenedores',
    rodamientos: 'seccion-rodamientos',
    proveedores: 'seccion-proveedores'
  }

  const elementos = Object.entries(idsPorTipo)
    .map(([tipo, id]) => ({ tipo, elemento: document.getElementById(id) }))
    .filter(({ elemento }) => elemento)

  if (elementos.length === 0) return

  observerSecciones = new IntersectionObserver((entradas) => {
    const visible = entradas
      .filter((entrada) => entrada.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

    if (!visible) return

    const tipoVisible = elementos.find(({ elemento }) => elemento === visible.target)?.tipo
    if (tipoVisible) {
      tipoActivo.value = tipoVisible
    }
  }, {
    threshold: [0.2, 0.5, 0.8],
    rootMargin: '-10% 0px -35% 0px'
  })

  elementos.forEach(({ elemento }) => observerSecciones.observe(elemento))
})

onBeforeUnmount(() => {
  if (observerSecciones) {
    observerSecciones.disconnect()
  }
})
</script>

<template>
  <main v-if="verificandoSesion" class="pantalla-acceso">
    <p>Verificando sesión...</p>
  </main>

  <main v-else-if="!autenticado" class="pantalla-acceso">
    <form class="tarjeta-acceso" @submit.prevent="iniciarSesion">
      <h1>Inventario Almacén</h1>
      <p class="subtitulo">Inicia sesión para acceder al inventario.</p>

      <label for="usuario">Usuario</label>
      <input id="usuario" v-model.trim="usuario" autocomplete="username" required />

      <label for="password">Contraseña</label>
      <input id="password" v-model="password" type="password" autocomplete="current-password" required />

      <p v-if="errorAcceso" class="alerta-error" role="alert">{{ errorAcceso }}</p>
      <button class="btn-guardar" type="submit" :disabled="iniciandoSesion">
        {{ iniciandoSesion ? 'Ingresando...' : 'Iniciar sesión' }}
      </button>
    </form>
  </main>

  <div v-else class="contenedor-inventario">
    <div class="barra-superior">
      <span class="usuario-sesion">Sesión iniciada como {{ usuario || 'administrador' }}</span>
      <button type="button" class="btn-cerrar-sesion" @click="cerrarSesion">Cerrar sesión</button>
    </div>
    <header class="encabezado-principal">
      <div>
        <h1>📊 Sistema de Inventario - Almacén v2</h1>
        <p class="subtitulo">Monitoreo de repuestos técnicos en tiempo real</p>
      </div>
    </header>

    <!-- BARRA DE BÚSQUEDA RÁPIDA -->
    <div class="bloque-busqueda">
      <input 
        v-model="busqueda" 
        type="text" 
        placeholder="🔍 Buscar por código o marca en tiempo real..." 
        class="input-busqueda"
      />
      <button v-if="busqueda" @click="busqueda = ''" class="btn-limpiar-busqueda">Limpiar</button>
    </div>

    <div class="selector-tipo">
      <button :class="{ activo: tipoActivo === 'retenedores' }" @click="cambiarTipoFormulario('retenedores')" :disabled="idEdicion !== null">⭕ Retenedores</button>
      <button :class="{ activo: tipoActivo === 'rodamientos' }" @click="cambiarTipoFormulario('rodamientos')" :disabled="idEdicion !== null">⚙️ Rodamientos</button>
      <button :class="{ activo: tipoActivo === 'proveedores' }" @click="cambiarTipoFormulario('proveedores')" :disabled="idEdicion !== null">🏢 Proveedores</button>
    </div>

    <!-- FORMULARIO CON VALIDACIÓN VISUAL -->
    <div ref="formularioRef" class="tarjeta-formulario" :class="{ 'modo-edicion': idEdicion !== null }">
      <h3>
        {{ idEdicion ? '📝 Editar' : '➕ Nuevo' }}
        {{
          tipoActivo === 'retenedores' ? 'Retenedor' :
          tipoActivo === 'rodamientos' ? 'Rodamiento' :
          'Proveedor'
        }}
      </h3>

      <!-- Alerta visual de stock crítico antes de enviar -->
      <div
        v-if="tipoActivo !== 'proveedores' && formulario.stock_actual <= formulario.stock_minimo && formulario.stock_actual >= 0"
        class="alerta-formulario-stock"
      >
        ⚠️ <strong>Atención:</strong> El Stock Actual es menor o igual al Stock Mínimo requerido.
      </div>

      <form @submit.prevent="guardarItem" class="formulario-grid">
        <template v-if="tipoActivo !== 'proveedores'">
          <input v-model="formulario.codigo" placeholder="Código" required />
          <input v-model="formulario.marca" placeholder="Marca" required />
          <input v-model.number="formulario.stock_actual" type="number" min="0" placeholder="Stock Actual" required />
          <input v-model.number="formulario.stock_minimo" type="number" min="0" placeholder="Stock Mínimo" required />
          <input v-model="formulario.ubicacion_almacen" placeholder="Ubicación" required />
          <input v-model.number="formulario.diametro_interno_mm" type="number" step="0.01" min="0" placeholder="Ø Interno (mm)" required />
          <input v-model.number="formulario.diametro_externo_mm" type="number" step="0.01" min="0" placeholder="Ø Externo (mm)" required />
        </template>

        <template v-if="tipoActivo === 'retenedores'">
          <input v-model.number="formulario.altura_mm" type="number" step="0.01" min="0" placeholder="Altura (mm)" required />
          <input v-model="formulario.material" placeholder="Material" required />
        </template>

        <template v-if="tipoActivo === 'rodamientos'">
          <input v-model.number="formulario.ancho_mm" type="number" step="0.01" min="0" placeholder="Ancho (mm)" required />
          <input v-model="formulario.tipo_sellado" placeholder="Tipo Sellado" required />
        </template>

        <template v-if="tipoActivo === 'proveedores'">
          <input v-model="formulario.NOMBRE" placeholder="Nombre" required />
          <input v-model="formulario.NIT" placeholder="NIT" />
          <input v-model="formulario.CONTACTO" placeholder="Contacto" />
          <input v-model="formulario.TELEFONO" placeholder="Teléfono" />
          <input v-model="formulario.EMAIL" type="email" placeholder="Email" />
          <input v-model="formulario.DIRECCION" placeholder="Dirección" />
        </template>

        <div class="acciones-formulario">
          <button type="submit" class="btn-guardar">{{ idEdicion ? 'Actualizar' : 'Guardar' }}</button>
          <button v-if="idEdicion" type="button" @click="cancelarEdicion" class="btn-cancelar">Cancelar</button>
        </div>
      </form>
    </div>

    <!-- TABLA RODAMIENTOS -->
    <section id="seccion-rodamientos" class="seccion-tabla" :class="{ activa: tipoActivo === 'rodamientos' }">
      <h2>⚙️ Módulo de Rodamientos</h2>
      <div v-if="errorRodamientos" class="alerta-error">⚠️ {{ errorRodamientos }}</div>
      <div v-else-if="rodamientosFiltrados.length === 0" class="alerta-vacio">No se encontraron rodamientos.</div>
      <table v-else class="tabla-datos">
        <thead>
          <tr><th>ID</th><th>Código</th><th>Marca</th><th>Stock</th><th>Mínimo</th><th>Ubicación</th><th>Ø Int</th><th>Ø Ext</th><th>Ancho</th><th>Sellado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="rod in rodamientosFiltrados" :key="rod.id" :class="{ 'editando': idEdicion === rod.id && tipoActivo === 'rodamientos' }">
            <td>{{ rod.id }}</td><td class="codigo">{{ rod.codigo }}</td><td>{{ rod.marca }}</td>
            <td :class="{ 'bajo-stock': rod.stock_actual <= rod.stock_minimo }">{{ rod.stock_actual }}</td>
            <td>{{ rod.stock_minimo }}</td><td>{{ rod.ubicacion_almacen }}</td><td>{{ rod.diametro_interno_mm }}</td><td>{{ rod.diametro_externo_mm }}</td><td>{{ rod.ancho_mm }}</td><td><span class="etiqueta-sellado">{{ rod.tipo_sellado }}</span></td>
            <td class="acciones-columna">
              <button @click="prepararEdicion('rodamientos', rod)" class="btn-editar">Modificar</button>
              <button @click="eliminarItem('rodamientos', rod.id)" class="btn-eliminar">Borrar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- TABLA RETENEDORES -->
    <section id="seccion-retenedores" class="seccion-tabla" :class="{ activa: tipoActivo === 'retenedores' }">
      <h2>⭕ Módulo de Retenedores</h2>
      <div v-if="errorRetenedores" class="alerta-error">⚠️ {{ errorRetenedores }}</div>
      <div v-else-if="retenedoresFiltrados.length === 0" class="alerta-vacio">No se encontraron retenedores.</div>
      <table v-else class="tabla-datos">
        <thead>
          <tr><th>ID</th><th>Código</th><th>Marca</th><th>Stock</th><th>Mínimo</th><th>Ubicación</th><th>Ø Int</th><th>Ø Ext</th><th>Altura</th><th>Material</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="ret in retenedoresFiltrados" :key="ret.id" :class="{ 'editando': idEdicion === ret.id && tipoActivo === 'retenedores' }">
            <td>{{ ret.id }}</td><td class="codigo">{{ ret.codigo }}</td><td>{{ ret.marca }}</td>
            <td :class="{ 'bajo-stock': ret.stock_actual <= ret.stock_minimo }">{{ ret.stock_actual }}</td>
            <td>{{ ret.stock_minimo }}</td><td>{{ ret.ubicacion_almacen }}</td><td>{{ ret.diametro_interno_mm }}</td><td>{{ ret.diametro_externo_mm }}</td><td>{{ ret.altura_mm }}</td><td>{{ ret.material }}</td>
            <td class="acciones-columna">
              <button @click="prepararEdicion('retenedores', ret)" class="btn-editar">Modificar</button>
              <button @click="eliminarItem('retenedores', ret.id)" class="btn-eliminar">Borrar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- TABLA PROVEEDORES -->
    <section id="seccion-proveedores" class="seccion-tabla" :class="{ activa: tipoActivo === 'proveedores' }">
      <h2>🧾 Módulo de Proveedores</h2>
      <div v-if="errorProveedores" class="alerta-error">⚠️ {{ errorProveedores }}</div>
      <div v-else-if="proveedores.length === 0" class="alerta-vacio">No se encontraron proveedores.</div>
      <table v-else class="tabla-datos">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>NIT</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prov in proveedores" :key="prov.ID ?? `${prov.NOMBRE || 'sin-nombre'}-${prov.TELEFONO || 'sin-telefono'}-${prov.EMAIL || 'sin-email'}`">
            <td>{{ prov.ID }}</td>
            <td>{{ prov.NOMBRE || '-' }}</td>
            <td>{{ prov.NIT || '-' }}</td>
            <td>{{ prov.CONTACTO || '-' }}</td>
            <td>{{ prov.TELEFONO || '-' }}</td>
            <td>{{ prov.EMAIL || '-' }}</td>
            <td>{{ prov.DIRECCION || '-' }}</td>
            <td class="acciones-columna">
              <button @click="prepararEdicion('proveedores', prov)" class="btn-editar">Modificar</button>
              <button @click="eliminarItem('proveedores', prov.ID)" class="btn-eliminar">Borrar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<style scoped>
.contenedor-inventario {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 22px 40px;
  background: linear-gradient(180deg, #f5f8fb 0%, #edf3f6 100%);
  border-radius: 24px;
  box-shadow: 0 18px 45px rgba(32, 53, 72, 0.08);
}

.pantalla-acceso {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background: radial-gradient(circle at top, #f1f7fb 0%, #eaf0f4 55%, #edf3f6 100%);
}

.tarjeta-acceso {
  display: grid;
  gap: 12px;
  width: min(100%, 380px);
  padding: 30px;
  background: white;
  border: 1px solid #dfe9ef;
  border-radius: 18px;
  box-shadow: 0 18px 36px rgba(44, 62, 80, 0.10);
}

.tarjeta-acceso h1 { color: #2c3e50; }
.tarjeta-acceso label { font-weight: 600; }
.tarjeta-acceso input { padding: 11px; border: 1px solid #bdc3c7; border-radius: 5px; font: inherit; }
.tarjeta-acceso .btn-guardar:disabled { opacity: 0.7; cursor: wait; }

.barra-superior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding: 14px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(204, 221, 230, 0.9);
  color: #52616b;
  backdrop-filter: blur(8px);
}

.usuario-sesion {
  font-weight: 600;
  color: #334155;
}

.btn-cerrar-sesion {
  padding: 10px 16px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.01em;
  box-shadow: 0 10px 18px rgba(239, 68, 68, 0.22);
}

.encabezado-principal {
  margin-bottom: 18px;
  padding: 6px 0 4px;
}

.encabezado-principal h1 {
  margin: 0 0 8px 0;
  color: #0f172a;
  font-size: clamp(1.8rem, 2.2vw, 2.6rem);
  line-height: 1.2;
}

.subtitulo {
  margin: 0;
  color: #64748b;
  font-size: 1rem;
  letter-spacing: 0.02em;
}

.bloque-busqueda {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.input-busqueda {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid #c7d5df;
  border-radius: 12px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

.input-busqueda:focus { border-color: #42b883; outline: none; box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.12); }

.btn-limpiar-busqueda {
  padding: 0 15px;
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.seccion-tabla {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid #dfe9ef;
  border-radius: 18px;
  padding: 22px 20px 18px;
  margin-bottom: 30px;
  box-shadow: 0 12px 24px rgba(36, 58, 71, 0.05);
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}

.seccion-tabla.activa {
  border-color: #42b883;
  box-shadow: 0 16px 30px rgba(66, 184, 131, 0.12);
  transform: translateY(-1px);
}

.seccion-tabla h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.2rem;
  letter-spacing: 0.02em;
}

.tabla-datos {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 15px;
  table-layout: fixed;
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e5edf3;
}

.tabla-datos th, .tabla-datos td {
  border-bottom: 1px solid #edf1f4;
  border-right: 1px solid #edf1f4;
  padding: 12px 10px;
  text-align: left;
  vertical-align: top;
  word-break: break-word;
}

.tabla-datos th:last-child, .tabla-datos td:last-child {
  border-right: none;
}

.tabla-datos tr:last-child td {
  border-bottom: none;
}

.tabla-datos th {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #f8fafc;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
}

.tabla-datos tr:nth-child(even) { background: #f9fbfd; }
.tabla-datos tr:hover { background: #f1f8ff; }
.codigo { font-family: monospace; font-weight: bold; }
.bajo-stock { background: #fff1f0; color: #c62828; font-weight: bold; }
.etiqueta-sellado { background: #e1f5fe; color: #0288d1; padding: 4px 8px; border-radius: 999px; font-size: 0.82rem; font-weight: 600; }
.selector-tipo {
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selector-tipo button {
  padding: 10px 18px;
  border: 1px solid #cfe1d9;
  background: #f4f8f6;
  cursor: pointer;
  font-weight: 700;
  border-radius: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  color: #1f2937;
}

.selector-tipo button.activo {
  background: linear-gradient(135deg, #42b883 0%, #31a56d 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 8px 16px rgba(66, 184, 131, 0.2);
}

.tarjeta-formulario {
  background: linear-gradient(135deg, #ffffff 0%, #f9fbfc 100%);
  border: 1px solid #dfe7ec;
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 30px;
  box-shadow: 0 14px 30px rgba(44, 62, 80, 0.08);
}

.tarjeta-formulario.modo-edicion {
  border: 2px solid #3498db;
  background: linear-gradient(135deg, #f0faff 0%, #edf7ff 100%);
  box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.12), 0 12px 28px rgba(52, 152, 219, 0.12);
  animation: resaltarFormulario 0.45s ease;
}

@keyframes resaltarFormulario {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(52, 152, 219, 0.10);
    transform: scale(1.004);
  }
  100% {
    box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.12), 0 12px 28px rgba(52, 152, 219, 0.12);
    transform: scale(1);
  }
}

.alerta-formulario-stock {
  background: #fef9e7;
  color: #9a6d00;
  border: 1px solid #f5d97a;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
}

.formulario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  align-items: center;
}

.formulario-grid input {
  min-height: 44px;
  border: 1px solid #d3dfe7;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

.acciones-formulario {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.btn-guardar {
  flex: 1;
  max-width: 180px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  border: none;
  padding: 12px 18px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.18);
}

.modo-edicion .btn-guardar {
  background: linear-gradient(135deg, #3498db 0%, #2a7ac0 100%);
}

.btn-cancelar {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: white;
  border: none;
  padding: 12px 18px;
  cursor: pointer;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2);
}

.acciones-columna {
  white-space: nowrap;
  width: 128px;
}

.acciones-columna button {
  display: block;
  width: 100%;
  margin: 0 0 8px 0;
  padding: 9px 10px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
}

.acciones-columna button:last-child {
  margin-bottom: 0;
}

.btn-editar {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.18);
}

.btn-eliminar {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 8px 16px rgba(239, 68, 68, 0.18);
}

tr.editando { background: #e0f2fe !important; }
.alerta-error { background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 10px; }
.alerta-vacio { color: #64748b; font-style: italic; padding: 15px 0; }

.tarjeta-formulario h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.4rem;
  letter-spacing: 0.02em;
}

.formulario-grid input {
  min-height: 42px;
  border: 1px solid #cfd8dc;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: #ffffff;
}

.formulario-grid input:focus {
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.12);
  outline: none;
}

.acciones-formulario {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.acciones-formulario button {
  min-width: 140px;
  min-height: 42px;
  border-radius: 8px;
  font-weight: 700;
}

.selector-tipo button {
  transition: all 0.2s ease;
}

.selector-tipo button:hover,
.btn-guardar:hover,
.btn-cancelar:hover,
.btn-editar:hover,
.btn-eliminar:hover {
  filter: brightness(0.97);
  transform: translateY(-1px);
}

</style>
