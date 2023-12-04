# NBARedZone

> Watch bestsolaris.com NBA games RedZone-style

<img width="1440" alt="NBARedZone" src="https://github.com/plt3/NBARedZone/assets/65266160/b90dfd9c-eaff-49e4-b302-d78bbec7cfac">

## Installation:

NOTE: only tested on macOS

- create a virtual environment for Python packages (recommended); in project directory, run `python3 -m venv venv` then `source venv/bin/activate`
- clone the repository: `git clone https://github.com/plt3/NBARedZone.git`
- install dependencies with `pip install -r requirements.txt`

## Usage:

- run server with `uvicorn main:app`
- this will serve `http://localhost:8000`, so open that address in a browser
  - the page will find all NBA games currently live, and will display up to 4 games on the page. Click the play icon to start each stream

## Keyboard Shortcuts:

- the web page is entirely keyboard-driven. No buttons are available to perform these actions via clicks.
- NOTE: you need to have focus on the outer page (not the embedded streams themselves)
  for the keyboard shortcuts to work. This means clicking on the margin between streams after
  clicking inside a stream to return the focus back to the main page.
- all keyboard shortcuts are customizable via editing `static/keybinds.js`

### Keybinds that Toggle Things:

- `F`: toggle fullscreen of the entire web page
- `G`: toggle live scores popup to see all games currently live (if there are more than 4)
- `U`: toggle between embedded stream view and full page stream view. Sometimes the
  embedded streams don't work and the full page does, so this may be worth the try if
  the streams are not loading.

### Two-Part Keybinds:

- these work by pressing an action key (`R/T/S`), and then the key corresponding to the
  frame which you would like to perform that action (`1/2/3/4`)
- action keys:
  - `R`: reload a frame. Useful for when streams buffer (mnemonic: Reload)
  - `T`: toggle a frame to take up the entire web page (i.e. fullscreen it) (mnemonic: Toggle)
  - `S`: rotate the stream that a frame is displaying. Useful for when more than 4 games
    are going on and you would like to switch the games you are watching. (mnemonic: Stream)
- frame keys:
  - `1`: perform the given action on frame 1 (top-left)
  - `2`: perform the given action on frame 2 (top-right)
  - `3`: perform the given action on frame 3 (bottom-left)
  - `4`: perform the given action on frame 4 (bottom-right)
- the current action key is remembered until another action key is pressed. This means,
  if you press `S` and then `1` and then `3`, this will rotate the stream in frame 1 and
  then rotate the stream in frame 3. Then, if you press `T` and `4`, this will toggle
  frame 4 to be full screen.

## Limitations:

- all this webpage does is embed streams from bestsolaris.com. This means that I have no
  control over the quality of the streams, and they often buffer or just don't work. Make use
  of the reload keybind if a stream buffers or toggle between the embedded stream view
  and full page stream view if one is not working.
- since the embedded streams are from a different domain, the webpage can't control
  their audio (i.e. mute/unmute each stream programmatically). You must click on the
  volume control for each stream individually, and then click back outside of the stream
  to bring the focus back to the main page for the keyboard shortcuts to work again.

## TODO:

- rotate through multiple streams for the same game when they sometimes appear?
  - sometimes one works and one doesn't
