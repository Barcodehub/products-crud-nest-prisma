# NestJS + Prisma + PostgreSQL CRUD API

Este proyecto es un sistema de ordenes de compra de productos construido con NestJS, Prisma como ORM y PostgreSQL como base de datos. Sigue buenas prácticas de estructuración y modularidad, JWT, historial de cambios para auditorial y resolucion de problemas con posibilidad de reversion a un estado anterior.

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
MERCADO_PAGO_API=https://api.mercadopago.com
MERCADO_PAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN
MERCADO_PAGO_PUBLIC_KEY=TU_PUBLIC_KEY
```

## Estructura del Proyecto


```bash
src/
├── auth/                      # Modulo Auth
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
│       └── request-with-user.interface.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── mercado_pago/                     # Nuevo módulo de mercado pago
│   ├── models/
│   │   ├── interfaces...
│   │   └── ...
│   ├── mercado_pago.controller.ts
│   ├── mercado_pago.service.ts
│   ├── mercado_pago.module.ts
├── orders/                     #  módulo de órdenes
│   ├── dto/
│   │   ├── create-order.dto.ts
│   │   └── update-order.dto.ts
│   ├── entities/
│   │   └── order.entity.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   └── orders.module.ts
│   ├── shared/
│    ├── enums/
│      └── order-status.enum.ts
├── product-history/            # Módulo del historial de cambios
│   ├── dto/
│   │   └── revert-history.dto.ts
│   ├── entities/
│   │   └── product-history.entity.ts
│   ├── product-history.controller.ts
│   ├── product-history.service.ts
│   └── product-history.module.ts
├── products/                   # Gestion de productos
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   └── update-product.dto.ts
│   ├── entities/
│   │   └── product.entity.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   └── products.module.ts
├── websockets/                 # Módulo para comunicación en tiempo real
│      └── websockets.gateway.ts    
│      └── websockets.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
└── main.ts
```


## Endpoints Disponibles

```http
Token Authorization: Bearer <Token> 
```

```http
POST /auth/register - Registro de usuario
Body: { "email": "user@example.com", "password": "123456", "roleId?": 1 }

POST /auth/login - Inicio de sesión (devuelve JWT)
Body: { "email": "user@example.com", "password": "123456" }
```

```http
POST /products - Crear producto
Body: {"name": "Teclado Mecánico", "description": "RGB Switch Red", "price": 99.99}

GET /products - Obtener todos los productos

GET /products/:id - Obtener un producto por ID

PUT /products/:id - Actualizar un producto

PATCH /products/:id/stock - Actualizar stock (real-time websockets)
Body: { "change": number }  # Positivo para incrementar, negativo para decrementar

DELETE /products/:id - Eliminar un producto
```

```http
GET /products/history/all     - Obtener historial de cambios

GET /products/:id/history       - Obtener historial de cambios de un producto especifico

POST /products/revert/{historyId} - Revertir a una versión anterior
```

```http
POST /orders	       - Crear nueva orden
Body: {"productId": 123, "amount": 99.99 }

GET	/orders	           - Obtener todas las órdenes del usuario

GET	/orders/:id	       - Obtener una orden específica

PATCH	/orders/:id	   - Actualizar una orden
Body: { "status": "completed", "paymentId": "mp_123456789" }

DELETE	/orders/:id	   - Eliminar una orden

```

```http
GET /mercadopago/identification_types - Obtener tipos de identificación válidos
GET /mercadopago/installments/{first_six_digits}/{amount} - Obtener planes de cuotas
POST /mercadopago/card_token - Generar token de tarjeta
POST /mercadopago/payments - Procesar pago
POST /mercadopago/webhook - Webhook para notificaciones de pago

```

## Ejecutar el Proyecto
```
npm run start:seed
npm run start:dev
```