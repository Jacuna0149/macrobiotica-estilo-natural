/*
  Script de creación de base de datos para Macrobiótica Estilo Natural
  Este script crea el esquema, tablas, usuarios, y carga datos de ejemplo.
  Basado en la estructura del ejemplo TechShop del curso.
*/
-- Sección de administración (ejecutar una vez en un entorno de desarrollo)
drop database if exists macrobiotica;
drop user if exists usuario_prueba;
drop user if exists usuario_reportes;

-- Creación del esquema
CREATE database macrobiotica
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- Creación de usuarios con contraseñas seguras (idealmente asignadas fuera del script)
create user 'usuario_prueba'@'%' identified by 'Usuar1o_Clave.';
create user 'usuario_reportes'@'%' identified by 'Usuar1o_Reportes.';

-- Asignación de permisos
grant select, insert, update, delete on macrobiotica.* to 'usuario_prueba'@'%';
grant select on macrobiotica.* to 'usuario_reportes'@'%';
flush privileges;

use macrobiotica;

-- --- Sección de Creación de Tablas ---

-- Tabla de categorías
create table categoria (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  descripcion VARCHAR(50) NOT NULL,
  ruta_imagen varchar(1024),
  activo boolean,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_categoria),
  unique (descripcion),
  index ndx_descripcion (descripcion))
  ENGINE = InnoDB;

-- Tabla de productos
create table producto (
  id_producto INT NOT NULL AUTO_INCREMENT,
  id_categoria INT NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  detalle text,
  precio decimal(12,2) CHECK (precio >= 0),
  existencias int unsigned CHECK (existencias >= 0),
  ruta_imagen varchar(1024),
  activo boolean,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  unique (descripcion),
  index ndx_descripcion (descripcion),
  foreign key fk_producto_categoria (id_categoria) references categoria(id_categoria))
  ENGINE = InnoDB;

-- Tabla de usuarios
CREATE TABLE usuario (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  username varchar(30) NOT NULL UNIQUE,
  password varchar(512) NOT NULL,
  nombre VARCHAR(20) NOT NULL,
  apellidos VARCHAR(30) NOT NULL,
  correo VARCHAR(75) NULL UNIQUE,
  telefono VARCHAR(25) NULL,
  ruta_imagen varchar(1024),
  activo boolean,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  CHECK (correo REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
  index ndx_username (username))
  ENGINE = InnoDB;

-- Tabla de facturas
create table factura (
  id_factura INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total decimal(12,2) check (total>0),
  estado ENUM('Activa', 'Pagada', 'Anulada') NOT NULL,
  -- Estado de entrega del pedido (HU-11 y HU-13)
  estado_pedido VARCHAR(20) NULL,
  -- Motivo cuando el administrador cancela el pedido (HU-13)
  motivo_cancelacion VARCHAR(255) NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_factura),
  index ndx_id_usuario (id_usuario),
  foreign key fk_factura_usuario (id_usuario) references usuario(id_usuario))
  ENGINE = InnoDB;

-- Tabla de ventas
create table venta (
  id_venta INT NOT NULL AUTO_INCREMENT,
  id_factura INT NOT NULL,
  id_producto INT NOT NULL,
  precio_historico decimal(12,2) check (precio_historico>= 0),
  cantidad int unsigned check (cantidad> 0),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_venta),
  index ndx_factura (id_factura),
  index ndx_producto (id_producto),
  UNIQUE (id_factura, id_producto),
  foreign key fk_venta_factura (id_factura) references factura(id_factura),
  foreign key fk_venta_producto (id_producto) references producto(id_producto))
  ENGINE = InnoDB;

-- Tabla de favoritos (HU-12): relación usuario <-> producto
create table favorito (
  id_favorito INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_producto INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_favorito),
  UNIQUE (id_usuario, id_producto),
  foreign key fk_favorito_usuario (id_usuario) references usuario(id_usuario),
  foreign key fk_favorito_producto (id_producto) references producto(id_producto))
  ENGINE = InnoDB;

-- Tabla de roles
create table rol (
  id_rol INT NOT NULL AUTO_INCREMENT,
  rol varchar(20) unique,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  primary key (id_rol))
  ENGINE = InnoDB;

-- Tabla de relación entre usuarios y roles
create table usuario_rol (
  id_usuario int not null,
  id_rol INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario,id_rol),
  foreign key fk_usuarioRol_usuario (id_usuario) references usuario(id_usuario),
  foreign key fk_usuarioRol_rol (id_rol) references rol(id_rol))
  ENGINE = InnoDB;

-- Tabla de rutas
CREATE TABLE ruta (
    id_ruta INT AUTO_INCREMENT NOT NULL,
    ruta VARCHAR(255) NOT NULL,
    id_rol INT NULL,
    requiere_rol boolean NOT NULL DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    check (id_rol IS NOT NULL OR requiere_rol = FALSE),
    PRIMARY KEY (id_ruta),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol))
    ENGINE = InnoDB;

-- Tabla de constantes de la aplicación
CREATE TABLE constante (
    id_constante INT AUTO_INCREMENT NOT NULL,
    atributo VARCHAR(25) NOT NULL,
    valor VARCHAR(150) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id_constante),
    UNIQUE (atributo))
    ENGINE = InnoDB;

-- Tabla de recuperar contraseña
CREATE TABLE solicitud_recuperacion (
  id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario   INT NOT NULL,
  token_hash   VARCHAR(255) NOT NULL,
  expira_en    DATETIME NOT NULL,
  usado        BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en    DATETIME NOT NULL,
  CONSTRAINT fk_solicitud_usuario FOREIGN KEY (id_usuario)
      REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- --- Sección de Inserción de Datos ---
-- Inserción de usuarios (claves: admin -> admin123 ; cliente -> cliente123)
INSERT INTO usuario (username,password,nombre, apellidos, correo, telefono,ruta_imagen,activo) VALUES
('admin','$2b$10$5T7xbK9a7i/vdgHMdSWhmeWWXjbIfoQxxqvSyq6XTqm1/by4XdA5S','Admin', 'Macrobiotica', 'admin@macrobiotica.local', '0000-0000', 'https://picsum.photos/seed/admin/200/200', true),
('cliente','$2b$10$uNyMkCXCz0aCWWbqSv7AreJ5iHxQ3dE4frnDwgBQ.6ganBqbKE4hO','Cliente', 'De Prueba', 'cliente@macrobiotica.local', '1111-1111', 'https://picsum.photos/seed/cliente/200/200', true);

-- Inserción de categorias
INSERT INTO categoria (descripcion,ruta_imagen,activo) VALUES
('Fermentados', 'https://picsum.photos/seed/fermentados/600/400', true),
('Aceites CBD', 'https://picsum.photos/seed/aceites/600/400', true),
('Superalimentos', 'https://picsum.photos/seed/superalimentos/600/400', true),
('Algas Marinas', 'https://picsum.photos/seed/algas/600/400', true),
('Cereales y Granos', 'https://picsum.photos/seed/cereales/600/400', true);

-- Inserción de productos
INSERT INTO producto (id_categoria,descripcion,detalle,precio,existencias,ruta_imagen,activo) VALUES
(1,'Miso de Cebada','Pasta de miso de cebada fermentada de forma tradicional. Presentación de 500 g.',8900,40,'https://picsum.photos/seed/miso/600/400',true),
(2,'Aceite CBD 15%','Aceite de CBD de espectro completo al 15%. Presentación de 30 ml.',35000,15,'https://picsum.photos/seed/cbd/600/400',true),
(3,'Matcha Ceremonial','Té verde matcha grado ceremonial. Presentación de 100 g.',18500,25,'https://picsum.photos/seed/matcha/600/400',true),
(4,'Wakame Orgánico','Alga wakame deshidratada orgánica. Presentación de 100 g.',6900,50,'https://picsum.photos/seed/wakame/600/400',true),
(5,'Sésamo Negro Orgánico','Semillas de sésamo negro orgánico. Presentación de 250 g.',4200,60,'https://picsum.photos/seed/sesamo/600/400',true),
(5,'Arroz Integral Orgánico','Arroz integral de grano largo orgánico. Presentación de 1 kg.',3500,80,'https://picsum.photos/seed/arroz/600/400',true);

-- Inserción de roles
insert into rol (rol) values ('ADMIN'), ('VENDEDOR'), ('USER');

-- Asignación de roles a usuarios (admin: todos; cliente: USER)
insert into usuario_rol (id_usuario, id_rol) values
 (1,1), (1,2), (1,3), (2,3);

-- Favoritos de ejemplo del cliente (id_usuario = 2) (HU-12)
insert into favorito (id_usuario, id_producto) values (2,1), (2,2);

-- Inserción de rutas con roles específicos
INSERT INTO ruta (ruta, id_rol) VALUES
('/producto/nuevo', 1),
('/producto/guardar', 1),
('/producto/modificar/**', 1),
('/producto/eliminar/**', 1),
('/categoria/nuevo', 1),
('/categoria/guardar', 1),
('/categoria/modificar/**', 1),
('/categoria/eliminar/**', 1),
('/producto/listado', 2),
('/categoria/listado', 2),
('/facturar/carrito', 3);

-- Inserción de rutas que no requieren rol
INSERT INTO ruta (ruta,requiere_rol) VALUES
('/',false),
('/index',false),
('/errores/**',false),
('/carrito/**',false),
('/registro/**',false),
('/login',false),
('/403',false),
('/fav/**',false),
('/js/**',false),
('/css/**',false),
('/webjars/**',false);

-- Inserción de constantes de la aplicación
INSERT INTO constante (atributo,valor) VALUES
('dominio','localhost'),
('servidor.http','http://localhost');
