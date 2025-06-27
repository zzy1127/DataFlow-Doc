---
title: AgenticRAG 算子
createTime: 2025/06/24 11:43:42
permalink: /zh/guide/agenticrag_operators/
---

# AgenticRAG 算子

## 概述

AgenticRAG 算子是一套专为 agentic RAG（检索增强生成）任务设计的工具，特别聚焦于从给定文本中生成问答（QA）样本，以支持基于强化学习的 agentic RAG 训练。这些算子主要分为两类：**数据生成算子（Generators）** 和 **处理算子（Processors）**

## 数据生成算子

数据生成算子负责生成与 RAG 相关的强化学习训练数据，包括自动提示词生成、问答生成和问答评分

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">应用类型</th>
      <th class="tg-0pky">描述</th>
      <th class="tg-0pky">官方仓库或论文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">AutoPromptGenerator</td>
      <td class="tg-0pky">提示词合成</td>
      <td class="tg-0pky">利用大语言模型为特定内容生成用于问答创建的提示词。</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QAGenerator</td>
      <td class="tg-0pky">问答生成</td>
      <td class="tg-0pky">使用大语言模型和生成的提示词，为给定文本内容生成问题和答案。</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QAScorer</td>
      <td class="tg-0pky">问答评分</td>
      <td class="tg-0pky">对问答对及其相关内容进行问题质量、答案一致性、答案可验证性和下游价值的评估。</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>



## 处理算子

处理算子主要负责选择合适的数据

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">应用类型</th>
      <th class="tg-0pky">描述</th>
      <th class="tg-0pky">官方仓库或论文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">ContentChooser</td>
      <td class="tg-0pky">内容选择器</td>
      <td class="tg-0pky">从更大的内容集合中选择一部分内容以供后续流程处理。</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>

## 算子接口使用说明

对于指定存储路径或调用模型的算子，我们提供了封装好的**模型接口**和**存储对象接口**。你可以通过如下方式为算子预定义模型 API 参数：

```python
from dataflow.llmserving import APILLMServing_request

api_llm_serving = APILLMServing_request(
                api_url="your_api_url",
                model_name="model_name",
                max_workers=5
        )
```

你可以通过如下方式为算子预定义存储参数：

```python
from dataflow.utils.storage import FileStorage

 self.storage = FileStorage(
            first_entry_file_name="your_file_path",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="json", # jsonl, json, ...
        )
```

下文中的 `api_llm_serving` 和 `self.storage` 即为此处定义的接口对象。完整的使用示例可见 `test/test_agentic_rag.py`

参数传递方面，算子对象的构造函数主要传递与算子配置相关的信息，可一次配置多次调用；而 `X.run()` 函数则传递与 IO 相关的 `key` 信息。具体细节可见下方算子描述示例。

## 算子详细说明

### 数据生成算子

#### 1. AutoPromptGenerator

**功能描述**  该算子专为根据给定文本内容生成用于创建问答对的专用提示词而设计。

**输入参数**

- `__init__()`
  - `llm_serving`:  使用的大语言模型接口对象（默认：上文预定义值）
- `run()`
  - `storage`: 存储接口对象（默认：上文预定义值）
  - `input_key`: 输入文本内容字段名（默认："text"）
  - `output_key`: 输出生成提示词字段名（默认："generated_prompt"）

**主要特性**

- 支持多种类型的文本内容
- 自动生成合适的提示词

**使用示例**

```python
prompt_generator = AutoPromptGenerator(api_llm_serving)
result = prompt_generator.run(
            storage = self.storage.step(),
            input_key = "text",
            output_key = "generated_prompt"
        )
```

#### 2. QAGenerator

**函数描述：**  
该算子用于为特定内容生成一对问题和答案。

**输入参数：**

- `__init__()`
  - `llm_serving`：要使用的大语言模型接口对象（默认值：如上所述的预定义值）
- `run()`
  - `storage`：存储接口对象（默认值：如上所述的预定义值）
  - `input_key`：输入文本内容字段名（默认值："text"）
  - `prompt_key`：输出提示字段名（默认值："generated_prompt"）
  - `output_quesion_key`：输出问题字段名（默认值："generated_question"）
  - `output_answer_key`：输出答案字段名（默认值："generated_answer"）

**主要特性：**

- 支持多种类型的文本内容
- 能够生成合适的问题和答案对

**使用示例：**

```python
qa_gen = QAGenerator(llm_serving=api_llm_serving)
result = qa_gen.run(
            storage = self.storage.step(),
            input_key="text",
            prompt_key="generated_prompt",
            output_quesion_key="generated_question",
            output_answer_key="generated_answer"
          )
```

#### 3. QAScorer

**函数描述：**  
该算子用于为生成的问题和答案对打出多项评估分数。

**输入参数：**

- `__init__()`
  - `llm_serving`：要使用的大语言模型接口对象（默认值：如上所述的预定义值）
- `run()`
  - `storage`：存储接口对象（默认值：如上所述的预定义值）
  - `input_question_key`：包含生成问题的输入文本内容字段名（默认值："generated_question"）
  - `input_answer_key`：包含生成答案的输入文本内容字段名（默认值："generated_answer"）
  - `output_question_quality_key`：问题质量评分的输出字段名（默认值："question_quality_grades"）
  - `output_question_quality_feedback_key`：问题质量详细反馈的输出字段名（默认值："question_quality_feedbacks"）
  - `output_answer_alignment_key`：答案契合度评分的输出字段名（默认值："answer_alignment_grades"）
  - `output_answer_alignment_feedback_key`：答案契合度详细反馈的输出字段名（默认值："answer_alignment_feedbacks"）
  - `output_answer_verifiability_key`：答案可验证性评分的输出字段名（默认值："answer_verifiability_grades"）
  - `output_answer_verifiability_feedback_key`：答案可验证性详细反馈的输出字段名（默认值："answer_verifiability_feedbacks"）
  - `output_downstream_value_key`：下游价值评分的输出字段名（默认值："downstream_value_grades"）
  - `output_downstream_value_feedback_key`：下游价值详细反馈的输出字段名（默认值："downstream_value_feedbacks"）

**主要特性：**

- 生成多项有用的评分，便于后续筛选

**使用示例：**

```python
qa_scorer = QAScorer(llm_serving=api_llm_serving)
result = qa_scorer.run(
            storage = self.storage.step(),
            input_question_key="generated_question",
            input_answer_key="generated_answer",
            output_question_quality_key="question_quality_grades",
            output_question_quality_feedback_key="question_quality_feedbacks",
            output_answer_alignment_key="answer_alignment_grades",
            output_answer_alignment_feedback_key="answer_alignment_feedbacks",
            output_answer_verifiability_key="answer_verifiability_grades",
          )
```

### 处理算子

#### 1. ContentChooser

**函数描述：**  
该算子用于从一组文本内容中识别并选择具有代表性的文本内容。

**输入参数：**

- `run()` 
  - `storage`：存储接口对象（默认值：如上所述的预定义值）
  - `input_key`：输入文本内容字段名（默认值："text"）
  - `num_samples`：选择的样本数量
  - `method`：用于从原始文本内容中选择的方法（默认值：'random'）

**主要特性：**

- 支持随机选择和kmean聚类选择
- 支持多种嵌入模型

**使用示例：**

```python
content_chooser = ContentChooser(embedding_model_path="your_embedding_model_path")
result = content_chooser.run(
            storage = self.storage.step(),
            input_key = "text",
            num_samples = 5,
            method = "random"
          ) 
```