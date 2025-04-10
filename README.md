# NestJS + Prisma + PostgreSQL CRUD API

Este proyecto es un CRUD de productos construido con NestJS, Prisma como ORM y PostgreSQL como base de datos. Sigue buenas prácticas de estructuración y modularidad.

## Requisitos Previos

- Node.js (v16 o superior)
- PostgreSQL instalado y corriendo
- npm

## Configuración Inicial

Instalar dependencias:
```bash
npm install
```

## Configurar la base de datos:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Crear un archivo .env en la raíz del proyecto con:
```bash
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nest_prisma_db?schema=public"
JWT_SECRET="tu_clave_secreta_jwt"
```

## Estructura del Proyecto

```bash
src/
├── auth/                       # Nuevo módulo de autenticación
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── interfaces/
│   │   └── jwt-payload.interface.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── products/
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   ├── entities/
│   │   └── product.entity.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── schema.prisma
└── main.ts
```


## Endpoints Disponibles

```http

POST /auth/register - Registro de usuario
Body: { "email": "user@example.com", "password": "123456", "roleId?": 1 }

POST /auth/login - Inicio de sesión (devuelve JWT)
Body: { "email": "user@example.com", "password": "123456" }

POST /products - Crear producto
Body: {"name": "Teclado Mecánico", "description": "RGB Switch Red", "price": 99.99}

GET /products - Obtener todos los productos

GET /products/:id - Obtener un producto por ID

PUT /products/:id - Actualizar un producto

DELETE /products/:id - Eliminar un producto

```

## Ejecutar el Proyecto
```
npm run start:seed
npm run start:dev
```