#!/usr/bin/python

# 导入需要的模块
import os

import pymupdf  # 用于处理pdf文件
import numpy as np  # 用于处理数组
import glob  # 用于获取当前目录文件

# 参数设置
RGBDiff = 30  # RGB颜色总差异之和
ExportDir = "./export"


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


LEN_TITLE = 30  # title长度


def progress_bar(value, total=100, title="Complete"):
    percent = (value / total) * 100
    bar = "█" * int(percent // 2) + "-" * (50 - int(percent // 2))
    if len(title) > LEN_TITLE:
        title = title[:LEN_TITLE] + "..."
    print(f"\r|{bar}| {value}/{total} {title}", end="\r" if value < total else "\n")


def splitPDF(file, exportdir=""):
    # 文件名设置
    filename = {
        "input": file,
        "graypages": file[:-4] + "_黑白.pdf",
        "colorpages": file[:-4] + "_彩色.pdf",
    }

    # 打开一个pdf文件
    doc = pymupdf.open(file)
    # 创建两个空的pdf文件，用于保存彩色页面和非彩色页面
    color_doc = pymupdf.open()
    gray_doc = pymupdf.open()

    count = {"page": 0, "gray": 0, "color": 0}
    # 遍历原pdf文件中的每个页面
    for page in doc:
        count["page"] = count["page"] + 1
        # print("检测页面：", count['page'],'/',len(doc))
        progress_bar(count["page"], len(doc), doc.name)

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
if __name__ == "__main__":
    pdf_list = glob.glob("*.pdf")
    if len(pdf_list) == 0:  # 没有pdf文件
        print("未检测到当前目录中存在pdf文件")
        os.system("pause")
        exit()

    if len(pdf_list) > 1:
        # 判断批量输出目录是否存在
        if not os.path.exists(ExportDir):
            os.mkdir(ExportDir)

        for i in range(len(pdf_list)):
            print(f"[{i + 1}/{len(pdf_list)}] 正在处理: {pdf_list[i]}")
            splitPDF(pdf_list[i], "./export/")
            print("\n")

        print("多项文件已保存至", ExportDir)
    elif len(pdf_list) == 1:
        splitPDF(pdf_list[0])

    print("已完成")
