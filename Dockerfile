FROM node:12

WORKDIR /usr/src/app

COPY . .
RUN npm i

EXPOSE 3000
CMD [ "node", "index.js" ]
