---
title: Agentic RAG Data Synthesis Pipeline  
icon: solar:palette-round-linear
createTime: 2025/06/16 13:08:42  
permalink: /en/guide/agenticrag_pipeline/  
---

# Agentic RAG Data Synthesis Pipeline

## 1. Overview

The **Agentic RAG Data Synthesis Pipeline** is an end-to-end framework to:  
- Support RL-based agentic RAG training.
- Generate high-quality pairs of questions and answers from provided text contents.

This pipeline only need text contexts for generating high-quality questions and answers for further training  

---

## 2. Data Flow and Pipeline Logic

### 1. **Input Data**

The input data for the pipeline includes the following fields:

* **text**: various text contents 

These input data can be stored in designated files (such as `json` or `jsonl`) and managed and read via the `FileStorage` object. In the provided example, the default data path is loaded. In practical use, you can modify the path to load custom data and cache paths:

```python
self.storage = FileStorage(
    first_entry_file_name="../dataflow/example/AgenticRAGPipeline/pipeline_small_chunk.json",
    cache_path="./cache_local",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl",
)
```

### 2. **内容选择**


#### 2.1 **选择内容**


流程的第一步是使用 **内容选择器** 操作符（`ContentChooser`）从大型数据集中选择一部分文本内容。此步骤至关重要，因为它决定了哪些文本内容将用于后续的生成流程。


**功能：**


* 从一组文本上下文中识别并选择具有代表性的文本内容。


**输入**：原始文本内容


**输出**：已选择的文本内容




### 3. **问答生成**


#### 3.1 **自动提示生成**


流程的第二步是使用 **自动提示生成器** 操作符（`AutoPromptGenerator`）为问答生成自动生成专用提示语。此步骤确保每个被选中的文本内容都配有合适的提示语，以便后续的问答生成。


**功能：**


* 为每个被选中的文本内容自动生成合适的提示语，引导问答生成过程。


**输入**：已选择的文本内容  
**输出**：为每个文本内容生成的提示语


---


#### 3.2 **问答对生成**


流程的第三步是使用 **问答生成器** 操作符（`QAGenerator`）为每个文本内容及其对应的提示语生成问答对。此步骤产出后续评估和使用的核心数据。


**功能：**


* 根据文本内容和生成的提示语，生成问题及其对应的答案。


**输入**：已选择的文本内容及其生成的提示语  
**输出**：生成的问答对


---


#### 3.3 **问答对评分**


流程的第四步是使用 **问答评分器** 操作符（`QAScorer`）对生成的问答对进行质量评估。此步骤为每个问答对提供多维度的评分和反馈，支持进一步筛选和改进。


**功能：**


* 从多个维度（如问题质量、答案一致性、答案可验证性和下游价值）评估生成的问答对，并提供评分和详细反馈。


**输入**：生成的问答对  
**输出**：每个问答对的评估分数和反馈






## 3. 运行流程


运行完整流程：


```bash
cd test
python test_agentic_rag.py
```