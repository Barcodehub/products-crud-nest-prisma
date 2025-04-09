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
```

## Estructura del Proyecto

```bash
src/
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
POST /products - Crear producto

GET /products - Obtener todos los productos

GET /products/:id - Obtener un producto por ID

PUT /products/:id - Actualizar un producto

DELETE /products/:id - Eliminar un producto
```

## Ejecutar el Proyecto
```
npm run start:dev
```#   p r o d u c t s - c r u d - n e s t - p r i s m a  
 