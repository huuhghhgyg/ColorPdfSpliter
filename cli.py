from ColorPdfSpliter import *

# cli总流程
if __name__ == "__main__":
    import os
    import sys
    import glob

    pdf_list = glob.glob("*.pdf")

    if len(pdf_list) == 0:  # 没有pdf文件
        print("未检测到当前目录中存在pdf文件")
        os.system("pause")
        exit()

    # 判断是否双面打印
    if_duplex = sys.argv[-1] == "duplex"

    if len(pdf_list) > 1:
        # 判断批量输出目录是否存在
        if not os.path.exists(ExportDir):
            os.mkdir(ExportDir)

        for i in range(len(pdf_list)):
            print(f"[{i + 1}/{len(pdf_list)}] 正在处理: {pdf_list[i]}")
            splitPDF(pdf_list[i], progress_display_cli, "./export/", duplex=if_duplex)
            print("\n")

        print("多项文件已保存至", ExportDir)
    elif len(pdf_list) == 1:
        splitPDF(pdf_list[0], progress_display_cli, duplex=if_duplex)

    print("已完成")
