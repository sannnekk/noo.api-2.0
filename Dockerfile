FROM node:20 as base

# Add package file
COPY package.json ./

# Install deps
RUN npm i --legacy-peer-deps

# environment variables
ENV NODE_ENV=production
ENV APP_PORT=3000

# Copy source
COPY . .

EXPOSE 3000

RUN npm run start