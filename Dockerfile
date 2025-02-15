FROM node:18-alpine

RUN npm install -g pnpm @nestjs/cli

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY . .

RUN nest build

EXPOSE 3000

CMD ["node", "dist/main.js"]
