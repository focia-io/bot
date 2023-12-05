# Builder
FROM node:21 as builder

WORKDIR /monorepo
COPY . .

# Installer
FROM node:21 as installer
WORKDIR /monorepo

RUN npm install -g pnpm
RUN npm install -g bun

COPY --from=builder /monorepo/ .
RUN pnpm install
RUN pnpm build --filter=./apps/bot

# Runner
FROM oven/bun:alpine as runner
WORKDIR /monorepo

USER bun
COPY --from=installer /monorepo/apps/bot/dist/index.js .
CMD ["bun", "run", "index.js"]