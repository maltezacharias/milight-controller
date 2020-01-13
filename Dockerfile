FROM node:lts

COPY app /app
WORKDIR /app
RUN npm install

ENV DEBUG=milight-controller:server
CMD node bin/www
EXPOSE 3000

