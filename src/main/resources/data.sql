-- Datos de ejemplo para el perfil "dev" (H2 en memoria). Solo uso local.
-- Ids secuenciales (BD nueva en cada arranque).

-- Roles
INSERT INTO rol (rol) VALUES ('ADMIN'), ('VENDEDOR'), ('USER');

-- Categorías (1..5)
INSERT INTO categoria (descripcion, ruta_imagen, activo) VALUES
('Fermentados',       'https://picsum.photos/seed/fermentados/600/400',   TRUE),
('Aceites CBD',       'https://picsum.photos/seed/aceites/600/400',       TRUE),
('Superalimentos',    'https://picsum.photos/seed/superalimentos/600/400',TRUE),
('Algas Marinas',     'https://picsum.photos/seed/algas/600/400',         TRUE),
('Cereales y Granos', 'https://picsum.photos/seed/cereales/600/400',      TRUE);

-- Productos (1..6)
INSERT INTO producto (id_categoria, descripcion, detalle, precio, existencias, ruta_imagen, activo) VALUES
(1,'Miso de Cebada','Pasta de miso de cebada fermentada de forma tradicional. Presentacion de 500 g.',8900,40,'https://picsum.photos/seed/miso/600/400',TRUE),
(2,'Aceite CBD 15%','Aceite de CBD de espectro completo al 15%. Presentacion de 30 ml.',35000,15,'https://picsum.photos/seed/cbd/600/400',TRUE),
(3,'Matcha Ceremonial','Te verde matcha grado ceremonial. Presentacion de 100 g.',18500,25,'https://picsum.photos/seed/matcha/600/400',TRUE),
(4,'Wakame Organico','Alga wakame deshidratada organica. Presentacion de 100 g.',6900,50,'https://picsum.photos/seed/wakame/600/400',TRUE),
(5,'Sesamo Negro Organico','Semillas de sesamo negro organico. Presentacion de 250 g.',4200,60,'https://picsum.photos/seed/sesamo/600/400',TRUE),
(5,'Arroz Integral Organico','Arroz integral de grano largo organico. Presentacion de 1 kg.',3500,80,'https://picsum.photos/seed/arroz/600/400',TRUE);

-- Usuarios (1=admin/admin123, 2=cliente/cliente123). Hashes BCrypt reales del proyecto.
INSERT INTO usuario (username, password, nombre, apellidos, correo, telefono, ruta_imagen, activo) VALUES
('admin',  '$2b$10$5T7xbK9a7i/vdgHMdSWhmeWWXjbIfoQxxqvSyq6XTqm1/by4XdA5S','Admin','Macrobiotica','admin@macrobiotica.local','0000-0000','https://picsum.photos/seed/admin/200/200',TRUE),
('cliente','$2b$10$uNyMkCXCz0aCWWbqSv7AreJ5iHxQ3dE4frnDwgBQ.6ganBqbKE4hO','Cliente','De Prueba','cliente@macrobiotica.local','1111-1111','https://picsum.photos/seed/cliente/200/200',TRUE);

-- Roles de los usuarios
INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (1,1),(1,2),(1,3),(2,3);

-- Favoritos del cliente (HU-12)
INSERT INTO favorito (id_usuario, id_producto) VALUES (2,1),(2,3),(2,4);

-- Pedidos de ejemplo (HU-11 y HU-13)
INSERT INTO factura (id_usuario, fecha, total, estado, estado_pedido) VALUES
(2,'2026-06-20 10:30:00',36300,'Pagada','Entregado'),
(2,'2026-07-01 15:00:00',20700,'Pagada','Pendiente'),
(1,'2026-07-03 09:00:00',11900,'Pagada','En proceso');

-- Detalle de ventas de cada pedido
INSERT INTO venta (id_factura, id_producto, precio_historico, cantidad) VALUES
(1,1,8900,2),
(1,3,18500,1),
(2,4,6900,3),
(3,5,4200,2),
(3,6,3500,1);
