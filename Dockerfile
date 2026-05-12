FROM node:20-bookworm AS base
WORKDIR /app
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./

FROM base AS dependencies
RUN npm ci
RUN npm ls --all

FROM dependencies AS lint
COPY . .
RUN node lint.js

FROM dependencies AS typecheck
COPY . .
RUN node typecheck.js

FROM dependencies AS build
COPY . .
RUN npm run build

FROM build AS test
RUN node validate.js

FROM build AS analyze
RUN node analyze.js

FROM node:20-slim AS production-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM nginx:alpine AS production
COPY --from=build /app/dist/index.html /usr/share/nginx/html/index.html
COPY --from=analyze /app/dist/build-manifest.json /usr/share/nginx/html/build-manifest.json
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
