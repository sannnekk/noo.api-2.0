FROM node:latest as base

RUN mkdir noo-cdn
RUN mkdir noo-cdn/uploads

# Add package file
COPY package*.json ./

# Install deps
RUN npm i --legacy-peer-deps

# environment variables
ENV NODE_ENV=production
ENV APP_PORT=3000

# Copy source
COPY /dist /dist

EXPOSE 465
EXPOSE 3000

CMD ["node", "dist/main.js"]