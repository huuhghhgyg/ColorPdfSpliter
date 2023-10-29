# ColorPdfSpliter

English | [中文](README.md)

A program that splits input PDF files into color and black & white parts, saving money when printing in color💴

(Our school's printing shop charges 0.2 yuan/page for black and white printing and 1 yuan/page for color printing. This program can save a lot of money when printing course assignments or other files in color. It has great practical value🤑)

> If you think this is a good thing, give it a star ⭐?

## Usage
### Windows
1. Make sure you have Python3 installed on your computer. Run `initialize.bat` to install the required dependencies. If you don't have Python3 installed on your computer, please download and install it from the [Python official website](https://www.python.org/downloads/).
2. **Run**: After the installation is complete, place the PDF files to be split in the current directory. Run `run.bat` to split all PDF files in the current directory.
   - If there is only one file, the split files will be placed directly in the current directory.
   - If you put in multiple files, the split files will be placed in the `./export` folder. This is the default path. You can modify the export path by modifying the `ExportDir` parameter in the source file.
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