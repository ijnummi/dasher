FROM node:20-alpine AS builder

WORKDIR /app

# Copy the whole repo so vite.config.ts can read sibling package files
COPY . .

WORKDIR /app/frontend/admin
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/frontend/admin/dist /usr/share/nginx/html
COPY frontend/admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
