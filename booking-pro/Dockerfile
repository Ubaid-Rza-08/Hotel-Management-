# Stage 1: Build React app
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_AUTH_API
ARG VITE_HOTEL_API
ARG VITE_ROOM_API
ARG VITE_BOOKING_API
ARG VITE_PAYMENT_API

ENV VITE_AUTH_API=$VITE_AUTH_API
ENV VITE_HOTEL_API=$VITE_HOTEL_API
ENV VITE_ROOM_API=$VITE_ROOM_API
ENV VITE_BOOKING_API=$VITE_BOOKING_API
ENV VITE_PAYMENT_API=$VITE_PAYMENT_API

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY --from=build /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]