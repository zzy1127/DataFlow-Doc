---
title: 推理数据合成流程  
icon: mdi:brain  
createTime: 2025/06/16 13:08:42  
permalink: /zh/guide/agenticrag_pipeline/  
---

# Agentic RAG 数据合成流程

## 1. 概述

**Agentic RAG 数据合成流程**是一个端到端的框架，用于：  
- 支持基于强化学习的 Agentic RAG 训练。
- 从提供的文本内容中生成高质量的问题和答案对。

该流程只需要文本上下文即可生成高质量的问题和答案，用于后续训练。

---

## 2. 数据流与流程逻辑

### 1. **输入数据**

该流程的输入数据包括以下字段：

* **text**：各种文本内容

这些输入数据可以存储在指定的文件中（如 `json` 或 `jsonl`），并通过 `FileStorage` 对象进行管理和读取。在提供的示例中，默认数据路径被加载。在实际使用中，你可以修改路径以加载自定义数据和缓存路径：

```python
self.storage = FileStorage(
    first_entry_file_name="../dataflow/example/AgenticRAGPipeline/pipeline_small_chunk.json",
    cache_path="./cache_local",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl",
)
```

### 2. **Content Choosing**

#### 2.1 **Choose Contents**

The first step of the pipeline involves selecting a subset of text content from a large dataset using the **Content Chooser** operator (`ContentChooser`). This step is crucial, as it determines which text contents will be used for subsequent generation processes.

**Function:**

* identifies and selects representative text content from a set of text contexts.

**Input**: Original text contents

**Output**: Selected text contents


### 3. **Questions and Answers Generation**

#### 3.1 **Auto Prompt Generation**

The second step of the pipeline is to automatically generate specialized prompts for question-answer creation using the **AutoPromptGenerator** operator (`AutoPromptGenerator`). This step ensures that each selected text content is paired with a suitable prompt for downstream QA generation.

**Function:**

* automatically generates a suitable prompt for each selected text content to guide the question-answer generation process.

**Input**: Selected text contents  
**Output**: Generated prompts for each text content

---

#### 3.2 **Question-Answer Generation**

The third step of the pipeline is to generate question-answer pairs for each text content and its corresponding prompt using the **QAGenerator** operator (`QAGenerator`). This step produces the core data for further evaluation and use.

**Function:**

* generates a question and its corresponding answer based on the text content and the generated prompt.

**Input**: Selected text contents and their generated prompts  
**Output**: Generated question-answer pairs

---

#### 3.3 **Question-Answer Scoring**

The fourth step of the pipeline is to evaluate the quality of the generated question-answer pairs using the **QAScorer** operator (`QAScorer`). This step provides multiple scores and feedback for each QA pair, supporting further filtering and improvement.

**Function:**

* evaluates the generated question-answer pairs on multiple dimensions, such as question quality, answer alignment, answer verifiability, and downstream value, and provides both scores and detailed feedback.

**Input**: Generated question-answer pairs  
**Output**: Evaluation scores and feedback for each QA pair



## 3. Running the Pipeline

Run the full pipeline with:

```bash
cd test
python test_agentic_rag.py
```

---