# 📦 Teslo Shop – Fullstack Ecommerce (Angular + NestJS)

Aplicación fullstack de tipo ecommerce desarrollada con **Angular (frontend)** y **NestJS (backend)**. El proyecto simula una tienda online real con panel de administración, sistema de autenticación, carrito de compra y arquitectura modular escalable.

---

## 🚀 Demo

- 🌐 Frontend: https://tesloshop-front-angular.netlify.app/#/
- 🔗 Backend API: https://nest-teslo-shop-complete-dzzh.onrender.com/api

---

# 🧱 Arquitectura del proyecto

El sistema está dividido en dos grandes partes:

## 🛒 Store Front (Usuario final)

Aplicación pública donde los usuarios pueden:

- Navegar productos
- Ver detalles de productos
- Usar el carrito de compra
- Registrarse e iniciar sesión
- Acceder a una experiencia de tienda completa

## 🛠 Admin Dashboard (Backoffice)

Panel de administración para gestión del sistema:

- CRUD de productos
- Vista en tabla de productos
- Detalles y edición de productos
- Gestión de inventario

---

# 🔐 Sistema de autenticación

El proyecto incluye un sistema completo de autenticación basado en JWT:

### Funcionalidades

- Registro de usuarios
- Login de usuarios
- Protección de rutas (Guards)
- Interceptor HTTP para token automático
- Logout y gestión de sesión

### Arquitectura

- `AuthService` → lógica central de autenticación
- `AuthGuard` → protección de rutas privadas
- `AuthInterceptor` → inyección automática del JWT

---

# 🧠 Arquitectura frontend

El frontend está estructurado de forma modular y escalable:

src/app/
│
├── store-front/        # Tienda pública
├── admin-dashboard/    # Panel administrativo
├── auth/               # Autenticación
├── shared/             # Componentes reutilizables
├── products/           # Lógica de productos
├── utils/              # Utilidades globales

---

# 🧩 Componentes principales

## 🛒 Store Front

- Navbar principal (`front-navbar`)
- Catálogo de productos
- Carrusel de productos destacados
- Página de detalle de producto

## 🛠 Admin Dashboard

- Tabla de productos (gestión CRUD)
- Página de detalle de producto
- Formularios de edición

## 🔁 Shared Components

- Form error label (validaciones reutilizables)
- Pagination component + service
- Interceptors HTTP

---

# 🔌 Comunicación con API

La comunicación con el backend se realiza mediante servicios Angular:

### ProductsService

- Obtener productos
- Obtener producto por ID
- Operaciones CRUD

### AuthService

- Login
- Registro
- Gestión de token JWT

---

# ⚙️ Interceptors

El proyecto utiliza interceptores HTTP para mejorar la arquitectura:

### Auth Interceptor

- Añade automáticamente el token JWT a las peticiones

### Logging Interceptor

- Permite depuración de peticiones HTTP

---

# 📄 Paginación

Sistema reutilizable de paginación dividido en:

- PaginationService → lógica de estado
- PaginationComponent → interfaz de usuario

---

# 🧾 Formularios

Se utiliza **Reactive Forms** con utilidades centralizadas:

- form-utils.ts → validaciones reutilizables
- form-error-label → mensajes de error consistentes

---

# 🎨 UI / Diseño

- Tipografía global: Montserrat
- Estilos centralizados en styles.css
- Assets organizados en /assets
- Diseño consistente entre store y admin

---

# 🧭 Routing

La aplicación utiliza Angular Router con estructura modular:

- Rutas públicas (store-front)
- Rutas privadas (admin)
- Rutas protegidas mediante guards

---

# 🔐 Seguridad

- JWT authentication
- Route guards
- HTTP interceptors
- Control de acceso por sesión

---

# 🧪 Tecnologías usadas

### Frontend
- Angular
- TypeScript
- RxJS
- Angular Router
- Reactive Forms

### Backend
- NestJS
- TypeORM
- PostgreSQL
- JWT Authentication

---

# 📦 Features principales

✔ Ecommerce completo  
✔ Panel de administración  
✔ Autenticación JWT  
✔ Carrito de compra  
✔ Arquitectura modular  
✔ Componentes reutilizables  
✔ Interceptores HTTP  
✔ Paginación reutilizable  
✔ Diseño responsive  

---

# 🧠 Qué demuestra este proyecto

Este proyecto refleja:

- Arquitectura frontend profesional en Angular
- Separación por dominios (store/admin/auth)
- Integración fullstack real
- Uso de patrones escalables
- Nivel de aplicación real de producción (junior sólido)

---

# 🚀 Posibles mejoras futuras

- Tests unitarios (Jest / Karma)
- Lazy loading optimizado
- Internacionalización (i18n)
- Optimización de performance
- SSR con Angular Universal

---

# 👤 Autor

Laura Toro

- GitHub: https://github.com/LauraToro-android

---

# 🏁 Conclusión

Este proyecto simula un ecommerce real completo con arquitectura fullstack moderna, separando claramente:

- usuario final (store-front)
- administración (admin dashboard)
- autenticación y seguridad
- servicios reutilizables
