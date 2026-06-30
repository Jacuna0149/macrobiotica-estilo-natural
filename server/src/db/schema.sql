-- Esquema base de datos: Macrobiótica Estilo Natural

-- Historia de usuario 1: registro e inicio de sesión de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  apellido      VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol           VARCHAR(20)  NOT NULL DEFAULT 'cliente'
                CHECK (rol IN ('cliente', 'admin')),
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);

-- Historia de usuario 2: catálogo de productos por categoría
CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  creado_en   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id           SERIAL PRIMARY KEY,
  nombre       VARCHAR(150)  NOT NULL,
  descripcion  TEXT,
  precio       NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
  stock        INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  categoria_id INTEGER       REFERENCES categorias (id) ON DELETE SET NULL,
  imagen_url   TEXT,
  activo       BOOLEAN       NOT NULL DEFAULT true,
  creado_en    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (categoria_id);
