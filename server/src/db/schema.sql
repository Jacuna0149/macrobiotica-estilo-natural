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

-- Historia de usuario 3: carrito de compras (un carrito por usuario)
CREATE TABLE IF NOT EXISTS carritos (
  id             SERIAL PRIMARY KEY,
  usuario_id     INTEGER NOT NULL UNIQUE REFERENCES usuarios (id) ON DELETE CASCADE,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carrito_items (
  id          SERIAL PRIMARY KEY,
  carrito_id  INTEGER NOT NULL REFERENCES carritos (id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos (id) ON DELETE CASCADE,
  cantidad    INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  UNIQUE (carrito_id, producto_id)
);

CREATE INDEX IF NOT EXISTS idx_carrito_items_carrito ON carrito_items (carrito_id);

-- Historia de usuario 4: pedidos (checkout)
CREATE TABLE IF NOT EXISTS pedidos (
  id           SERIAL PRIMARY KEY,
  usuario_id   INTEGER REFERENCES usuarios (id) ON DELETE SET NULL,
  -- Dirección de envío
  nombre_envio VARCHAR(200) NOT NULL,
  provincia    VARCHAR(100) NOT NULL,
  canton       VARCHAR(100) NOT NULL,
  direccion    TEXT         NOT NULL,
  -- Pago (simulado)
  metodo_pago  VARCHAR(30)  NOT NULL
               CHECK (metodo_pago IN ('tarjeta', 'sinpe', 'efectivo')),
  -- Montos
  subtotal     NUMERIC(10, 2) NOT NULL,
  envio        NUMERIC(10, 2) NOT NULL,
  impuesto     NUMERIC(10, 2) NOT NULL,
  total        NUMERIC(10, 2) NOT NULL,
  estado       VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
               CHECK (estado IN ('pendiente', 'preparando', 'enviado', 'entregado', 'cancelado')),
  creado_en    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pedido_items (
  id              SERIAL PRIMARY KEY,
  pedido_id       INTEGER NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  producto_id     INTEGER REFERENCES productos (id) ON DELETE SET NULL,
  nombre_producto VARCHAR(150)  NOT NULL,        -- snapshot del nombre al comprar
  precio_unitario NUMERIC(10, 2) NOT NULL,       -- snapshot del precio al comprar
  cantidad        INTEGER       NOT NULL CHECK (cantidad > 0),
  subtotal        NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedido_items_pedido ON pedido_items (pedido_id);
