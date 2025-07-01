import sys
import os
import glob
from src.color_pdf_spliter.processor import split_pdf_by_color

LEN_TITLE = 30  # title长度

def console_progress_bar(value, total, title=""):
    """一个用于在控制台显示进度条的回调函数"""
    percent = (value / total) * 100
    bar = "█" * int(percent // 2) + "-" * (50 - int(percent // 2))
    if len(title) > LEN_TITLE:
        title = title[:LEN_TITLE] + "..."
    print(f"\r|{bar}| {value}/{total} {title}", end="\r" if value < total else "\n")

def run_single_file(pdf_path, export_dir, is_duplex):
    """处理单个文件"""
    base_name = os.path.basename(pdf_path)
    print(f"正在处理: {base_name}")

    try:
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()

        # 调用核心库函数，并传入进度条回调
        results = split_pdf_by_color(
            pdf_bytes=pdf_bytes,
            is_duplex=is_duplex,
            progress_callback=lambda current, total: console_progress_bar(current, total, base_name)
        )

        file_base_name = os.path.splitext(base_name)[0]
        
        # 保存黑白文件
        if 'bw' in results:
            bw_path = os.path.join(export_dir, f"{file_base_name}_黑白.pdf")
            with open(bw_path, 'wb') as f:
                f.write(results['bw']['bytes'])
            print(f"正在保存黑白页面 (共 {results['bw']['count']} 页): {bw_path}")
        else:
            print(f"文件 {base_name} 分割后不存在黑白页面。")

        # 保存彩色文件
        if 'color' in results:
            color_path = os.path.join(export_dir, f"{file_base_name}_彩色.pdf")
            with open(color_path, 'wb') as f:
                f.write(results['color']['bytes'])
            print(f"正在保存彩色页面 (共 {results['color']['count']} 页): {color_path}")
        else:
            print(f"文件 {base_name} 分割后不存在彩色页面。")
            
    except Exception as e:
        print(f"\n处理文件 {base_name} 时发生错误: {e}")

def main():
    """程序主入口"""
    pdf_list = glob.glob("*.pdf")

    if not pdf_list:
        print("未检测到当前目录中存在PDF文件。")
        if os.name == 'nt':
            os.system("pause")
        return

    is_duplex = "duplex" in sys.argv
    if is_duplex:
        print("双面模式已开启。")

    if len(pdf_list) > 1:
        export_dir = "./export"
        if not os.path.exists(export_dir):
            os.mkdir(export_dir)
        print(f"检测到多个文件，输出将保存到 '{export_dir}' 文件夹。")
        
        for i, pdf_file in enumerate(pdf_list):
            print(f"\n--- [{i + 1}/{len(pdf_list)}] ---")
            run_single_file(pdf_file, export_dir, is_duplex)
    else:
        # 单文件模式，直接输出到当前目录
        run_single_file(pdf_list[0], ".", is_duplex)

    print("\n已完成所有任务。")
    if os.name == 'nt':
        os.system("pause")

if __name__ == "__main__":
    main()