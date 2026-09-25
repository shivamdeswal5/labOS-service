ARG NODE_IMAGE=node:22-alpine

FROM $NODE_IMAGE AS base
WORKDIR /app
RUN apk --no-cache add dumb-init
RUN mkdir -p /app && chown node:node /app
USER node

# Build stage
FROM base AS build
WORKDIR /app
COPY --chown=node:node ./package*.json ./
COPY --chown=node:node . .
RUN npm ci && npm cache clean --force
RUN npm run build && npm prune --production

# Production stage
FROM base AS production
WORKDIR /app
ENV PORT=8080
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node . .
EXPOSE $PORT
CMD ["dumb-init", "node", "dist/main"]
