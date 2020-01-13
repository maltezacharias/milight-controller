FROM node:lts
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

ENV DEBUG=milight-controller:server
CMD node bin/www
EXPOSE 3000

