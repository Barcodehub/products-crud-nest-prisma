export const MERCADO_PAGO_CONFIG = {
  API_URL: process.env.MERCADO_PAGO_API,
  ACCESS_TOKEN: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  PUBLIC_KEY: process.env.MERCADO_PAGO_PUBLIC_KEY,
  HEADERS: {
    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
};

// export const MERCADO_PAGO_API = 'https://api.mercadopago.com/v1';
// export const MERCADO_PAGO_HEADERS = {
//   Authorization:
//     'Bearer TEST-1957784113747584-030210-b9271e7708744d647b9d05e1e00eae8e-191014229',
//   'Content-Type': 'application/json',
// };
// export const API = '192.168.1.10';
