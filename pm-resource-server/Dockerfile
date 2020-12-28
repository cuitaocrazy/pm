FROM node:alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm i --production

COPY ./dist /app

CMD ["node", "server.js"]

EXPOSE 3000