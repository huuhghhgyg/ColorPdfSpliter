#!/usr/bin/python

# 导入需要的模块
import os  # pyodide需要，否则处理完成会报错
import pymupdf
import numpy as np

# 参数设置（对Web版生效，本地命令行参数设置在cli.py中）
RGBDiff = 30  # RGB颜色总差异之和


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


# progress_display_cli在cli.py中定义


def progress_display_web(value, total):
    print("检测页面：", current, "/", total)


def splitPDF(file, fn_progress, exportdir="", duplex=False):
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

    # 双面打印
    if duplex:
        for idx in range(0, len(doc), 2):
            front_page = doc[idx]
            if idx == len(doc) - 1:
                back_page = doc[idx]
            else:
                back_page = doc[idx + 1]

            # 判断正反两面是否有彩色页面
            if isColorPage(front_page) or isColorPage(back_page):
                # 如果有，将正反两页添加到彩色pdf文件中
                color_doc.insert_pdf(
                    doc, from_page=front_page.number, to_page=back_page.number
                )
                count["color"] = count["color"] + 2
            else:
                # 如果没有，将正反两页添加到非彩色pdf文件中
                gray_doc.insert_pdf(
                    doc, from_page=front_page.number, to_page=back_page.number
                )
                count["gray"] = count["gray"] + 2
            count["page"] = count["page"] + 2
            # print("检测页面：", count['page'],'/',len(doc))
            fn_progress(min(count["page"], len(doc)), len(doc), doc.name)
    else:
        for page in doc:
            count["page"] = count["page"] + 1
            # print("检测页面：", count['page'],'/',len(doc))

            # 判断页面是否为彩色页面
            if isColorPage(page):
                # 如果是，将页面添加到彩色pdf文件中
                color_doc.insert_pdf(doc, from_page=page.number, to_page=page.number)
                count["color"] = count["color"] + 1
            else:
                # 如果不是，将页面添加到非彩色pdf文件中
                gray_doc.insert_pdf(doc, from_page=page.number, to_page=page.number)
                count["gray"] = count["gray"] + 1

            fn_progress(count["page"], len(doc), doc.name)

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


def splitPDFSegmented(file, fn_progress, exportdir="", duplex=False):
    """
    按颜色连续段落分割PDF，生成多个编号文件以保持原始顺序。

    例如：页码 [B,B,C,C,B,C,B,B] 会生成：
      01_黑白.pdf (第1-2页)
      02_彩色.pdf (第3-4页)
      03_黑白.pdf (第5页)
      04_彩色.pdf (第6页)
      05_黑白.pdf (第7-8页)
    按编号顺序打印即可恢复原始顺序。
    """
    doc = pymupdf.open(file)
    total = len(doc)

    # 第一步：判断每页/每张纸是否为彩色
    groups = []  # [(is_color, [page_numbers]), ...]

    if duplex:
        for idx in range(0, total, 2):
            front_page = doc[idx]
            back_page = doc[idx + 1] if idx + 1 < total else doc[idx]
            is_color = isColorPage(front_page) or isColorPage(back_page)
            pages = [idx, idx + 1] if idx + 1 < total else [idx]
            groups.append((is_color, pages))
    else:
        for page in doc:
            groups.append((isColorPage(page), [page.number]))

    if not groups:
        doc.close()
        return

    # 第二步：合并连续同色页面为段落
    segments = []
    cur_color = groups[0][0]
    cur_pages = []

    for is_color, pages in groups:
        if is_color == cur_color:
            cur_pages.extend(pages)
        else:
            segments.append((cur_color, cur_pages[:]))
            cur_color = is_color
            cur_pages = pages[:]

    segments.append((cur_color, cur_pages[:]))

    # 第三步：保存每个段落
    print(f"文件 {file} 颜色段落数：{len(segments)}")
    for i, (is_color, pages) in enumerate(segments, 1):
        seg_name = "彩色" if is_color else "黑白"
        outfile = f"{file[:-4]}_{i:02d}_{seg_name}.pdf"

        out_doc = pymupdf.open()
        out_doc.insert_pdf(doc, from_page=pages[0], to_page=pages[-1])

        if is_color:
            print(f"  保存彩色段落 #{i}: 第 {pages[0] + 1}-{pages[-1] + 1} 页 → {outfile}")
        else:
            print(f"  保存黑白段落 #{i}: 第 {pages[0] + 1}-{pages[-1] + 1} 页 → {outfile}")

        out_doc.save(exportdir + outfile)
        out_doc.close()
        fn_progress(i, len(segments), doc.name)

    total_color = sum(1 for is_c, _ in segments if is_c)
    total_bw = len(segments) - total_color
    print(f"✅ 文件 {file} 分割完成：共 {len(segments)} 段（彩色 {total_color} 段，黑白 {total_bw} 段）")
    doc.close()


# 总流程：本地运行版用cli.py，web版直接调用函数处理
