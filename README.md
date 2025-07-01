# ColorPdfSpliter

[English](README_EN.md) | 中文

一个用于分离PDF文件中彩色页面和黑白页面的工具库及配套应用，帮您在打印时节省成本 💴。

项目包含一个核心处理库、一个命令行工具和一个可以直接在浏览器中运行的Web界面。

[![在线版](https://img.shields.io/badge/在线版-colorpdfspliter.pages.dev-blue.svg)](https://colorpdfspliter.pages.dev/)

> 💡 **在线版提示**：为方便临时使用。若需处理大文件或批量处理，强烈建议使用性能更佳的本地命令行版本。

---

## 特性

- **核心库**：提供纯粹的PDF处理能力，方便集成到其他Python项目中。
- **命令行工具**：功能强大，支持单文件、多文件批量处理及双面打印模式。
- **Web界面**：无需安装Python，在浏览器中即可完成操作，所有处理均在本地进行，保障您的文件隐私安全。

---

## 使用方法

### 方式一：本地命令行工具 (推荐批量处理)

**1. 下载项目**

```bash
git clone [https://github.com/huuhghhgyg/ColorPdfSpliter.git](https://github.com/huuhghhgyg/ColorPdfSpliter.git)
cd ColorPdfSpliter
```

**2. 安装依赖 (首次使用)**

运行初始化脚本，它将使用`pip`安装所有必要的依赖。请确保在项目的**根目录**下运行此命令。

```bash
# Windows
initialize.bat

# Linux / macOS
pip install .
```
> `pip install .` 会将本项目作为一个库安装到您的Python环境中，这样命令行脚本才能找到核心库。

**3. 运行**

将您需要处理的PDF文件放入项目根目录。

- **处理单面模式：**
  ```bash
  # Windows
  run.bat
  # Linux / macOS
  python cli.py
  ```

- **处理双面模式：**
  ```bash
  # Windows
  run-duplex.bat
  # Linux / macOS
  python cli.py duplex
  ```

- **输出规则：**
  - 若处理单个文件，结果将保存在根目录。
  - 若处理多个文件，结果将保存在新建的 `./export` 文件夹中。


### 方式二：本地Web界面 (推荐预览和临时使用)

由于现代浏览器的安全策略，您不能直接通过 `file://` 路径打开 `index.html`。您需要启动一个本地服务器来运行它。

**1. 启动本地服务器**

打开您的命令行工具 (Terminal 或 CMD)，使用 `cd` 命令进入到本项目的 `web` 文件夹内。然后运行以下命令：

```bash
# 首先，确保你在 web 文件夹里
cd web

# 然后，启动Python内置的HTTP服务器
python -m http.server
```
看到 `Serving HTTP on ... port 8000` 的提示后，请不要关闭这个命令行窗口。

**2. 在浏览器中访问**

打开您的浏览器（如 Chrome, Safari），在地址栏输入以下地址并访问：

```
http://localhost:8000
```

现在，您就可以在网页上上传并处理您的PDF文件了。

---

## 作为库使用

您可以将 `src` 目录复制到您的项目中，然后像这样导入和使用核心处理函数：

```python
from src.color_pdf_spliter.processor import split_pdf_by_color

with open("my_document.pdf", "rb") as f:
    pdf_bytes = f.read()

# 调用函数
# results 是一个字典，包含分离后的文件名和字节流
results = split_pdf_by_color(pdf_bytes, is_duplex=True)

# 保存彩色文件
if 'color' in results:
    with open("my_document_color.pdf", "wb") as f:
        f.write(results['color']['bytes'])
```

> 如果您觉得这个项目对您有帮助，请给一颗⭐吧！