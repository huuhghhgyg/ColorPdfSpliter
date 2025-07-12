# ColorPdfSpliter

English | [中文](README.md)

A program that splits input PDF files into color and black & white parts, saving money when printing in color💴

(At my university's print shop, black and white printing costs 0.2 yuan/page, while color printing costs 1 yuan/page. When printing course assignments or other documents in color, this program can save a lot of money. It has great practical value🤑)

[![.github/workflows/deploy.yml](https://github.com/huuhghhgyg/ColorPdfSpliter/actions/workflows/deploy.yml/badge.svg?branch=main)](https://colorpdfspliter.pages.dev/) ![GitHub contributors](https://img.shields.io/github/contributors/huuhghhgyg/ColorPDFSpliter)

For temporary use, you can try the [online version ColorPdfSpliter](https://colorpdfspliter.pages.dev). The online version will occupy a lot of memory when processing files multiple times, so it is recommended to use the local version.

> If you think this is a good tool, please give it a ⭐!

## Usage
### Windows
1. Download this [repo](https://github.com/huuhghhgyg/ColorPdfSpliter/archive/refs/heads/main.zip), or use the green button in the upper right to `clone` the repository.
2. Make sure Python3 is installed on your computer. Run `initialize.bat` to install the required dependencies. If you don't have Python3, download and install it from the [official Python website](https://www.python.org/downloads/).
3. **Run:** After installation, put the PDF files you want to split into the current directory, and run `run.bat` to split all PDF files in the current directory.
   * If there is only one file, the split files will be placed directly in the current directory.
   * If you have multiple files, the split files will be placed in the `./export` folder. This is the default path, and you can change the export path by modifying the `ExportDir` parameter in the source file (`cli.py`).

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

The `RGBDiff` parameter is used to control the threshold between color and gray (black and white is considered a special gray). If the black and white files you separated have color pages, you can increase this parameter to lower the threshold for gray detection.
- For local use, modify the `RGBDiff` parameter in `cli.py`. The default value is 30.
- For the online version, modify the `RGBDiff` parameter in the "Settings" panel.

You can use the `duplex` parameter to split color and black & white pages for double-sided printing. This ensures that both the color and black & white files generated are always in pairs of two consecutive pages (i.e., both sides of a sheet). If either side of a sheet is color, both pages will be included in the color file.

For Windows users, run `run-duplex.bat`.

For Linux users, use:
```sh
python cli.py duplex
```

For the online version, enable the "Double-sided printing" option in "Settings".

## Special Thanks
- New Bing: For guidance on using PyMuPDF to process PDF files
- Other code contributors