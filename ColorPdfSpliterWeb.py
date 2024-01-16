#!/usr/bin/python

# 导入需要的模块
import os

import fitz  # 用于处理pdf文件
import glob  # 用于获取当前目录文件

# 参数设置
RGBDiff = 10  # RGB颜色总差异之和
ExportDir = "./export"

# 定义一个函数，判断一个页面是否为彩色页面
def isColorPage(page):
    # 获取页面的像素矩阵
    pix = page.get_pixmap()

    arr = list(pix.samples)
    arr = [int(b) for b in arr]  # 将字节转换为整数
    arr = [arr[i:i+pix.n] for i in range(0, len(arr), pix.n)]  # 重塑列表形状

    # 如果通道数大于1，说明存在颜色信息
    if pix.n > 1:
        # 计算每个像素的灰度值
        gray = [[0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]] for pixel in arr]
        # 计算每个像素的颜色差异值
        diff = [sum([abs(pixel[i] - gray[idx][0]) for i in range(pix.n)]) for idx, pixel in enumerate(arr)]

        # 如果颜色差异值的平均值大于某个阈值，说明页面为彩色页面
        if any(value > RGBDiff for value in diff):
            return True

    # 否则，页面为非彩色页面
    return False

def splitPDF(filePath, exportdir=""):
    # 文件名设置
    filename = {
        "input": filePath,
        "graypages": filePath[:-4] + "_黑白.pdf",
        "colorpages": filePath[:-4] + "_彩色.pdf",
    }

    # 打开一个pdf文件
    doc = fitz.open(filePath)
    # 创建两个空的pdf文件，用于保存彩色页面和非彩色页面
    color_doc = fitz.open()
    gray_doc = fitz.open()

    count = {"page": 0, "gray": 0, "color": 0}
    # 遍历原pdf文件中的每个页面
    for page in doc:
        count["page"] = count["page"] + 1
        print("检测页面：", count["page"], "/", len(doc))
        # 判断页面是否为彩色页面
        if isColorPage(page):
            # 如果是，将页面添加到彩色pdf文件中
            color_doc.insert_pdf(doc, from_page=page.number, to_page=page.number)
            count["color"] = count["color"] + 1
        else:
            # 如果不是，将页面添加到非彩色pdf文件中
            gray_doc.insert_pdf(doc, from_page=page.number, to_page=page.number)
            count["gray"] = count["gray"] + 1

    # 保存两个pdf文件
    # 保存灰色页面
    if count["gray"] > 0:
        print("正在保存灰色页面(共", count["gray"], "页):", filename["graypages"])
        gray_doc.save(exportdir + filename["graypages"])
    else:
        print("文件", filename["input"], "分割后不存在灰色页面，不保存文件")

    # 保存彩色页面
    if count["color"] > 0:
        print("正在保存彩色页面(共", count["color"], "页):", filename["colorpages"])
        color_doc.save(exportdir + filename["colorpages"])
    else:
        print("文件", filename["input"], "分割后不存在彩色页面，不保存文件")

# 总流程
# web版总流程交给js处理

# debug

# import hashlib
# def getMD5(filename):
#     with open(filename, "rb") as f:
#         bytes = f.read()  # read file as bytes
#         readable_hash = hashlib.md5(bytes).hexdigest()
#         return readable_hash

# 显示指定目录下的所有文件名 (debug)
# def showAllFiles(path):
#     # 遍历该目录下的所有文件名
#     for filename in os.listdir(path):
#         # 获取文件的完整路径
#         filepath = os.path.join(path, filename)
#         # 如果是文件，直接打印文件名
#         if os.path.isfile(filepath):
#             print(filepath)
#         # 如果是目录，则递归调用函数
#         elif os.path.isdir(filepath):
#             showAllFiles(filepath)