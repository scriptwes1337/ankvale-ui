# Website deployment

The public website is hosted by Coolify at `https://ui.ankvale.com`, with DNS and proxying managed by Cloudflare. This deployment is independent of npm publication.

Verified 27 November 2026: the first production image built from commit `dd77ce8` is running healthy. All eight routes listed below returned HTTP 200 over public HTTPS. Browser review confirmed homepage styles and the interactive workspace's list view. Cloudflare's existing zone SSL mode is Full; it was not changed during this deployment.

## Coolify configuration

- Project: Ankvale UI; environment: production.
- Application: Ankvale UI Website.
- Repository: `https://github.com/scriptwes1337/ankvale-ui`, branch `main`.
- Build pack: Dockerfile; base directory: `/`; Dockerfile location: `/Dockerfile`.
- Domain: `https://ui.ankvale.com`; exposed container port: `3000`; no host port mapping required.
- The Node process listens on `0.0.0.0:3000`. The image health check requests `/llms.txt`.

The root Dockerfile installs the locked monorepo dependencies, generates registries/API/docs/skills through the web prebuild, and builds Next.js standalone output. The runtime image contains the traced server, static assets and public downloads, and runs as the unprivileged Node user. The root `.dockerignore` excludes credentials, local dependency/build directories, Git history and unpublished npm candidates.

Cloudflare's proxied `ui` A record targets the existing Coolify host. TLS terminates at Cloudflare and Coolify's HTTPS proxy. Do not weaken TLS settings to work around certificate errors; changing zone-wide TLS settings can affect other Ankvale websites.

## Deploy and verify

Push the reviewed website changes to GitHub, then use Deploy in this application's Coolify dashboard. A public Git source does not by itself establish a push webhook; verify a webhook separately before assuming automatic deployment.

Check Coolify build logs and container health, then verify `/`, `/playground`, `/docs`, `/icons`, `/llms.txt`, `/r/ankvale-ui.json`, `/api/components/button.json` and `/downloads/ankvale-documentation.zip` over the public HTTPS domain. Confirm styling and interactions in a browser. Rollbacks use the application's previous successful image in Coolify.

No application secrets are required for the public showcase. Production studio operations remain disabled unless the existing explicit token contract is configured. Never place npm credentials or Cloudflare tokens in the image or repository.
