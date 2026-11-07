# Math Games Hub

Static interactive math activities for classroom use. The landing page is
[`public/index.html`](public/index.html); it starts in Hebrew and offers an
English option. A visitor's selection is saved in browser local storage when
available. This selector translates the landing page; individual games retain
their existing language controls.

## Preview

From the repository directory, run:

```sh
python3 -m http.server 8000 --directory public
```

Open <http://localhost:8000>. Firebase Hosting also serves the `public` directory.
The root `app.js` is a separate Hello World server, not the static site preview.

## Copyright and license

Required Notice: Copyright 2026 יוני בנדר

The original app, source code, and original materials included in this project
are offered under the [PolyForm Noncommercial License 1.0.0](LICENSE).
You may use, copy, modify, and share them for purposes permitted by that license.
When distributing copies or modifications, include the license or its official
URL and preserve the required notice above.

The license permits noncommercial purposes and explicitly permits use by
educational institutions, charities, and the other organizations it lists,
regardless of funding. It does not grant general permission to commercialize
the app or code. Commercial uses outside its permitted purposes require
separate permission from the copyright holder. Noncommercial is broader than
simply prohibiting resale or requiring a business to make no net profit.
This is source-available software with a commercial-use restriction.

The bilingual visitor explanation is [`public/license.html`](public/license.html).
The deployed license at [`public/LICENSE.txt`](public/LICENSE.txt) must remain
identical to the root `LICENSE`. The English license governs; the summaries
and Hebrew explanation are provided for convenience.

Third-party libraries, fonts, and other third-party materials retain their own
licenses. This project's license only covers rights held by its contributors.
The previous package metadata declared ISC. If earlier versions were already
distributed under ISC, this change does not revoke permissions already granted
for those versions.

## Editing the landing page

The default Hebrew text is in `public/index.html`. Keep it in sync with the
Hebrew and English dictionaries in `public/assets/landing.js`. Language changes
update the page title, text, accessible section labels, and reading direction.
The gallery styles live in `public/assets/landing.css`. Game cards are static
HTML links, so the full gallery also works without JavaScript. Subject filters
and search are provided by `landing.js`; search matches Hebrew and English
game names regardless of the selected display language.

Game previews are local WebP screenshots in `public/assets/thumbnails/`.
Replace a preview there when a game's appearance changes. The landing page
keeps licensing details behind its footer link to `public/license.html`.

Shared copyright styles live in `public/assets/site-notice.css`; notices are
static HTML so they remain accessible without JavaScript. Fullscreen games use
a compact notice. The Firebase welcome template, `public/test.html`, is not an
authored activity and is left unchanged.
