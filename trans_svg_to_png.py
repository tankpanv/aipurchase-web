import os
from pathlib import Path
import cairosvg

def convert_svg_to_png(input_dir, output_dir, scale=2.0):
    """
    将指定目录（包括子目录）中的所有 SVG 文件转换为 PNG 格式。
    
    参数:
        input_dir (str): 输入目录（包含 SVG 文件）
        output_dir (str): 输出目录（存放转换后的 PNG 文件）
        scale (float): 缩放因子（默认 2.0，提高 PNG 分辨率）
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # 遍历所有子目录中的 SVG 文件
    for svg_file in input_path.glob("**/*.svg"):
        # 计算相对路径，以保持目录结构
        relative_path = svg_file.relative_to(input_path)
        png_file = output_path / relative_path.with_suffix(".png")
        
        # 确保输出目录存在
        png_file.parent.mkdir(parents=True, exist_ok=True)
        
        # 转换 SVG 到 PNG
        try:
            cairosvg.svg2png(
                url=str(svg_file),
                write_to=str(png_file),
                scale=scale  # 提高分辨率
            )
            print(f"转换成功: {svg_file} -> {png_file}")
        except Exception as e:
            print(f"转换失败: {svg_file} - {e}")

if __name__ == "__main__":
    input_directory = "RemixIcon"
    output_directory = "RemixIcon_PNG"
    
    # 调用转换函数
    convert_svg_to_png(input_directory, output_directory, scale=2.0)
    print("所有 SVG 转换完成！")