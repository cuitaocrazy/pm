FROM node:alpine

RUN apk add --no-cache tzdata
RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm i --production

COPY ./dist /app
ENV TZ=Asia/Shanghai

CMD ["node", "index.js"]
