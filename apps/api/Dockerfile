FROM node:22-alpine AS dependencies
WORKDIR /app
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile=false

FROM dependencies AS build
RUN pnpm --filter @digital-marketing-hub/api prisma:generate
RUN pnpm --filter @digital-marketing-hub/api build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN corepack enable
ENV NODE_ENV=production
RUN addgroup -S api && adduser -S api -G api
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/package.json apps/api/package.json
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
RUN mkdir -p /app/apps/api/uploads && chown -R api:api /app
USER api
WORKDIR /app/apps/api
CMD ["pnpm", "start"]
