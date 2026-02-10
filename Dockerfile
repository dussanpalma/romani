# Etapa 1: Construcción de la aplicación Angular
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig*.json ./
COPY angular.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY src ./src
COPY public ./public

# Construir la aplicación para producción
RUN npm run build -- --configuration production

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados de Angular
COPY --from=builder /app/dist/estudiantes-app/browser /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
