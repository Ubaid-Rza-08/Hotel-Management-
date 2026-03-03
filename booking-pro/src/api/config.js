// ─────────────────────────────────────────────────────────────
//  API BASE URLS
//  Vite exposes only variables prefixed with VITE_
//  Local:  values come from .env.local  (not committed to git)
//  Docker: values are baked in at build time via --build-arg
// ─────────────────────────────────────────────────────────────
export const AUTH_API    = import.meta.env.VITE_AUTH_API    || 'http://localhost:8080/api/v1';
export const HOTEL_API   = import.meta.env.VITE_HOTEL_API   || 'http://localhost:8082/api/hotels';
export const ROOM_API    = import.meta.env.VITE_ROOM_API    || 'http://localhost:8083/api/rooms';
export const BOOKING_API = import.meta.env.VITE_BOOKING_API || 'http://localhost:8084/api/bookings';
export const PAYMENT_API = import.meta.env.VITE_PAYMENT_API || 'http://localhost:8085/api/payments';