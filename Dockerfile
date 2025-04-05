FROM denoland/deno:latest

WORKDIR /app

COPY . .

RUN deno cache src/index.ts

CMD [ "deno", "run", "-A", "index.ts" ]