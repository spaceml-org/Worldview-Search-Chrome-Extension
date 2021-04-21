# Worldviewsearch Chrome Extension

## Developing:

Most of the code lives in `components/foreground.js`.

`npm run build:prod` to build the extension, the finished build lands in `dist/`.


## Use and test

1. Either unzip the latest release (found in the release tab and the release folder) OR use the generated `dist/` folder for the rest of this
2. Go to [chrome://extensions](chrome://extensions) in your chrome browser
3. Activate **"developer mode"** in right-hand corner
4. Click **"load unpacked"** button on left side
5. Point to the (unzipped) folder
6. **Go to the [WorldView website](https://worldview.earthdata.nasa.gov/), hit the snapshot button.**

-------------
![Demo image of WorldView Similarity Search](assets/world_view_snap.png?raw=true "WorldView Similarity Search")
------------