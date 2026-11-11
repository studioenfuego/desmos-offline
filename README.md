# Desmos Offline

A fully offline copy of the Desmos graphing calculator, packaged as a real desktop
app for Windows and Mac, with the ability to save and reopen your graphs as files.

## For end users: installing the app

Each time a new version is released (tagged `v*`), GitHub Actions builds installers
for Windows and Mac automatically. Grab them from the repo's **Releases** page, or
from the **Actions** tab → latest successful "Build desktop apps" run → **Artifacts**.

- **Windows:** download the portable `.exe` and double-click it — no
  installation, no admin rights, works straight from a USB drive or a shared
  folder.
- **Mac:** download the `.dmg`, open it, and drag **Desmos Offline** into
  Applications. Because the app isn't signed with an Apple Developer certificate,
  the first launch will be blocked by Gatekeeper — right-click (or Control-click)
  the app and choose **Open**, then confirm, to approve it once.

Once installed, it's a normal app: double-click the icon, no browser or Terminal
needed.

### Saving and opening graphs

Use the toolbar at the top of the window, the **File** menu, or the keyboard
shortcuts:

| Action | Shortcut |
| --- | --- |
| New graph | Ctrl/Cmd+N |
| Open… | Ctrl/Cmd+O |
| Save | Ctrl/Cmd+S |
| Save As… | Ctrl/Cmd+Shift+S |

Graphs are saved as plain `.json` files you choose the location for, so you can
keep them anywhere (Documents, a shared drive, email them to someone else, etc.).

### No install, just the HTML file

The original "drag the HTML file into your browser" version still works too, and
now also supports Save/Open (via your browser's own download and file-picker
dialogs instead of native OS dialogs) — see **Legacy browser-only usage** below.

## For developers: building it yourself

Requirements: [Node.js](https://nodejs.org) 20+.

```sh
npm install        # install Electron + electron-builder
npm start          # run the app locally
```

### Building installers

```sh
npm run dist:win     # Windows portable .exe (run on/for Windows)
npm run dist:mac      # Mac .dmg, Intel + Apple Silicon (run on macOS)
npm run dist:linux    # Linux AppImage
```

Cross-compiling Mac installers from Linux or Windows isn't reliable, so the
[GitHub Actions workflow](.github/workflows/build.yml) builds each platform on its
own native runner (`windows-latest`, `macos-latest`, `ubuntu-latest`) and uploads
the results as workflow artifacts. Push a tag like `v1.0.0` to also attach them to
a new GitHub Release automatically. You can also trigger a build manually from the
Actions tab (`workflow_dispatch`).

### Project layout

- `desmos.html` / `desmos_files/` — the offline Desmos calculator page and the
  locally-saved Desmos API script. This same HTML file is used both standalone in
  a browser and inside the Electron app.
- `main.js` — Electron main process: creates the window, the File menu, and
  handles native Save/Open dialogs.
- `preload.js` — safely exposes a small `window.desmosElectronAPI` to the page
  (context isolation is on, Node integration is off).
- `package.json` → `build` — `electron-builder` configuration for Windows/Mac/Linux
  targets and the app icon (`build/icon.png`).

## Legacy browser-only usage

You can still skip the installer entirely and just open the HTML file directly:

1. Download the repository as a zip (Code → Download ZIP) and extract it.
2. Open `desmos.html` in your browser — on a Mac, drag it onto the browser icon;
   on Windows, open a new tab and type the file's path, e.g.
   `file:///C:/Users/you/Desktop/desmos-offline/desmos.html`.
3. Use the same Save/Open toolbar buttons — in a browser they save to your
   Downloads folder and open via the normal file picker, instead of native app
   dialogs.
