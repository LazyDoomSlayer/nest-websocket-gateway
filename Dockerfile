FROM node:18-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]


