FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 4000
# نفّذ التهجير ثم ابدأ الخادم
CMD ["sh", "-c", "node src/migrate.js && node src/server.js"]