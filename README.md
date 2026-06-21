# ColorPdfSpliter

[English](README_EN.md) | 中文

将输入的PDF文件分为彩色和黑白两部分，彩色打印页数多时省钱💴

(我校打印店黑白打印0.2元/张，彩色打印1元/张。彩色打印课程作业或者什么其他的文件的时候能省很多钱。这个程序有巨大的实用价值🤑)

[![.github/workflows/deploy.yml](https://github.com/huuhghhgyg/ColorPdfSpliter/actions/workflows/deploy.yml/badge.svg?branch=main)](https://colorpdfspliter.pages.dev/) ![GitHub contributors](https://img.shields.io/github/contributors/huuhghhgyg/ColorPDFSpliter)


临时使用可以尝试[在线版 ColorPdfSpliter](https://colorpdfspliter.pages.dev)，在线版多次处理文件时会占用大量内存，建议使用本地版本。

> 如果你也觉得这是个好东西就给颗⭐呗？

## 功能特性

### 标准分割（默认）
将PDF拆分为 **一个彩色文件** + **一个黑白文件**，适合直接打印。

### 🆕 分段导出（保持原始页码顺序）
按颜色连续段落拆分成**多个编号文件**，文件名包含序号，按顺序打印即可恢复原始页码！

```
原文件页码: 1(黑白), 2(黑白), 3(彩色), 4(彩色), 5(黑白), 6(彩色), 7(黑白), 8(黑白)

输出:
  01_黑白.pdf  ← 第1-2页
  02_彩色.pdf  ← 第3-4页
  03_黑白.pdf  ← 第5页
  04_彩色.pdf  ← 第6页
  05_黑白.pdf  ← 第7-8页
```

按 `01 → 02 → 03 → 04 → 05` 顺序打印，拿到的就是原始页码顺序，无需手动排序！

### 🆕 一键重新处理
修改 RGBDiff 等参数后，无需重新上传文件，点击「调整选项重新处理」即可用新参数再次分割。

### 🆕 Web 版全面升级
- **拖拽上传** — 支持拖拽 PDF 文件到上传区域
- **选项直接显示** — RGBDiff 滑动条、双面打印、分段导出等选项在主界面一目了然
- **实时进度动画** — 处理进度条实时显示
- **ZIP 打包下载** — 所有分段文件一键打包下载，无需逐个点击
- **状态管理** — 加载、就绪、处理中、完成、错误，各状态流畅切换

## 使用方法

### Windows
1. 下载本[repo](https://github.com/huuhghhgyg/ColorPdfSpliter/archive/refs/heads/main.zip)，或按照右上角绿色按钮的提示`clone`本仓库。
2. 保证你的电脑上安装了Python3，运行`initialize.bat`安装所需依赖包。如果你的电脑上没有安装Python3，请到[Python官网](https://www.python.org/downloads/)下载安装。
3. **运行：** 安装完成后，将需要分割的PDF文件放入当前目录中，运行`run.bat`后就会对当前目录下的所有PDF文件进行分割。
   - 如果只有一个文件，分割得到的文件会直接放在当前目录下。
   - 如果放入了多个文件，分割得到的文件会放在`./export`文件夹中。这是一个默认路径，你可以通过在源文件（`cli.py`）中修改`ExportDir`参数来修改导出路径。

### Linux
Linux用户应该比较少吧，直接用命令行也很方便😋

1. 克隆这个仓库
    ```sh
    git clone https://github.com/huuhghhgyg/ColorPdfSpliter.git
    ```

2. 安装依赖包
    ```sh
    pip install PyMuPDF==1.24.14 numpy
    ```

3. **运行：** 和Windows的操作方法一样，将所有需要处理的PDF文件丢进当前目录中，执行
   ```sh
   python cli.py
   ```

   或者你也可以利用文件中的shebang直接运行这个程序:
   ```sh
   ./cli.py 2>/dev/null
   ```

   即可开始分割文件

## 高级用法

### 参数说明

`RGBDiff`参数用于控制彩色和灰色（黑白看作特殊的灰色）的阈值，如果你的分隔出来的黑白文件有色彩页面，可以适当调高这个参数，降低灰色的判定标准。
- 对于本地运行，修改`cli.py`中的`RGBDiff`参数即可。默认值为30。
- 对于在线版，直接在主界面调节 **RGBDiff** 滑动条。

### 模式选择

#### 📄 标准模式（默认）
```sh
python cli.py
```
生成两个文件：`_彩色.pdf` + `_黑白.pdf`

#### 🆕 分段导出模式（推荐）
```sh
python cli.py segmented
```
生成多个编号文件，按文件名顺序打印即恢复原始页码。

#### 🔄 双面打印
```sh
python cli.py duplex
```
保证生成的彩色与黑白文件均为连续的两页（即一张纸上的双面）。当一张纸上正反打印的两个页面中有一个为彩色，则这两个页面都会被划分入彩色文件。

#### 🆕 双面 + 分段
```sh
python cli.py duplex segmented
```
两种模式可同时使用。

### Web 在线版
主界面即可设置所有选项：
- **RGBDiff** — 颜色判定阈值，滑动条调节
- **双面打印** — 勾选启用
- **分段导出（保持原始顺序）** — 勾选启用

处理完成后可一键 **ZIP 打包下载** 所有文件，或点击 **「调整选项重新处理」** 修改参数后重新分割。

## 特别鸣谢
- New Bing：告诉我如何使用PyMuPDF来处理PDF文件
- 其它代码贡献者
