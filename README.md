# PDF 转 JPG 高分辨率转换器

*[English Version](README.en.md)*

这是一个基于网页的PDF转JPG转换工具，专注于保持最高分辨率和图像质量。

## 最新更新

- 已更新至最新的PDF.js版本 (5.2.133)，提供更好的性能和兼容性
- 使用ES模块加载PDF.js，更符合现代Web标准
- 优化了界面反应速度和转换流程

## 功能特点

- 直接在浏览器中转换，无需上传文件到服务器
- 支持高达1200 DPI的高分辨率输出
- 可调整JPEG压缩质量，最高支持95%质量
- 支持多页PDF文件转换
- 支持单张下载或批量打包下载
- 简洁现代的用户界面
- 支持拖放文件上传

## 技术栈

- 纯前端实现，使用HTML, CSS和JavaScript
- 使用PDF.js (5.2.133) 进行PDF渲染
- 使用JSZip处理多文件打包下载
- 使用Canvas API进行图像处理和导出

## 如何使用

1. 打开index.html文件
2. 拖放PDF文件到指定区域或点击浏览文件
3. 选择所需的DPI（分辨率）和JPG质量
4. 点击"转换"按钮
5. 转换完成后，可以预览生成的图像
6. 单独下载某一页或使用"下载全部JPG"按钮下载ZIP压缩包

## 本地运行

由于这是一个纯前端项目，您可以直接在浏览器中打开index.html文件。不过，为避免可能的跨域问题，建议使用本地服务器：

```bash
# 安装依赖 (如果您下载了项目并想使用package.json中的依赖)
npm install

# 使用项目自带的Node.js服务器
node server.js

# 或使用Python启动简易HTTP服务器
python -m http.server

# 或使用Node.js的http-server (需要先安装)
npx http-server
```

## 常见问题解决

### PDF.js库加载问题

如果遇到 "pdfjsLib is not defined" 错误，可能是由于以下原因：

1. **网络连接问题**：确保您的网络可以访问CDN资源
2. **浏览器兼容性**：确保使用支持ES模块的现代浏览器（Chrome、Firefox、Safari、Edge最新版）
3. **脚本加载顺序**：如果在本地服务器中运行，确保使用正确的方式加载资源

**解决方案**：

- 使用fallback.html (离线版) 文件，它包含本地库的引用
- 或者下载PDF.js库 (https://mozilla.github.io/pdf.js/getting_started/)，放在项目的libs目录中，然后更新index.html中的引用
- 确保您的服务器支持`.mjs`文件的MIME类型为`application/javascript`

### 内存限制问题

转换高分辨率的多页PDF可能会消耗大量内存。如果遇到浏览器崩溃或性能问题：

- 降低DPI设置 (使用300或600 DPI)
- 分批处理大型PDF文件
- 使用最新版本的浏览器，它们通常有更好的内存管理
- 在"并行处理"设置中选择更低的值以减少内存使用

## 注意事项

- 大型PDF文件或高分辨率设置可能需要较长处理时间
- 处理过程中的内存使用量与PDF文件大小、页数和选择的DPI成正比
- 所有转换都在用户浏览器中进行，不会上传到任何服务器

## 许可证

MIT 