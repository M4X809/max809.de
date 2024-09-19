# Stage 1: Build the application
FROM node:21 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package manifests
COPY package.json bun.lockb bunfig.toml next.config.js src/env.js package-lock.json ./
# check env
ARG NPM_FONT_AWESOME
RUN env

# Install dependencies
RUN npm install --no-save
# Copy the rest of the application code
COPY . .

ARG SKIP_ENV_VALIDATION

ARG NEXT_PUBLIC_POSTHOG_KEY
RUN echo 'NEXT_PUBLIC_POSTHOG_KEY='$NEXT_PUBLIC_POSTHOG_KEY >> .env 
ARG NEXT_PUBLIC_POSTHOG_HOST
RUN echo 'NEXT_PUBLIC_POSTHOG_HOST='$NEXT_PUBLIC_POSTHOG_HOST >> .env 
ARG NEXTAUTH_URL
RUN echo 'NEXTAUTH_URL='$NEXTAUTH_URL >> .env
ARG NEXTAUTH_SECRET
RUN echo 'NEXTAUTH_SECRET='$NEXTAUTH_SECRET >> .env
ARG DISCORD_CLIENT_ID
RUN echo 'DISCORD_CLIENT_ID='$DISCORD_CLIENT_ID >> .env
ARG DISCORD_CLIENT_SECRET
RUN echo 'DISCORD_CLIENT_SECRET='$DISCORD_CLIENT_SECRET >> .env
ARG GITHUB_CLIENT_ID
RUN echo 'GITHUB_CLIENT_ID='$GITHUB_CLIENT_ID >> .env
ARG GITHUB_CLIENT_SECRET
RUN echo 'GITHUB_CLIENT_SECRET='$GITHUB_CLIENT_SECRET >> .env
ARG DATABASE_URL 
RUN echo 'DATABASE_URL='$DATABASE_URL >> .env

RUN env
# Build the Next.js application
RUN npm run build

# Stage 2: Run the application
FROM node:21 as runner

# Set the working directory inside the container
WORKDIR /app

# Copy only the built output from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src/env.js ./src/env.js
COPY --from=builder /app/next.config.js ./next.config.js

# Expose the port Next.js runs on
EXPOSE 3000

# Run the Next.js application
CMD ["npm", "run", "next", "start"]
