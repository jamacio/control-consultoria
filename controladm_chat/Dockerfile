# Só o Node e as dependências do servidor (express, express-session, node-html-parser).
# O Tailwind não entra: o site.css já vem pronto em public/ (npm run build:css, fora do container).
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY . .

USER node
EXPOSE 4000
CMD ["node", "server.js"]
