FROM node:18-alpine

ARG N8N_VERSION=1.56.1

RUN apk add --update graphicsmagick tzdata

USER root

RUN apk --update add --virtual build-dependencies python3 build-base && \
    npm_config_user=root npm install --location=global n8n@${N8N_VERSION} && \
    apk del build-dependencies

WORKDIR /data

EXPOSE 5678

ENV N8N_USER_ID=root

# Only switch to node user after all installs are done
USER node

CMD ["n8n", "start"]