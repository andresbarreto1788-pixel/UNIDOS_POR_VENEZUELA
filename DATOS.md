# 📊 Datos — Unidos por Venezuela

Documentación del conjunto de datos de la plataforma humanitaria **Unidos por Venezuela**
(búsqueda de heridos, fallecidos y desaparecidos del sismo de Venezuela 2026).

> Este documento describe la **estructura, fuentes y volumen** de los datos para que
> otros desarrolladores puedan integrarse. Los registros individuales (con datos
> personales/clínicos) **no se incluyen aquí**: viven en la base PostgreSQL y se
> consultan por la API de la app. Última actualización: **2026-06-27**.

---

## 1. Resumen

| Métrica | Valor |
|---|---|
| Personas localizadas (únicas, tras deduplicar) | **4.426** |
| Hospitales / recintos | **25** |
| Fuentes de datos | 2 (`datos-reales`, `localizadosvenezuela`) |

### Por fuente

| `fuente` | Personas | Origen |
|---|---|---|
| `datos-reales` | 800 | Listados oficiales consolidados (PDF/DOCX/imágenes del Drive del sismo), transcritos y curados a mano. Trae cédula, cama y condición clínica. |
| `localizadosvenezuela` | 3.626 | API pública de [localizadosvenezuela.com](https://localizadosvenezuela.com/api) (otra plataforma del mismo sismo). Data OCR cruda. |

### Por hospital / recinto (tras deduplicar)

| Personas | Centro |
|---:|---|
| 1.026 | Hospital Dr. Miguel Pérez Carreño |
| 703 | Hospital Domingo Luciani (El Llanito) |
| 520 | Punto de atención — Campo de Golf, Playa Los Cocos |
| 416 | Hospital Vargas de Caracas |
| 408 | Periférico de Catia (Dr. José Gregorio Hernández) |
| 296 | Hospital José María Vargas — La Guaira |
| 236 | Centro de Acopio Caraballeda |
| 145 | Hospital Militar Dr. Carlos Arvelo |
| 130 | Seguro Social La Guaira |
| 123 | Hospital Universitario de Caracas (HUC) |
| 84 | Hospital Ana Francisca Pérez de León 2 |
| 61 | Hospital de Pariata |
| 45 | Hospital Ana Francisca Pérez de |
| 42 | Clínica El Ávila |
| 40 | Cruz Roja Venezolana |
| 35 | Materno Infantil del Valle Hugo Chávez Frías |
| 31 | Hospital Ricardo Baquero González (Los Magallanes) |
| 21 | IVSS — Hospital General Estadal de Misiones de Nuevas Generaciones |
| 17 | Alcaldía de Chacao |
| 16 | Hospital Dr. José Gregorio Hernández |
| 15 | Personas en residencias |
| 9 | Hospital General del Oeste |
| 4 | Sin identificar — Lista PNA-GNB |
| 2 | Hospital J.M. de los Ríos (Niños) |
| 1 | Hospital Dr. Rafael Medina Jiménez |

---

## 2. Modelo de datos (Prisma / PostgreSQL)

Esquema completo en [`prisma/schema.prisma`](prisma/schema.prisma).

### `Persona` — herido / localizado en un centro

| Campo | Tipo | Notas |
|---|---|---|
| `id` | String (cuid) | PK |
| `nombre` | String | Nombre (o nombre completo si no se pudo separar) |
| `apellido` | String? | |
| `cedula` | String? | Documento de identidad (puede no estar identificada) |
| `edad` | Int? | |
| `sexo` | String? | M / F / Otro |
| `hospitalId` | String? | FK → `Hospital` |
| `area` | String? | Sala, piso, pabellón, emergencia, UCI… |
| `cama` | String? | |
| `estado` | `Estado` (enum) | Ver abajo. Default `EN_OBSERVACION` |
| `condicion` | String? | Descripción breve de lesiones/condición |
| `contacto` | String? | Teléfono de un familiar si se conoce |
| `observacion` | String? | Notas, procedencia, referencia de fuente |
| `fechaIngreso` | DateTime? | |
| `fuente` | String? | `datos-reales` \| `localizadosvenezuela` \| `import-csv` \| … |
| `createdAt` / `updatedAt` | DateTime | |

Índices: `nombre`, `apellido`, `cedula`.

**enum `Estado`:** `ESTABLE`, `CRITICO`, `EN_OBSERVACION`, `DADO_DE_ALTA`, `REFERIDO`, `NO_IDENTIFICADO`, `FALLECIDO`.

### `Hospital` — centro de atención

| Campo | Tipo | Notas |
|---|---|---|
| `id` | String (cuid) | PK |
| `nombre` | String | |
| `slug` | String **único** | Identificador estable |
| `ciudad` | String | |
| `direccion` / `telefono` / `mapsUrl` | String? | |

### `Desaparecido` — reporte público de familiares

Reportes creados desde `/reportar` (foto base64 comprimida, señas, última ubicación,
`estadoBusqueda` = `BUSCANDO` \| `ENCONTRADO`, teléfono de contacto). Ver schema para el detalle.

---

## 3. API interna de la app

Base: la propia app Next.js (App Router). Endpoints relevantes:

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `GET` | `/api/personas?q=&hospital=` | Búsqueda de personas (con caché + rate-limit por IP) | Pública |
| `POST` | `/api/import` | Importación masiva `{ filas: [...] }` | `x-admin-token` |
| `GET/POST` | `/api/desaparecidos` | Lista / publica desaparecidos | GET público |
| `PATCH/DELETE` | `/api/desaparecidos/[id]` | Editar / borrar | `x-admin-token` |
| `POST` | `/api/hospitales`, `PATCH/DELETE /api/hospitales/[id]` | CRUD de hospitales | `x-admin-token` |
| `GET` | `/api/health` | Healthcheck (verifica la DB) | Pública |

Protecciones: rate-limit por IP en memoria ([`src/lib/rateLimit.ts`](src/lib/rateLimit.ts)),
caché en memoria con TTL ([`src/lib/cache.ts`](src/lib/cache.ts)), cabeceras de seguridad.

> ⚠️ **Caché:** las escrituras directas a la base (p. ej. el sync de abajo) no invalidan el
> caché del servidor en ejecución. Tras una sincronización, **reinicia/redeploy** el servicio
> para que los conteos y búsquedas reflejen el nuevo total.

---

## 4. Fuente externa: API de localizadosvenezuela.com

API pública REST que alimenta la fuente `localizadosvenezuela`.
Documentación en `https://localizadosvenezuela.com/api`.

> Cloudflare bloquea user-agents de bots → enviar un **User-Agent de navegador**.

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/localizados?page=&limit=&q=&lugar=` | Lista paginada. `meta: { page, limit, total, totalPages }` |
| `GET` | `/api/v1/localizados/{slug}` | Detalle de una persona |
| `GET` | `/api/v1/lugares` | Recintos con `totalLocalizados` |

Campos de cada localizado: `slug`, `nombreCompleto`, `edad`, `telefono`, `direccion`,
`observaciones`, `condicion`, `lugarSlug`, `lugarNombre`, `fuente { tipo, nombre, notas, fecha }`,
`publicadoEn`.

---

## 5. Sincronización con la fuente externa

Script: [`scripts/syncLocalizados.ts`](scripts/syncLocalizados.ts) · Comando: `npm run sync:localizados`.

- Pagina toda la API, mapea campos y **fusiona en `Persona`** con `fuente="localizadosvenezuela"`.
- **Idempotente**: borra solo las filas de esa fuente y las recrea. No toca `datos-reales`,
  importaciones de admin ni desaparecidos.
- Mapea los recintos de su API a nuestros hospitales (alias); los que no existen se crean.
- `npm run sync:localizados -- --dry` valida la descarga y el mapeo **sin escribir**.

Requiere `DATABASE_URL`. Como el `*.railway.internal` no es accesible fuera de Railway,
desde una máquina externa usa la **URL pública** del Postgres (`DATABASE_PUBLIC_URL`):

```bash
DATABASE_URL="postgresql://...proxy.rlwy.net:PUERTO/railway" npm run sync:localizados
# o dentro de Railway:
railway run npm run sync:localizados
```

---

## 6. Deduplicación

Tras combinar ambas fuentes se eliminan duplicados de forma **conservadora**:

- **Criterio:** mismo nombre normalizado (minúsculas, sin acentos, sin signos, espacios
  colapsados) **Y** mismo hospital.
- **Se conserva** el registro más completo (prioriza `datos-reales`, que trae cédula/cama/
  condición clínica).
- **No** se deduplica entre hospitales distintos (se respetan homónimos y traslados).
- En la última corrida se eliminaron **833** duplicados (de 5.259 → **4.426** únicos).

Antes de cualquier borrado se genera un **backup JSON** completo de `personas` + `hospitales`.

---

## 7. Stack y despliegue

- **Next.js 14** (App Router) · TypeScript · Tailwind · Framer Motion.
- **Prisma** + **PostgreSQL**.
- Desplegado en **Railway** (Postgres gestionado). `start` corre `prisma db push` + seed + `next start`.
- Datos iniciales: `npm run db:seed` (carga `prisma/datos_reales.csv`, idempotente por `fuente`).

---

## 8. Notas de calidad de datos

- La fuente `localizadosvenezuela` es **OCR cruda**: hay nombres con ruido (numeración,
  ubicaciones embebidas) e incluso **varias personas mezcladas en un mismo registro**
  (p. ej. `"10- Helary Rodriguez/ piso 15- 11-Morocho piso 3 37B"`). No se intentó separarlas
  automáticamente para no introducir errores.
- `condicion` suele venir como `"desconocido"` → se mapea a `estado = EN_OBSERVACION`.
- Los slugs de recinto de la API externa traen duplicados/erratas; solo se importan los que
  efectivamente tienen personas asociadas.
```
