FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_AUTH_API_URL=http://localhost:7000
ARG VITE_WORKOUT_API_URL=http://localhost:7000
ARG VITE_SIGNALR_CHAT_URL=http://localhost:7000/hubs/chat
ARG VITE_PROGRESS_API_URL=http://localhost:7000

ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL
ENV VITE_WORKOUT_API_URL=$VITE_WORKOUT_API_URL
ENV VITE_SIGNALR_CHAT_URL=$VITE_SIGNALR_CHAT_URL
ENV VITE_PROGRESS_API_URL=$VITE_PROGRESS_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:docker

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
