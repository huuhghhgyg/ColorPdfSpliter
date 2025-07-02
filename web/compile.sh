#!/bin/bash
cp ../ColorPdfSpliter.py .
npm ci
npx tailwindcss -i ./input.css -o ./style.css --minify