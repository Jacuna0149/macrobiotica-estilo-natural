# Macrobiótica Estilo Natural – Sitio Web Oficial

## Descripción
Sitio web desarrollado para Macrobiótica Estilo Natural, negocio costarricense dedicado a la venta de productos naturales, suplementos alimenticios y artículos de bienestar y cuidado personal.

El sitio permite a los clientes explorar el catálogo de productos organizado por categorías, registrarse e iniciar sesión, agregar productos al carrito y facturar su compra. Incluye además un módulo de administración de categorías y productos.

## Tecnologías
- **Java 21** con **Spring Boot** (Spring MVC, Spring Data JPA)
- **Thymeleaf** + **Bootstrap 5** (webjars) para las vistas
- **MySQL** como base de datos
- **Maven** como gestor de dependencias
- Contraseñas con hash **BCrypt**; imágenes vía **Firebase Storage**
- Internacionalización (Español / English)

## Requisitos previos
- [JDK 21](https://adoptium.net/) (Eclipse Temurin recomendado)
- [Apache Maven](https://maven.apache.org/) 3.9+
- [MySQL Server](https://dev.mysql.com/downloads/) 8.x (con MySQL Workbench opcional)
- Git y opcionalmente Apache NetBeans

## Estructura del proyecto
```
macrobiotica-estilo-natural/
├── pom.xml                          # proyecto Maven (Spring Boot)
└── src/main/
    ├── java/com/tienda/
    │   ├── controller/              # controladores MVC (index, categoría, producto, carrito, login, registro)
    │   ├── domain/                  # entidades JPA (Categoria, Producto, Usuario, Rol, Factura, Venta)
    │   ├── repository/              # repositorios Spring Data JPA
    │   └── service/                 # servicios de negocio (@Transactional)
    └── resources/
        ├── application.properties   # configuración (BD, puerto, firebase)
        ├── creaTablas.sql           # script de creación de la BD y datos de ejemplo
        ├── messages*.properties     # textos i18n (es/en)
        ├── static/                  # css, js, favicons
        └── templates/               # vistas Thymeleaf
```

## Puesta en marcha (local)

### 1. Clonar y actualizar
```bash
git clone https://github.com/Jacuna0149/macrobiotica-estilo-natural.git
cd macrobiotica-estilo-natural
git checkout develop && git pull
```

### 2. Crear la base de datos
Ejecuta el script [src/main/resources/creaTablas.sql](src/main/resources/creaTablas.sql) en tu MySQL local
(desde MySQL Workbench, o por consola):
```bash
mysql -u root -p < src/main/resources/creaTablas.sql
```
El script crea la base `macrobiotica`, el usuario `usuario_prueba` (que usa la aplicación),
las tablas y los datos de ejemplo.

### 3. Credenciales de Firebase (opcional)
El archivo de credenciales de Firebase (`src/main/resources/firebase/*.json`) **no se versiona**
porque contiene una clave privada (GitHub bloquea el push). Pídelo al equipo y colócalo en esa
carpeta si necesitas la subida de imágenes desde el módulo de administración. Sin el archivo,
la aplicación funciona igual (solo se deshabilita la subida de imágenes).

### 4. Ejecutar la aplicación
```bash
mvn spring-boot:run
```
O desde NetBeans: abrir el proyecto y ejecutar (Run).

La aplicación queda disponible en **http://localhost** (puerto 80).

## Usuarios de prueba
| Usuario  | Contraseña   | Rol   |
|----------|--------------|-------|
| `admin`  | `admin123`   | ADMIN (gestión de categorías y productos) |
| `cliente`| `cliente123` | USER  |

## Funcionalidad
- **Catálogo** con filtro por categorías (página principal).
- **Registro e inicio de sesión** de usuarios (BCrypt + roles).
- **Carrito de compras** en sesión: agregar, cambiar cantidades, eliminar.
- **Facturación** del carrito (tablas `factura` y `venta`, descuento de existencias). Pago simulado.
- **Administración** (rol ADMIN): CRUD de categorías y productos.

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
