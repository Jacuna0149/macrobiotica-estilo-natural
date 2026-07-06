/*
  Migración de base de datos para las nuevas historias de usuario:
    HU-11  Historial de pedidos del cliente
    HU-12  Lista de favoritos
    HU-13  Gestión del estado de los pedidos (administrador)

  Ejecutar UNA sola vez sobre la base de datos "macrobiotica" ya existente,
  con una cuenta administradora (el usuario_prueba no tiene permisos DDL).
*/
use macrobiotica;

-- ------------------------------------------------------------------
-- factura: estado de entrega del pedido y motivo de cancelación
-- ------------------------------------------------------------------
ALTER TABLE factura
  ADD COLUMN estado_pedido      VARCHAR(20)  NULL AFTER estado,
  ADD COLUMN motivo_cancelacion VARCHAR(255) NULL;

-- Estado de entrega inicial para los pedidos ya existentes
UPDATE factura SET estado_pedido = 'Entregado' WHERE estado_pedido IS NULL;

-- ------------------------------------------------------------------
-- favorito: relación usuario <-> producto (HU-12)
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorito (
  id_favorito INT NOT NULL AUTO_INCREMENT,
  id_usuario  INT NOT NULL,
  id_producto INT NOT NULL,
  fecha_creacion     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_favorito),
  UNIQUE (id_usuario, id_producto),
  FOREIGN KEY fk_favorito_usuario  (id_usuario)  REFERENCES usuario(id_usuario),
  FOREIGN KEY fk_favorito_producto (id_producto) REFERENCES producto(id_producto))
  ENGINE = InnoDB;

-- Nota: el permiso "grant ... on macrobiotica.*" ya cubre la nueva tabla favorito.
