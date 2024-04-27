# ColorPdfSpliter

[English](README_EN.md) | 中文

将输入的PDF文件分为彩色和黑白两部分，彩色打印页数多时省钱💴

(我校打印店黑白打印0.2元/张，彩色打印1元/张。彩色打印课程作业或者什么其他的文件的时候能省很多钱。这个程序有巨大的实用价值🤑)

临时使用可以尝试[在线版 ColorPdfSpliter](https://colorpdfspliter.pages.dev)，在线版多次处理文件时会占用大量内存，建议使用本地版本。

> 如果你也觉得这是个好东西就给颗⭐呗？

## 使用方法
### Windows
1. 下载本[repo](https://github.com/huuhghhgyg/ColorPdfSpliter/archive/refs/heads/main.zip)，或按照右上角绿色按钮的提示`clone`本仓库。
2. 保证你的电脑上安装了Python3，运行`initialize.bat`安装所需依赖包。如果你的电脑上没有安装Python3，请到[Python官网](https://www.python.org/downloads/)下载安装。
3. **运行：** 安装完成后，将需要分割的PDF文件放入当前目录中，运行`run.bat`后就会对当前目录下的所有PDF文件进行分割。
   * 如果只有一个文件，分割得到的文件会直接放在当前目录下。
   * 如果放入了多个文件，分割得到的文件会放在`./export`文件夹中。这是一个默认路径，你可以通过在源文件中修改`ExportDir`参数来修改导出路径。

### Linux
Linux用户应该比较少吧，直接用命令行也很方便😋

1. 克隆这个仓库
    ```sh
    git clone https://github.com/huuhghhgyg/ColorPdfSpliter.git
    ```

2. 安装依赖包
    ```sh
    pip install PyMuPDF numpy
    ```

3. **运行：** 和Windows的操作方法一样，将所有需要处理的PDF文件丢进当前目录中，执行
   ```sh
   python ColorPdfSpliter.py
   ```

   或者你也可以利用文件中的shebang直接运行这个程序:
   ```sh
   ./ColorPdfSpliter.py 2>/dev/null
   ```
   
   即可开始分割文件

## 高级用法
`RGBDiff`参数用于控制彩色和灰色（黑白看作特殊的灰色）的阈值，如果你的分隔出来的黑白文件有色彩页面，可以适当调高这个参数，降低灰色的判定标准。

## 特别鸣谢
* New Bing：告诉我如何使用PyMuPDF来处理PDF文件
