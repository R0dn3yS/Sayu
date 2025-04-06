FROM archlinux:latest

COPY --from=denoland/deno:bin-2.2.8 /deno /usr/local/bin/deno

WORKDIR /app

COPY . .

RUN deno cache src/index.ts

RUN pacman -Sy yt-dlp ffmpeg --noconfirm
RUN deno install
RUN deno task start
