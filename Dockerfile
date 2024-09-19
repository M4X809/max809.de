# Stage 1: Install dependencies with bun
FROM oven/bun:latest AS deps

# Set the working directory inside the container
WORKDIR /app

# Copy package manifests
COPY package.json bun.lockb bunfig.toml next.config.js ./src/env.js package-lock.json ./

# Install dependencies with bun
RUN bun install --no-save

# Stage 2: Build with node/npm
FROM node:21 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the dependency layer from the bun stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/bun.lockb ./bun.lockb
COPY --from=deps /app/bunfig.toml ./bunfig.toml
COPY --from=deps /app/next.config.js ./next.config.js
COPY --from=deps /app/src/env.js ./src/env.js
COPY --from=deps /app/package-lock.json ./package-lock.json

# Copy the rest of the application code
COPY . .

# Set build environment variables
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG DISCORD_CLIENT_ID
ARG DISCORD_CLIENT_SECRET
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG DATABASE_URL

RUN echo 'NEXT_PUBLIC_POSTHOG_KEY='$NEXT_PUBLIC_POSTHOG_KEY >> .env && \
    echo 'NEXT_PUBLIC_POSTHOG_HOST='$NEXT_PUBLIC_POSTHOG_HOST >> .env && \
    echo 'NEXTAUTH_URL='$NEXTAUTH_URL >> .env && \
    echo 'NEXTAUTH_SECRET='$NEXTAUTH_SECRET >> .env && \
    echo 'DISCORD_CLIENT_ID='$DISCORD_CLIENT_ID >> .env && \
    echo 'DISCORD_CLIENT_SECRET='$DISCORD_CLIENT_SECRET >> .env && \
    echo 'GITHUB_CLIENT_ID='$GITHUB_CLIENT_ID >> .env && \
    echo 'GITHUB_CLIENT_SECRET='$GITHUB_CLIENT_SECRET >> .env && \
    echo 'DATABASE_URL='$DATABASE_URL >> .env

# Build the Next.js application using npm
RUN npm run build

# Check the build output
RUN ls -la .next

# Stage 3: Run the application with node/npm
FROM node:21 AS runner

# Set the working directory inside the container
WORKDIR /app

# Copy the built output and other necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/env.js ./src/env.js
COPY --from=builder /app/next.config.js ./next.config.js

# Expose the port Next.js runs on
EXPOSE 3000

# Run the Next.js application using npm
CMD ["npm", "run", "next", "start"]
