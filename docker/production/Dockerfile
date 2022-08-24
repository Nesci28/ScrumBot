FROM node:16-buster-slim as build
RUN apt-get update \
  && apt-get -y install python3 make gcc g++ \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g npm@latest
WORKDIR /app

# Copy tsconfig
COPY ./tsconfig.json ./
COPY ./tsconfig.build.json ./
# Preinstall dependencies
COPY ./.npmrc ./
COPY ./package.json ./
COPY ./package-lock.json ./
RUN npm ci --omit=dev
# Copy app sources
COPY ./src ./src

# Serve definitions files and build
RUN npm run build
RUN npm prune --production --force && rm -rf ./src

FROM node:16-buster-slim as runtime-dependencies
WORKDIR /app
RUN npm install -g pm2@latest
CMD [ "pm2-runtime", "node", "--", "./main.js" ]

FROM runtime-dependencies as runtime
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist .
COPY --from=build /app/package.json .
COPY --from=build /app/healthcheck_version ./
USER node:node