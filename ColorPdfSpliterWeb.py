#!/usr/bin/python

# 导入需要的模块
import os

import pymupdf  # 用于处理pdf文件
import numpy as np  # 用于处理数组
import glob  # 用于获取当前目录文件

# 参数设置
RGBDiff = 30  # RGB颜色总差异之和
ExportDir = "./export"
duplex = False

# 用于向js传递信息
def logProgress(current, total):
    print("检测页面：", current, "/", total)

# 定义一个函数，判断一个页面是否为彩色页面
def isColorPage(page):
    # 获取页面的像素矩阵
    pix = page.get_pixmap()
    # 将像素矩阵转换为numpy数组
    arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
    # 如果像素矩阵的通道数大于1，说明有颜色信息
    if pix.n > 1:
        # 计算每个像素的灰度值
        gray = np.dot(arr[..., :3], [0.299, 0.587, 0.114])
        # 计算每个像素的颜色差异值
        diff = np.abs(arr[..., :3] - gray[..., None]).sum(axis=2)
        # 如果颜色差异值的平均值大于某个阈值，说明页面为彩色页面
        if np.any(diff > RGBDiff):
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
    doc = pymupdf.open(filePath)
    # 创建两个空的pdf文件，用于保存彩色页面和非彩色页面
    color_doc = pymupdf.open()
    gray_doc = pymupdf.open()

    count = {"page": 0, "gray": 0, "color": 0}
    # 根据是否双面打印，遍历页面
    if duplex:
        for idx in range(0, len(doc), 2):
            if idx == len(doc) - 1:
                front_page = doc[idx]
                back_page = doc[idx]
            else:
                front_page = doc[idx]
                back_page = doc[idx + 1]
            # 判断正反两面是否有彩色页面
            if isColorPage(front_page) or isColorPage(back_page):
                color_doc.insert_pdf(doc, from_page=front_page.number, to_page=back_page.number)
                count["color"] += 2
            else:
                gray_doc.insert_pdf(doc, from_page=front_page.number, to_page=back_page.number)
                count["gray"] += 2
            count["page"] += 2
            logProgress(count["page"], len(doc))
    else:
        for page in doc:
            count["page"] += 1
            logProgress(count["page"], len(doc))
            # 判断页面是否为彩色页面
            if isColorPage(page):
                color_doc.insert_pdf(doc, from_page=page.number, to_page=page.number)
                count["color"] += 1
            else:
                gray_doc.insert_pdf(doc, from_page=page.number, to_page=page.number)
                count["gray"] += 1

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