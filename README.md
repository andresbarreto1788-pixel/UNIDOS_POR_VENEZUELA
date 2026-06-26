# 🇻🇪 Unidos por Venezuela

Plataforma humanitaria para **buscar a familiares y personas heridas o desaparecidas** del sismo en los hospitales de Venezuela.

> Hecha con Next.js + Framer Motion + PostgreSQL (Prisma). Instalable como app en el celular (PWA).

---

## ✨ Funciones

- 🔎 **Motor de búsqueda** por nombre, apellido, cédula, hospital o ubicación interna (sala/piso/área).
- 🏥 **Hospitales y puntos de atención** con conteo de personas y enlace a mapa.
- 📲 **Botón “Descarga aquí”** que instala la app en el celular (PWA, sin tiendas).
- 💬 **Botón flotante de WhatsApp** (+58 412-931-7277) para reportar y actualizar datos.
- 🧍 **Dashboard de desaparecidos** (`/reportar`): cualquier familiar publica a una persona desaparecida con **foto, descripción, señas, último lugar y edificio donde vivía**. Se muestran en la **pantalla principal** y en `/desaparecidos` (galería con búsqueda).
- 🗂️ **Panel de administración** (`/admin`) con **importación por CSV/Excel**, **gestión de hospitales** (crear/editar/eliminar centros nuevos) y **gestión de desaparecidos** (marcar “encontrada”, eliminar).
- 🐶 Imagen y la historia de **Tsunami**, el perrito rescatista.
- 🟦🟨🟥 Diseño con colores de la bandera y animaciones con Framer Motion.

---

## 🚀 Puesta en marcha (local)

Requisitos: **Node 18+** y una base **PostgreSQL** (local con Docker o en la nube).

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
#   -> edita DATABASE_URL y ADMIN_TOKEN

# 3. Crear las tablas en la base
npm run db:push

# 4. (Opcional) Cargar hospitales + datos de EJEMPLO
npm run db:seed

# 5. Arrancar en desarrollo
npm run dev
```

Abre http://localhost:3000

### Postgres local rápido con Docker
```bash
docker run --name unidos-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=unidos -p 5432:5432 -d postgres:16
```
`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/unidos?schema=public"`

---

## ☁️ Despliegue en Railway + GitHub

1. **Sube el proyecto a GitHub** (ver más abajo).
2. En **Railway** → *New Project* → *Deploy from GitHub repo* → elige este repo.
3. En el proyecto, **+ New** → **Database** → **PostgreSQL**. Railway crea la variable `DATABASE_URL`.
4. En el servicio web (Variables), agrega:
   - `DATABASE_URL` → referencia a la del Postgres (`${{Postgres.DATABASE_URL}}`)
   - `ADMIN_TOKEN` → una clave secreta tuya
   - `NEXT_PUBLIC_WHATSAPP` → `584129317277`
   - `NEXT_PUBLIC_SITE_URL` → la URL pública que te da Railway
5. Railway construye con `npm run build` y arranca con `npm run start`
   (el `start` ejecuta `prisma db push` para crear/actualizar las tablas automáticamente).
6. Para cargar los hospitales y ejemplos una vez desplegado, abre la consola del servicio en Railway y ejecuta:
   ```bash
   npm run db:seed
   ```

> 📌 **Tus datos NO se pierden al actualizar.** Las tablas son persistentes en el Postgres de Railway; los `deploy` solo actualizan el código, y el seed no sobreescribe personas existentes.

### Subir a GitHub
```bash
git init
git add .
git commit -m "Unidos por Venezuela - version inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/unidos-por-venezuela.git
git push -u origin main
```

---

## 📊 Datos ya cargados

El proyecto **ya incluye 811 personas reales** del sismo (archivo `prisma/datos_reales.csv`),
extraídas y consolidadas desde los listados oficiales (PDF consolidado + documentos por hospital
+ transcripción de las fotos de los centros). Se cargan con `npm run db:seed`. Cobertura por centro:

| Centro | Personas |
|---|---|
| Punto de atención - Campo de Golf, Playa Los Cocos (albergue) | 306 |
| Hospital Domingo Luciani (El Llanito) | 148 |
| Hospital Dr. Miguel Pérez Carreño | 115 |
| Periférico de Catia (con cama y área) | 68 |
| Hospital Universitario de Caracas | 59 |
| Hospital Vargas de Caracas | 56 |
| Hospital Ricardo Baquero González | 31 |
| Cruz Roja Venezolana | 27 |
| Hospital J.M. de los Ríos (Niños) | 1 |

> Fuentes: PDF consolidado de ingresos + documentos por hospital (nombre, cédula, edad, sexo,
> dirección, observaciones) y fotos de los centros (Periférico de Catia aporta cama/área;
> Playa Los Cocos aporta el listado de sobrevivientes del albergue). Deduplicado por cédula.
> Las fotos de Luciani y Pérez Carreño son la fuente manuscrita de datos que ya están en el PDF.

> El seed es **idempotente**: al re-ejecutarlo solo reemplaza los registros de fuente `datos-reales`,
> sin borrar lo que cargues manualmente por el panel `/admin`.

## 📥 Actualizar / agregar más datos (listados del Drive)

Para nuevos listados (o las fotos de Catia, Vargas, Carlos Arvelo, Playa Los Cocos que están como
imágenes), pásalos a **CSV** y cárgalos así:

1. Entra a `/admin` e ingresa tu `ADMIN_TOKEN`.
2. Sube el CSV (hay una **plantilla** descargable en la misma página: `/plantilla.csv`).
3. Columnas reconocidas (en cualquier orden, sin distinguir acentos/mayúsculas):

| Columna | Ejemplo |
|---|---|
| `nombre` *(obligatorio)* | María José |
| `apellido` | Rodríguez |
| `cedula` | V-12345678 |
| `edad` | 34 |
| `sexo` | F |
| `hospital` | `catia` o "Hospital de Catia" |
| `area` | Emergencia - Piso 1 |
| `cama` | 12 |
| `estado` | Estable / Crítico / No identificado... |
| `condicion` | Fractura en brazo derecho |
| `contacto` | 0412-0000000 |

Hospitales válidos (slug): `luciani`, `perez-carreno`, `universitario-caracas`, `periferico-catia`, `ricardo-baquero`, `cruz-roja`, `vargas-caracas`, `jm-de-los-rios`, `carlos-arvelo`, `playa-los-cocos`.

---

## 🗂️ Estructura

```
src/
  app/            páginas (inicio, buscar, hospitales, ayuda, admin) + API
  components/     UI y animaciones (Framer Motion)
  lib/            prisma, hospitales, estados, stats
prisma/
  schema.prisma   modelo de datos PostgreSQL
  seed.ts         carga inicial (hospitales + ejemplos)
public/           logo, íconos PWA, imagen de Tsunami, manifest, service worker
```

---

## 🛡️ Seguridad y alta disponibilidad (anti-caídas)

Pensado para soportar mucha gente buscando a la vez sin que el servidor se caiga:

- **Rate limiting por IP** en las APIs (búsqueda 50/10s, importación 10/min) → protege la base de datos de ráfagas, bots y abusos. Devuelve `429` en vez de tumbar el servidor.
- **Caché en memoria + `Cache-Control`** (búsquedas 15s, hospitales 60s) → ráfagas de búsquedas idénticas (mismo apellido) no golpean PostgreSQL; un CDN/edge puede servirlas.
- **Pool de conexiones acotado** (`connection_limit=10`) → no agota las conexiones de Postgres bajo carga.
- **Cabeceras de seguridad** (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) y `X-Powered-By` desactivado.
- **Validación de entrada**: longitud de búsqueda y paginación acotadas; tope de filas por importación.
- **Health check** `/api/health` (verifica app **y** base) usado por Docker/Railway para reiniciar si algo falla.
- **Error boundary** global: un fallo muestra pantalla amable con “Reintentar”, no una caída.
- **Docker**: `restart: unless-stopped`, healthchecks, **límites de memoria/CPU**, volumen persistente y usuario sin privilegios.

### Levantar todo con Docker (auto-hospedaje / VPS)
```bash
# Crea un .env con tus claves (ADMIN_TOKEN, POSTGRES_PASSWORD...) opcional
docker compose up -d --build      # construye y levanta app + Postgres
docker compose logs -f            # ver logs en vivo
docker compose ps                 # estado y salud
docker compose down               # detener (los datos persisten en el volumen)
```
La app queda en http://localhost:3000 y la base de datos persiste en el volumen `pgdata`.

## ⚠️ Importante (privacidad y datos sensibles)

Esta app maneja **datos de salud de personas reales**. Recomendaciones:

- Mostrar públicamente lo mínimo necesario para reunir familias (evita publicar diagnósticos detallados o teléfonos privados sin consentimiento).
- El panel `/admin` está protegido por `ADMIN_TOKEN`: úsalo solo desde dispositivos de confianza.
- Coordina con los hospitales / Protección Civil para validar la información antes de difundirla.

---

Hecho con ❤️ por y para Venezuela.
