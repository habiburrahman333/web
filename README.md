# Personal Engineering Portfolio

A static, single-page portfolio for an Electrical Engineering Technology student at Universitas Gadjah Mada (UGM). It is built with plain HTML5, CSS3 and vanilla JavaScript: no frameworks, no build step, no dependencies, no backend. It uses a pastel red-and-white design with smooth "morph" transitions (shape-shifting buttons, cards and navigation indicator, a morphing signal waveform, and scroll-linked background shapes). It respects `prefers-reduced-motion` and stays readable without JavaScript.

## Directory structure

```
portfolio/
├── index.html            # Entry point (must stay at the site root)
├── css/
│   └── style.css         # All styles, with design tokens at the top
├── js/
│   └── script.js         # All behaviour + the SITE_CONFIG block you edit
├── assets/
│   ├── images/           # Put your own photos / project images here
│   └── icons/
│       └── favicon.svg
├── .gitignore
└── README.md
```

All file references are relative (for example `css/style.css`, never `/css/style.css`), so the site works from a domain root or from a subdirectory.

## 1. Personalise the site

Open `js/script.js` and edit the `SITE_CONFIG` block at the top:

```js
var SITE_CONFIG = {
  name: '[YOUR NAME]',
  email: '[YOUR EMAIL]',
  linkedin: '[YOUR LINKEDIN URL]',
  github: '[YOUR GITHUB URL]'
};
```

- Anything still in `[BRACKETS]` is treated as "not provided".
- The name feeds the logo initials, contact section and footer.
- The email enables the **Send an email** (`mailto:`) and **Copy email** buttons. Until you set it, those buttons show a short "email not set yet" message when clicked.
- LinkedIn and GitHub rows stay **hidden** until you provide real `http(s)` URLs.

Other things to update by hand in `index.html`:

- `<title>`, `<meta name="description">` and the Open Graph tags in `<head>`. Search engines and social previews read the HTML directly and do not run JavaScript, so the name from `SITE_CONFIG` is not applied there.
- Optional: add `og:image` and `og:url` once you have a preview image and a final domain.
- Project placeholders ("GitHub repository: link not provided yet", "Photos or demo video: to be added"). Replace them with real links or images when you have them, and put image files in `assets/images/`.

## 2. Preview locally

**Simplest:** double-click `index.html` to open it in your browser. Everything works from `file://`.

**Optional local server** (closer to real hosting), from inside the `portfolio` folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. (Python is only used for previewing; the site itself does not need it.) The VS Code "Live Server" extension works too.

## 3. Create a GitHub repository and push the files

1. Create an empty repository on GitHub (no README, no .gitignore, since they already exist here). Choose any name; nothing in the code depends on it.
2. In a terminal, from inside the `portfolio` folder:

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Replace `<your-username>` and `<your-repo-name>` with your own values. If GitHub asks you to authenticate, use the method GitHub currently recommends (browser sign-in, a credential manager, or SSH keys). **Never** commit passwords, tokens, or API keys; the included `.gitignore` already excludes common secret files.

## 4. Deploy to Hostinger

Hostinger's features and dashboard layout differ by plan and change over time, so this guide describes the *tasks* and tells you how to confirm the exact steps. It deliberately does not quote menu names. Check the current official Hostinger documentation (Hostinger Help Center / Knowledge Base) for your plan.

### Option A: Upload files to `public_html` (works on standard web hosting)

1. Log in to your Hostinger account and open the control panel for the website or hosting plan you want to use.
2. Find the **file manager** (or use FTP/SFTP) for that website. Search the Hostinger Help Center for "upload website files" or "file manager" to see the current steps.
3. Open the website's web root. On standard Hostinger hosting this is the `public_html` directory. Confirm in the docs for your plan.
4. Upload the **contents** of the `portfolio` folder, not the folder itself, so that the result is:

```
public_html/
├── index.html
├── css/style.css
├── js/script.js
└── assets/...
```

5. Visit your domain. `index.html` should load as the home page.

If you prefer, upload the ZIP and use the file manager's extract feature (if available), then make sure the files end up directly in `public_html`, not inside an extra subfolder.

To deploy in a subdirectory (for example `public_html/portfolio/`), upload the same files there and visit `yourdomain.com/portfolio/`. Relative paths make this work without changes.

### Option B: Git-based deployment (only if your plan offers it)

Some Hostinger plans include a Git integration that pulls from a GitHub repository. **Not every plan has it.** To check:

1. Search the official Hostinger documentation for "Git" or "deploy from GitHub" and look for your plan type.
2. If your plan supports it, follow the current guide for connecting the repository, choosing the branch (`main`), and choosing the target directory (usually the web root, `public_html`).
3. If the repository is private, follow the documented method for giving Hostinger read access (for example a deploy key). Keep any keys or tokens out of your repository.

**Key difference:** with Option A you manually upload files every time you change something. With Option B the host pulls updates from GitHub (automatically or when you trigger it, depending on the feature), so you edit, commit, push, and the site updates. If Option B isn't available on your plan, Option A is perfectly fine.

## 5. Updating the site later

- **Option A (upload):** edit locally, test, then re-upload the changed files to `public_html`, overwriting the old ones.
- **Option B (Git deployment):** edit locally, then:

```bash
git add .
git commit -m "Describe your change"
git push
```

Then check the Hostinger docs for whether your plan deploys automatically on push or needs a manual "deploy/pull" action.

In both cases, keep GitHub as the source of truth and test locally before publishing.

## 6. Troubleshooting

| Problem | What to check |
| --- | --- |
| **Blank page, 403 or 404 on the domain root** | `index.html` must be directly inside `public_html` (or your chosen web root), with that exact lowercase name. A common mistake is uploading the parent folder so the file ends up at `public_html/portfolio/index.html`. |
| **Page loads but looks unstyled** | The CSS didn't load. Confirm `css/style.css` exists at that exact path and case (hosting is usually case-sensitive: `Style.css` ≠ `style.css`). Open the browser dev tools → Network tab and look for a 404 on the CSS file. |
| **Buttons or menu don't work** | The JavaScript didn't load or hit an error. Check the Console tab in dev tools and confirm `js/script.js` is present and not renamed. |
| **Images or icon missing** | Check paths are relative (`assets/images/photo.jpg`, not `/assets/...` or `C:\...`) and that filenames match exactly, including capitalisation. |
| **Changes don't appear after uploading** | Caching. Hard-refresh (Ctrl/Cmd + Shift + R) or try a private window. If it persists, add a version to the links, e.g. `css/style.css?v=2` and `js/script.js?v=2`, and bump it when you change the files. If your plan has a caching or CDN feature, look in the Hostinger docs for how to clear it. |
| **Works locally but not online** | Usually a case-sensitivity or missing-file problem (see above), or files uploaded into the wrong folder. |
| **`mailto:` / copy buttons say "Email not set yet"** | Set `email` in `SITE_CONFIG` in `js/script.js`, then re-upload that file. |
| **LinkedIn / GitHub not showing** | They stay hidden until a valid `http(s)` URL is set in `SITE_CONFIG`. |

## Notes on features

- **No contact form on purpose.** A static site cannot deliver form submissions without a backend or a third-party form service, and a form that only *looks* like it sends would be misleading. Use the email buttons, or add a form service later.
- **Fonts:** the site uses system font stacks, so there are no external font requests. You can add a web font later if you wish.
- **Motion:** all durations and easing curves are CSS variables at the top of `css/style.css`. With "reduce motion" enabled in the operating system, animations are removed and all content is shown immediately.
- **View Transition API:** not used. All morph effects work with standard CSS transitions, keyframes and a little JavaScript.
- **Performance and accessibility:** the site has been built to follow accessibility and performance best practices, but no Lighthouse score has been measured. Run your own audit after deployment if you need numbers.
- **Illustrations:** the diagrams on the project cards are conceptual SVG illustrations, labelled as such, and are *not* the original hardware designs or schematics.
