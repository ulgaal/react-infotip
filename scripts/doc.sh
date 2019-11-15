#!/bin/bash
# A bash script to generate documentation for react-infotip

mkdir -p doc/ref

# react-docgen
react-docgen src/Storage.js src/Source.js src/Pinnable.js src/Balloon.js src/Cloud.js \
 -o stories/docgen.json  --resolver=findAllComponentDefinitions

# react-docgen to md 
node --experimental-modules stories/generateRefDocs.mjs
