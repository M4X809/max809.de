# Stage 1: Build the application
FROM oven/bun:latest AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package manifests
COPY package.json bun.lockb bunfig.toml ./
# check env
ARG NPM_FONT_AWESOME
RUN env

# Install dependencies
RUN bun install --no-save
# Copy the rest of the application code
COPY . .
ARG SKIP_ENV_VALIDATION
ARG NEXT_PUBLIC_POSTHOG_KEY NEXT_PUBLIC_POSTHOG_HOST

RUN env
# Build the Next.js application
RUN bun run build

# Stage 2: Run the application
FROM oven/bun:latest as runner

# Set the working directory inside the container
WORKDIR /app

# Copy only the built output from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Expose the port Next.js runs on
EXPOSE 3000

# Run the Next.js application
CMD ["bun", "run", "next", "start"]
