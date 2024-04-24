FROM node:20-alpine as build

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . /app

RUN yarn install
RUN yarn build

EXPOSE 4000
ENV FILES_ROOT=/files
CMD ["yarn", "start:prod"]
