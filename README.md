# Gibberwocky.MIDI

This repo is for a plugin to live code MIDI messages for targeting synths and/or digital audio workstations. It is fork of [Gibberwocky](https://github.com/charlieroberts/gibberwocky), a live-coding environment for Ableton Live, which in turn is based on [Gibber](https://github.com/charlieroberts/gibber), a live-coding environment for the browser that targets the WebAudio API.

## Using
1. Load the index.html page in a browser that supports the WebMIDI API (tested in Chrome).
2. Hit Ctrl+Enter to execute a line of code. Look at the tutorials for examples of how to use... this project is currently very pre-alpha, so not much documentation to share at the moment.


## Development

First, install all packages with: 

```bash
cd client
npm install
```

After making changes to any javascript, use `gulp build` from within root directory to rebuild the primary `index.js` file. You can also simply use `gulp` to launch a watcher that will recompile the main .js file whenever you make changes to any of the JavaScript files.
