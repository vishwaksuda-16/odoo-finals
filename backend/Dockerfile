FROM node:20

WORKDIR /app

# Copy only package files first to speed up builds
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Generate Prisma client inside the container
RUN npx prisma generate --schema=src/prisma/schema.prisma

EXPOSE 5000

CMD ["npm", "run", "dev"]