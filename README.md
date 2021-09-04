<div align = "center">
<img src="https://github.com/spaceml-org/Worldviewsearch-Chrome-Extension/blob/sumanth/src/images/banner.png" >

<p align="center">
  Published by <a href="http://spaceml.org/">SpaceML</a> •
  <a href="https://arxiv.org/abs/2012.10610">About SpaceML</a> •
</p>

![npm](./src/images/npm.svg) ![javascript](https://img.shields.io/badge/%20%20JavaScript-%20%20%20%20730L-f1e05a.svg) ![html](https://img.shields.io/badge/%20%20HTML-%20%20%20%20164L-e34c26.svg) \
*****Coming soon to the Chrome Web Store*****
</div>

# Worldviewsearch Chrome Extension

<ins> **What is it?** </ins>

Well lets say you're trying to index images of the earth, and you want to find **similar images** to your input. That's exactly what this is for - a chrome extension built on React, that lets you take a snapshot of satelite images from NASA's worldview website, and lets you perform similarity searches on the same, which is returned back to you, in a neat and clean UI

### Install Worldviewsearch Chrome Extension
- To get started you will need npm installed on your system
- Clone the main branch of the repository
- Extract all the files to a folder of your choice.
- Bring up the terminal on the above folder and run 

   1. `npm install`  
   2. `npm run build:prod`
   
- Go to [chrome://extensions](chrome://extensions) in your chrome browser
- Activate **"developer mode"** in right-hand corner
- Click **"load unpacked"** button on left side
- Point to the *dist* folder within the root folder 

### How To Use Worldviewsearch Chrome Extension
Step 1) **Head over to [WorldView website](https://worldview.earthdata.nasa.gov/)** \
In the layers option choose *Corrected Reflectance(True Colour)* and unselect the default selections
Move a day behind to begin using it

Step 2) **Press the camera button on the worldview website** \
   Take a snapshot of the required region and then press the glowing *Worldview Similarity Search* button and you're good to go!

## Development:

Run `npm install` in the root folder to get started

Most of the code lives in `components/foreground.js`.

`npm run build:prod` to build the extension(make your changes live), the finished build lands in `dist/`.

-------------
![Demo image of WorldView Similarity Search](assets/world_view_snap.png?raw=true "WorldView Similarity Search")
------------
