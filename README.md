# Macrobiótica Estilo Natural – Sitio Web Oficial

## Descripción
Sitio web desarrollado para Macrobiótica Estilo Natural, negocio costarricense dedicado a la venta de productos naturales, suplementos alimenticios y artículos de bienestar y cuidado personal.

El sitio permitirá a los clientes explorar el catálogo completo de productos organizado por categorías, consultar información de cada producto y contactar al negocio directamente.

## Tecnologías
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express (API REST)
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT (con roles cliente/admin) y hash de contraseñas con bcrypt

## Requisitos previos
- [Node.js](https://nodejs.org/) LTS (v20 o superior) y npm
- [PostgreSQL](https://www.postgresql.org/) (v14 o superior)
- Git

## Estructura del proyecto
```
macrobiotica-estilo-natural/
├── client/   # Frontend (React + Vite + Tailwind)  → http://localhost:5173
└── server/   # Backend (Node.js + Express + PostgreSQL) → http://localhost:4000
```

## Puesta en marcha (local)

> Cada integrante usa su propia base de datos y su propio archivo `.env` local.
> Los archivos `.env` **no se suben** al repositorio (están en `.gitignore`).

### 1. Clonar y actualizar
```bash
git clone https://github.com/Jacuna0149/macrobiotica-estilo-natural.git
cd macrobiotica-estilo-natural
git checkout develop && git pull
```

### 2. Crear la base de datos
Crea una base llamada `macrobiotica` en tu PostgreSQL local (por ejemplo con
`createdb macrobiotica` o desde pgAdmin).

### 3. Backend
```bash
cd server
npm install
cp .env.example .env          # en Windows: copy .env.example .env
# Edita server/.env con TUS datos (ver más abajo)
npm run migrate               # crea las tablas
npm run seed                  # carga categorías y productos de ejemplo
npm run dev                   # inicia la API en http://localhost:4000
```

### 4. Frontend (en otra terminal)
```bash
cd client
npm install
cp .env.example .env          # en Windows: copy .env.example .env
npm run dev                   # inicia la app en http://localhost:5173
```

## Variables de entorno

**`server/.env`** (a partir de `server/.env.example`):
| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del backend | `4000` |
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://postgres:TU_PASSWORD@localhost:5432/macrobiotica` |
| `JWT_SECRET` | Secreto para firmar los tokens (cadena aleatoria larga) | `una-cadena-larga-aleatoria` |
| `JWT_EXPIRES_IN` | Vigencia del token | `7d` |
| `CLIENT_URL` | Origen permitido para CORS | `http://localhost:5173` |

**`client/.env`** (a partir de `client/.env.example`):
| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:4000/api` |

## Integrantes del equipo
- Jeremy Acuña Murillo
- Ignacio Marín Quesada
- José Orozco Hernández
- Jerian Ulloa Solano

## Acuerdo de trabajo por ramas

### Estructura de ramas
- `main` → rama principal, solo contiene código estable y revisado
- `develop` → rama de integración, aquí se unen los cambios antes de pasar a main
- Cada integrante trabaja en su propia rama personal:
  - `feature/nombre-integrante`

### Reglas
1. Nadie sube cambios directamente a `main`
2. Todo cambio pasa primero por la rama personal, luego a `develop` mediante un Pull Request
3. El Pull Request debe ser revisado y aprobado por al menos un compañero antes de hacer merge
4. Los mensajes de commit deben ser descriptivos:
   - ✅ `"agrega sección de categorías en la página principal"`
   - ❌ `"cambios"` o `"fix"`
5. Antes de iniciar trabajo nuevo, siempre hacer `git pull` para tener el código actualizado

### Flujo de trabajo
1. Hacer `git pull` en `develop`
2. Crear o cambiarse a tu rama personal
3. Hacer los cambios y commits
4. Abrir un Pull Request hacia `develop`
5. Esperar revisión de un compañero
6. Hacer merge una vez aprobado
