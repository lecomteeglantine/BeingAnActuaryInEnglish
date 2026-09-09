# EnglishForPublicHealth · Group Activity V24

Deployment-ready full replacement build for GitHub Pages.

## What V24 changes
- Keeps Session 1 ruleset **S1-R10** and all existing deterministic scoring.
- Keeps the three illustrated Flash Missions and the progressive Pitch Builder.
- Keeps the final pitch at **2:00 total for the whole group**.
- Keeps Sessions 2–7 unchanged in content/gameplay.
- Hardens deployment caching: every CSS/JS reference uses the same V24 cache-buster.
- Registers the service worker with a V24 URL and `updateViaCache: none`, then explicitly requests an update.
- Uses a new V24 cache and removes older caches on activation.

## Upload
Upload all files from the root of this ZIP to the repository root and replace existing files. Do not upload an enclosing folder.
