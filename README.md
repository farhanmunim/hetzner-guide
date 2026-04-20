# Hetzner Guide

A complete, beginner-friendly guide to Hetzner Cloud hosting — server setup, Cloudflare DNS, NGINX virtual hosts, SSL, WordPress, and multi-site configurations.

Live at [hetzner-guide.farhan.app](https://hetzner-guide.farhan.app).

## Stack

- Vanilla HTML, CSS, and JS — no bundler
- Single-page static site (`index.html`)
- Puppeteer for local screenshot checks

## Local Dev

Open `index.html` directly in a browser, or serve with any static file server.

```bash
npm install
node screenshot.js   # generates responsive screenshots in /screenshots
```

## Deployment

Deployed as a static site via Cloudflare Pages at `hetzner-guide.farhan.app`.

## Project Structure

- `index.html` — the full guide (styles + content + scripts inline)
- `screenshot.js` — Puppeteer diagnostic for responsive layout

## Author

Built by [Farhan](https://farhan.app).
