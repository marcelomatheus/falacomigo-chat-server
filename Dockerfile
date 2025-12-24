FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
ENV NODE_ENV=production

RUN npm ci

COPY . .

RUN --mount=type=secret,id=env_file,target=.env \
    npm run build

EXPOSE 8080:8080

CMD [ "npm", "run", "start" ]

