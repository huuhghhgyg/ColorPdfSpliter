# ColorPdfSpliter

English | [中文](README.md)

A program that splits input PDF files into color and black & white parts, saving money when printing in color💴

(At my university's print shop, black and white printing costs 0.2 yuan/page, while color printing costs 1 yuan/page. When printing course assignments or other documents in color, this program can save a lot of money. It has great practical value🤑)

[![.github/workflows/deploy.yml](https://github.com/huuhghhgyg/ColorPdfSpliter/actions/workflows/deploy.yml/badge.svg?branch=main)](https://colorpdfspliter.pages.dev/) ![GitHub contributors](https://img.shields.io/github/contributors/huuhghhgyg/ColorPDFSpliter)

For temporary use, you can try the [online version ColorPdfSpliter](https://colorpdfspliter.pages.dev). The online version will occupy a lot of memory when processing files multiple times, so it is recommended to use the local version.

> If you think this is a good tool, please give it a ⭐!

## Features

### Standard Split (Default)
Split PDF into **one color file** + **one B&W file**, suitable for direct printing.

### 🆕 Segmented Export (Preserve Page Order)
Split into **multiple numbered files** by color segments. Print them in filename order and the original page sequence is restored!

```
Original pages: 1(B&W), 2(B&W), 3(Color), 4(Color), 5(B&W), 6(Color), 7(B&W), 8(B&W)

Output:
  01_B&W.pdf   ← Pages 1-2
  02_Color.pdf ← Pages 3-4
  03_B&W.pdf   ← Page 5
  04_Color.pdf ← Page 6
  05_B&W.pdf   ← Pages 7-8
```

Print in `01 → 02 → 03 → 04 → 05` order and the output matches your original page order — no manual sorting needed!

### 🆕 Reprocess Without Re-upload
After changing RGBDiff or other settings, click **"Adjust & Reprocess"** to re-run with new parameters — no need to re-upload the file.

### 🆕 Web UI Enhancements
- **Drag & Drop** — Drag PDF files onto the upload area
- **Inline Options** — RGBDiff slider, duplex, segmented mode right on the main page
- **Live Progress** — Animated progress bar with page count
- **ZIP Download** — Download all segmented files as a single ZIP archive
- **State Management** — Smooth transitions between loading, ready, processing, complete, and error states

## Usage

### Windows
1. Download this [repo](https://github.com/huuhghhgyg/ColorPdfSpliter/archive/refs/heads/main.zip), or use the green button in the upper right to `clone` the repository.
2. Make sure Python3 is installed on your computer. Run `initialize.bat` to install the required dependencies. If you don't have Python3, download and install it from the [official Python website](https://www.python.org/downloads/).
3. **Run:** After installation, put the PDF files you want to split into the current directory, and run `run.bat` to split all PDF files in the current directory.
   - If there is only one file, the split files will be placed directly in the current directory.
   - If you have multiple files, the split files will be placed in the `./export` folder. This is the default path, and you can change the export path by modifying the `ExportDir` parameter in the source file (`cli.py`).

### Linux
Linux users may be rare, but using the command line is also very convenient 😋

1. Clone this repository
    ```sh
    git clone https://github.com/huuhghhgyg/ColorPdfSpliter.git
    ```

2. Install dependencies
    ```sh
    pip install PyMuPDF==1.24.14 numpy
    ```

3. **Run:** As with Windows, put all PDF files to be processed in the current directory and execute
   ```sh
   python cli.py
   ```

   Or you can run the program directly using the shebang in the file:
   ```sh
   ./cli.py 2>/dev/null
   ```
   to start splitting files

## Advanced Usage

### Parameters

The `RGBDiff` parameter controls the threshold between color and gray (black and white is considered a special gray). If the black and white files you separated have color pages, you can increase this parameter to lower the threshold for gray detection.
- For local use, modify the `RGBDiff` parameter in `cli.py`. The default value is 30.
- For the online version, adjust the **RGBDiff** slider directly on the main page.

### Modes

#### 📄 Standard Mode (Default)
```sh
python cli.py
```
Generates two files: `_Color.pdf` + `_B&W.pdf`

#### 🆕 Segmented Mode (Recommended)
```sh
python cli.py segmented
```
Generates multiple numbered files. Print in filename order to restore original page sequence.

#### 🔄 Double-sided (Duplex) Mode
```sh
python cli.py duplex
```
Ensures that both pages of a sheet always stay together. If either side contains color, both pages go to the color file.

#### 🆕 Duplex + Segmented
```sh
python cli.py duplex segmented
```
Both modes can be used together.

### Web Version
All options are available directly on the main page:
- **RGBDiff** — Color detection threshold slider
- **Duplex** — Toggle checkbox
- **Segmented Export** — Toggle checkbox

After processing, download all files as a **ZIP archive** with one click, or click **"Adjust & Reprocess"** to try different parameters without re-uploading.

## Special Thanks
- New Bing: For guidance on using PyMuPDF to process PDF files
- Other code contributors
