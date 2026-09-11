M1 DAY 4 — R6 CORRECTIVE PATCH

Upload these files directly to the root of the BeingAnActuaryInEnglish repository.

Files:
- m1-day4.html
- m1-day4-global-team-risk-room.html
- day4-hero-r6.jpg
- day4-m1-r6.jpg
- day4-m2-r6.jpg
- day4-m3-r6.jpg
- day4-m4-r6.jpg

R6 fixes:
- removes all Unsplash hotlinks from Day 4 and the game: visuals are now local and stable;
- avoids third-party image requests, consistent with the page's privacy/GDPR statement;
- adds cache-busting link ?v=r6 from Session 4 to the game;
- adds guards against double-answer/double-next events so scores, stars and mission order cannot be duplicated or skipped;
- validates 3- or 4-player selection before starting;
- adds aria-pressed state to player-count buttons;
- adds fixed image dimensions to reduce layout shift;
- keeps the deterministic answer pattern A / B / C / A.

Checks performed:
- JavaScript syntax check: PASS
- 4 missions / 81 possible answer paths: PASS
- best-answer pattern A/B/C/A: PASS
- score range stays valid: PASS (28–82 in tested paths)
- duplicate HTML ids: NONE
- all Day 4 image references: local and present
