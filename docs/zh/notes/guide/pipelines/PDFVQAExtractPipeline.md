---
title: PDF中的VQA提取流水线
createTime: 2025/11/17 14:01:55
permalink: /zh/guide/vqa_extract_optimized/
icon: heroicons:document-text
---

# PDF VQA 提取流水线

## 1. 概述

**PDF VQA 提取流水线** 可以自动从教材类 PDF 中提炼高质量问答对，串联了 MinerU 布局解析、面向学科的 LLM 抽取以及结构化后处理。典型场景包括：

- 构建数学 / 物理 / 化学等学科的题库
- 生成保留图片引用的 问答对Markdown / JSONL 资料

核心阶段：

1. **文档布局解析**：通过 MinerU 输出结构化 JSON 与页面切图。
2. **LLM 问答抽取**：基于学科定制提示词，解析题目、答案、解答。
3. **合并与过滤**：整合问答流、过滤无效条目、导出 JSONL/Markdown 以及图片。

## 2. 快速开始

### 步骤 1：安装 Dataflow（以及 MinerU）
```shell
pip install open-dataflow
pip install mineru[pipeline]
mineru-models-download
```
`vlm-vllm-engine` 模式需要 GPU。

### 步骤 2：创建工作区
```shell
mkdir run_dataflow
cd run_dataflow
```

### 步骤 3：初始化 Dataflow
```shell
dataflow init
```
初始化后即可在 `pipelines/` 或任意自定义目录编写脚本。

### 步骤 4：配置 API 凭证
Linux / macOS:
```shell
export DF_API_KEY="sk-xxxxx"
```
Windows PowerShell:
```powershell
$env:DF_API_KEY = "sk-xxxxx"
```
在脚本中设置接口：
```python
self.llm_serving = APILLMServing_request(
    api_url="https://api.openai.com/v1/chat/completions",
    model_name="gemini-2.5-pro",
    max_workers=100,
)
```

### 步骤 5：一键运行
```bash
python pipelines/vqa_extract_optimized_pipeline.py
```
也可将各算子嵌入其他流程，下文详细介绍数据流。

## 3. 数据流与流水线逻辑

### 1. 输入数据

使用 JSONL 描述任务，支持两种模式：

- **题答分离**
  ```jsonl
  {"question_pdf_path": "/abs/path/questions.pdf", "answer_pdf_path": "/abs/path/answers.pdf", "subject": "math", "output_dir": "./output/math"}
  ```
- **题答混排**
  ```jsonl
  {"pdf_path": "/abs/path/qa_mixed.pdf", "subject": "physics", "output_dir": "./output/physics"}
  ```

`FileStorage` 负责读取与缓存：
```python
self.storage = FileStorage(
    first_entry_file_name="./examples/VQA/vqa_extract_interleaved_test.jsonl",
    cache_path="./vqa_extract_optimized_cache",
    file_name_prefix="vqa",
    cache_type="jsonl",
)
```

### 2. 文档布局解析（MinerU）

对每个 PDF（题目、答案或混排）调用 `VQAExtractor` 内部的 `_extract_doc_layout`，MinerU 会产出：

- `<book>/<backend>/<book>_content_list.json`：结构化布局 token
- `<book>/<backend>/images/`：对应页面切图

可选后端：

- `vlm-transformers`：CPU/GPU 均可
- `vlm-vllm-engine`：高吞吐 GPU 模式（需 CUDA）

### 3. 问答抽取（VQAExtractor）

`VQAExtractor` 将布局 JSON 切块以控制 token，利用 `QAExtractPrompt` 生成学科提示，并通过 `APILLMServing_request` 批量调用 LLM。主要特性：

- 同时支持 `question_pdf_path`/`answer_pdf_path` 与单一 `pdf_path`（自动判定混排）。
- 将 MinerU 切图复制到 `output_dir/question_images`、`answer_images`。
- 解析 `<qa_pair>`、`<question>`、`<answer>`、`<solution>`、`<chapter>` 标签，并保留 `<pic>tag:box</pic>` 图片引用。

### 4. 后处理与产物

每个 `output_dir` 会得到：

1. `vqa_extracted_questions.jsonl`
2. `vqa_extracted_answers.jsonl`（分离模式）
3. `vqa_merged_qa_pairs.jsonl`
4. `vqa_filtered_qa_pairs.jsonl`
5. `vqa_filtered_qa_pairs.md`
6. `question_images/`、`answer_images/`

过滤逻辑：保留有题目且答案或解答非空的条目，并通过 `jsonl_to_md` 输出 Markdown 便于审阅。

## 4. 输出数据

筛选后的记录包含：

- `question`：题干文本（包含 `<pic>` 标签）
- `answer`：答案文本（若来自答案 PDF）
- `solution`：可选的解题过程
- `label`：原始编号，如“例 3”“习题 2”
- `chapter_title`：所在章节/小节标题

示例：
```json
{
  "question": "计算 $x$ 使得 $x^2-1=0$。",
  "answer": "$x = 1$ 或 $x = -1$",
  "solution": "因式分解 $(x-1)(x+1)=0$。",
  "label": "例1",
  "chapter_title": "第一章 二次方程"
}
```

## 5. 流水线示例

```python
import os
import sys

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from dataflow.serving import APILLMServing_request
from dataflow.utils.storage import FileStorage
from operators.vqa_extractor import VQAExtractor

class VQA_extract_optimized_pipeline:
    def __init__(self):
        self.storage = FileStorage(
            first_entry_file_name="./examples/VQA/vqa_extract_interleaved_test.jsonl",
            cache_path="./vqa_extract_optimized_cache",
            file_name_prefix="vqa",
            cache_type="jsonl",
        )

        self.llm_serving = APILLMServing_request(
            api_url="https://api.openai.com/v1/chat/completions",
            key_name_of_api_key="DF_API_KEY",
            model_name="gpt-4o",
            max_workers=100,
        )

        self.vqa_extractor = VQAExtractor(
            llm_serving=self.llm_serving
        )

    def forward(self):
        self.vqa_extractor.run(
            storage=self.storage.step(),
            question_pdf_path_key="question_pdf_path",
            answer_pdf_path_key="answer_pdf_path",
            pdf_path_key="pdf_path",
            subject_key="subject",
            output_dir_key="output_dir",
            output_jsonl_key="output_jsonl_path",
            mineru_backend='vlm-vllm-engine',
        )

if __name__ == "__main__":
    pipeline = VQA_extract_optimized_pipeline()
    pipeline.forward()
```

---

Pipeline 源码：`DataFlow/pipelines/vqa_extract_optimized_pipeline.py`

利用该流水线可直接从 PDF 教材中沉淀带图引用的结构化问答数据。
