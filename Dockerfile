FROM node:20 as base

# Add package file
COPY package.json ./

# Install deps
RUN npm i --legacy-peer-deps

# environment variables
ENV NODE_ENV=production
ENV APP_PORT=3000 
ENV JWT_EXPIRES_IN=1d
ENV JWT_SECRET=MIICXQIBAAKBgQCGXBW1ovoR+/q5vjmVGN+ye3HBoLV18h3i+munqxuDSiMLJT5j7BRW6T8mAsjjqhppZXu5wZi/1TU0q4dFiRxiDPLrCji/M/jHDhf05uQP/2ThVnZG

# Copy source
COPY . .

EXPOSE 3000

# Build dist
CMD ["npm", "run", "dev"]