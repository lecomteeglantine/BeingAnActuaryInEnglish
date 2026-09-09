# V24 audit · Group Activity

Audit performed after the V23 deployment pass.

## Functional checks
- Session 1: 6 decisions completed end-to-end.
- Session 1: Flash Missions after Decisions 1, 3 and 5 tested, including wrong answer → retry → correct answer.
- Session 1 final hard-stop timer: start / pause / reset tested.
- Determinism check: two independent runs with decision code `C-B-B-E-C-D` returned identical final scores: Access 100, Equity 100, Innovation 64, Sustainability 39.
- Sessions 2–7: all completed end-to-end through their final briefing using their shared deterministic engine.
- Session 2: 6 decisions. Sessions 3–7: 4 decisions each.
- Sessions 2–7 final timer controls wired and tested.
- JavaScript runtime test: no page exceptions or console errors in the injected Chromium harness.
- Mobile 390 px: no horizontal page overflow in the tested Session 1 outcome / Flash Mission view.

## Static checks
- `app.js`, `group-sessions.js`, `sw.js`: syntax OK.
- No duplicate IDs in `index.html`.
- No missing local files referenced by HTML/CSS.

## V24 correction
No gameplay/scoring defect was found in the tested V23 build. V24 hardens update behaviour because stale public/cache responses can still expose an older asset revision after GitHub deployment.

Changes:
1. Unified V24 asset cache-busters in `index.html`.
2. New V24 service-worker cache name.
3. Service worker is registered as `sw.js?v=20260909-24` with `updateViaCache: none`.
4. Explicit `registration.update()` after successful registration.
5. Updated visible build badges/comments to V24 so the deployed files no longer look mixed-version.
6. Session 1 engine metadata advanced to 15; scoring rules remain **S1-R10**.
