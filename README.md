# Worldviewsearch Chrome Extension
 
<ins> **What is it?** </ins>
Well lets say you're trying to index images of the earth, and you want to find **similar images** to your input. That's exactly what this is for - a chrome extension built on react, that lets you take a snapshot of satelite images from NASA's worldview website, and lets you perform similarity searches on the same, which is returned back to you, in a neat and clean UI

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
