import fitz  # PyMuPDF
import numpy as np

def _is_color_page(page, rgb_diff_threshold):
    """
    判断一个页面是否为彩色页面 (内部函数)。
    """
    pix = page.get_pixmap()
    if pix.n > 1:
        arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
        gray = np.dot(arr[..., :3], [0.299, 0.587, 0.114])
        diff = np.abs(arr[..., :3] - gray[..., None]).sum(axis=2)
        if np.any(diff > rgb_diff_threshold):
            return True
    return False

def split_pdf_by_color(
    pdf_bytes: bytes,
    rgb_diff: int = 30,
    is_duplex: bool = False,
    progress_callback=None
):
    """
    根据颜色分离PDF页面。

    Args:
        pdf_bytes (bytes): 输入的PDF文件内容的字节流。
        rgb_diff (int): RGB颜色差异阈值。
        is_duplex (bool): 是否为双面打印模式。
        progress_callback (function, optional): 进度回调函数，接收 (current, total)。

    Returns:
        dict: 一个字典，键为文件名，值为文件内容的字节流。
              例如: {'color.pdf': b'...' , 'bw.pdf': b'...'}
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    total_pages = len(doc)
    
    color_pages = []
    bw_pages = []
    
    # 双面模式
    if is_duplex:
        for i in range(0, total_pages, 2):
            front_page = doc[i]
            # 处理奇数页的最后一张
            back_page = doc[i + 1] if i + 1 < total_pages else front_page
            
            is_front_color = _is_color_page(front_page, rgb_diff)
            is_back_color = _is_color_page(back_page, rgb_diff) if i + 1 < total_pages else is_front_color
            
            if is_front_color or is_back_color:
                color_pages.extend(range(i, min(i + 2, total_pages)))
            else:
                bw_pages.extend(range(i, min(i + 2, total_pages)))
                
            if progress_callback:
                progress_callback(min(i + 2, total_pages), total_pages)
    # 单面模式
    else:
        for i, page in enumerate(doc):
            if _is_color_page(page, rgb_diff):
                color_pages.append(i)
            else:
                bw_pages.append(i)
            
            if progress_callback:
                progress_callback(i + 1, total_pages)

    output_files = {}

    # 保存彩色文件
    if color_pages:
        color_doc = fitz.open()
        color_doc.insert_pdf(doc, from_page=0, to_page=total_pages-1, select=color_pages)
        output_files['color'] = {
            "bytes": color_doc.tobytes(),
            "count": len(color_pages)
        }
        color_doc.close()
        
    # 保存黑白文件
    if bw_pages:
        bw_doc = fitz.open()
        bw_doc.insert_pdf(doc, from_page=0, to_page=total_pages-1, select=bw_pages)
        output_files['bw'] = {
            "bytes": bw_doc.tobytes(),
            "count": len(bw_pages)
        }
        bw_doc.close()

    doc.close()
    return output_files