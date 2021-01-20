FROM node:alpine

ENV BASE_URL="https://get.helm.sh"
ENV TAR_FILE="helm-v3.5.0-linux-amd64.tar.gz"

WORKDIR /apps
ADD package.json package.json
RUN apk --update --no-cache add git less openssh \
    curl ca-certificates && \
    curl -L ${BASE_URL}/${TAR_FILE} |tar xvz && \
    mv linux-amd64/helm /usr/bin/helm && \
    chmod +x /usr/bin/helm && \
    rm -rf linux-amd64 && \
    apk del curl && \
    rm -f /var/cache/apk/* && \
    npm i --production

ADD upgrade.sh upgrade.sh
ADD server.js server.js
ENTRYPOINT [ "node", "server.js" ]