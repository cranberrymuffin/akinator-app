FROM node:latest
WORKDIR /code

# start with dependencies to enjoy caching
COPY ./package.json /code/package.json
COPY ./package-lock.json /code/package-lock.json
RUN npm ci

# copy rest and build
COPY . /code/.

ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build
CMD ["node", "server.js"]
