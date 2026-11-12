# Inventario Almacén

## Instalación

Instala las dependencias del frontend y de la API:

```powershell
npm install
cd inventario-api
npm install
```

La API requiere `inventario-api/.env` con estas variables:

```text
ADMIN_USER=usuario_administrador
ADMIN_PASSWORD_HASH=hash_bcrypt_de_la_contrasena
SESSION_SECRET=secreto_largo_y_aleatorio
```

`ADMIN_PASSWORD_HASH` debe contener un hash bcrypt, no la contraseña en texto
plano. No compartas ni subas el archivo `.env` al repositorio.

## Iniciar en desarrollo

Abre dos terminales en Ubuntu desde la carpeta del proyecto. En la primera,
inicia la API:

```bash
cd inventario-api
npm start
```

En la segunda, inicia Vue:

```bash
npm run dev
```

Vite escucha en la interfaz de red de la VM y reenvía las solicitudes `/api`
a la API local. Desde Windows, abre `http://IP_DE_LA_VM:5173`; puedes consultar
la IP de Ubuntu con `hostname -I`. Si el firewall de Ubuntu está activo, permite
el acceso desde el host a TCP 5173. No es necesario exponer el puerto 3000.

Inicia sesión con el usuario y la contraseña configurados para la API.

La API valida las credenciales, mantiene la sesión mediante una cookie HTTP-only
y rechaza las rutas del inventario si no hay una sesión autenticada.

## Compilar para producción

```powershell
npm run build
```
