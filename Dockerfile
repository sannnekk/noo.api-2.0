FROM node:18 as base

# Add package file
COPY package*.json ./

# Install deps
RUN npm i --legacy-peer-deps
RUN npm i -g typescript
RUN npm i -g ts-node

# environment variables
ENV NODE_ENV=production
ENV APP_PORT=3000

# Copy source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]