FROM archlinux:latest

COPY --from=denoland/deno:bin-2.6.9 /deno /usr/local/bin/deno

WORKDIR /app

COPY . .

RUN deno cache src/index.ts

RUN pacman -Sy yt-dlp yt-dlp-ejs ffmpeg --noconfirm
RUN deno install

CMD [ "deno", "run", "-A", "src/index.ts" ]
