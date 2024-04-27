# ColorPdfSpliter

English | [中文](README.md)

A program that splits input PDF files into color and black & white parts, saving money when printing in color💴

(Our school's printing shop charges 0.2 yuan/page for black and white printing and 1 yuan/page for color printing. This program can save a lot of money when printing course assignments or other files in color. It has great practical value🤑)

[![.github/workflows/deploy.yml](https://github.com/huuhghhgyg/ColorPdfSpliter/actions/workflows/deploy.yml/badge.svg?branch=web)](https://colorpdfspliter.pages.dev/)

For temporary use, you can try the [online version ColorPdfSpliter](https://colorpdfspliter.pages.dev). But the online version will occupy a lot of memory when processing files multiple times, so it is recommended to use the local batch version.

> If you think this is a good thing, give it a star ⭐?

## Usage
### Windows
1. Download the [repository](https://github.com/huuhghhgyg/ColorPdfSpliter/archive/refs/heads/main.zip) by either clicking on the link or using the "clone" button in the upper right corner of this repository.
    
2. Ensure that Python3 is installed on your computer. Run `initialize.bat` to install the necessary dependencies. If Python3 is not installed on your computer, you can download and install it from the [Python official website](https://www.python.org/downloads/).
    
3. **Run:** After the installation is complete, place the PDF file(s) you want to split into the current directory. Run `run.bat`, and it will split all the PDF files in the current directory.
    
    * If there is only one file, the split files will be placed directly in the current directory.
    * If you have multiple files, the split files will be placed in the `./export` folder. This is the default path, and you can modify the export path by changing the `ExportDir` parameter in the source file.

### Linux
Linux users should be relatively rare, so using the command line is also very convenient (no double click needed 😋)

1. Clone this repository

    ```Bash
    git clone https://github.com/huuhghhgyg/ColorPdfSpliter.git
    ```

2. Install dependency packages

    ```Bash
    pip install PyMuPDF numpy
    ```

3. **Run**: Same as the operating method for Windows, put all PDF files to be processed in the current directory, and execute

    ```Bash
    python ColorPdfSpliter.py
    ```
Or you can also run this program directly using the shebang in the file:

```Bash
./ColorPdfSpliter.py 2>/dev/null
```
to start splitting files

## Advanced usage
The `RGBDiff` parameter is used to control the threshold between color and gray (black and white is considered a special gray). If the black and white files you separated have color pages, you can adjust this parameter appropriately to lower the gray judgment standard.

## Special thanks
New Bing: How to use PyMuPDF to process PDF files