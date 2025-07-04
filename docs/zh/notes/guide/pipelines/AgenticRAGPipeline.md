---
title: Agentic RAG数据合成流程  
icon: solar:palette-round-linear
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

### 2. **内容选择**

#### 2.1 **选择内容**

流程的第一步是使用 **内容选择器** 算子（`ContentChooser`）从大型数据集中选择一部分文本内容。这一步至关重要，因为它决定了哪些文本内容将用于后续的生成流程。

**功能：**

* 从一组文本上下文中识别并选择具有代表性的文本内容。

**输入**：原始文本内容

**输出**：已选择的文本内容

```python
content_chooser = ContentChooser(embedding_model_path="your_embedding_model_path")
result = content_chooser.run(
            storage = self.storage.step(),
            input_key = "text",
            num_samples = 5,
            method = "random"
          ) 
```

---

### 3. **问答生成**

#### 3.1 **自动提示生成**

流程的第二步是使用 **自动提示生成器** 算子（`AutoPromptGenerator`）为问答生成自动生成专用提示语。这一步确保每个被选中的文本内容都配有合适的提示语，以便后续的问答生成。

**功能：**

* 为每个被选中的文本内容自动生成合适的提示语，引导问答生成过程。

**输入**：已选择的文本内容  
**输出**：为每个文本内容生成的提示语

```python
prompt_generator = AutoPromptGenerator(api_llm_serving)
result = prompt_generator.run(
            storage = self.storage.step(),
            input_key = "text",
            output_key = "generated_prompt"
        )
```

---

#### 3.2 **问答对生成**

流程的第三步是使用 **问答生成器** 算子（`QAGenerator`）为每个文本内容及其对应的提示语生成问答对。这一步生成了后续评估和使用的核心数据。

**功能：**

* 根据文本内容和生成的提示语，生成问题及其对应的答案。

**输入**：已选择的文本内容及其生成的提示语  
**输出**：生成的问答对

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

---

#### 3.3 **问答对评分**

流程的第四步是使用 **问答评分器** 算子（`QAScorer`）对生成的问答对进行质量评估。这一步为每个问答对提供多维度的评分和反馈，支持进一步筛选和改进。

**功能：**

* 从多个维度（如问题质量、答案契合度、答案可验证性和下游价值）对生成的问答对进行评估，并提供评分和详细反馈。

**输入**：生成的问答对  
**输出**：每个问答对的评估分数和反馈

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

---

## 3. 运行流程

运行完整流程：

```python
from dataflow.operators.generate.AgenticRAG import (
    AutoPromptGenerator,
    QAGenerator,
    QAScorer
)

from dataflow.operators.process.AgenticRAG import (
    ContentChooser,
)
from dataflow.utils.storage import FileStorage
from dataflow.llmserving import APILLMServing_request

class AgenticRAGPipeline():
    def __init__(self, llm_serving=None):

        self.storage = FileStorage(
            first_entry_file_name="../dataflow/example/AgenticRAGPipeline/pipeline_small_chunk.json",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl",
        )
        if llm_serving is None:
            api_llm_serving = APILLMServing_request(
                    api_url="your_api_url",
                    model_name="gpt-4o",
                    max_workers=100
            )
        else:
            api_llm_serving = llm_serving

        self.content_chooser_step1 = ContentChooser(embedding_model_path="your_embedding_model_path")

        self.prompt_generator_step2 = AutoPromptGenerator(api_llm_serving)

        self.qa_generator_step3 = QAGenerator(api_llm_serving)

        self.qa_scorer_step4 = QAScorer(api_llm_serving)
        
    def forward(self):

        self.content_chooser_step1.run(
            storage = self.storage.step(),
            input_key= "text",
            num_samples=5,
            method= "random"
        )

        self.prompt_generator_step2.run(
            storage = self.storage.step(),
            input_key = "text"
        )

        self.qa_generator_step3.run(
            storage = self.storage.step(),
            input_key="text",
            prompt_key="generated_prompt",
            output_quesion_key="generated_question",
            output_answer_key="generated_answer"
        )

        self.qa_scorer_step4.run(
            storage = self.storage.step(),
            input_question_key="generated_question",
            input_answer_key="generated_answer",
            output_question_quality_key="question_quality_grades",
            output_question_quality_feedback_key="question_quality_feedbacks",
            output_answer_alignment_key="answer_alignment_grades",
            output_answer_alignment_feedback_key="answer_alignment_feedbacks",
            output_answer_verifiability_key="answer_verifiability_grades",
        )
        
if __name__ == "__main__":
    model = AgenticRAGPipeline()
    model.forward()
```

---