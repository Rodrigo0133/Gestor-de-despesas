FROM node:24.16.0

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY /src/server /src/server

EXPOSE 3000

CMD ["npm"."run"]
