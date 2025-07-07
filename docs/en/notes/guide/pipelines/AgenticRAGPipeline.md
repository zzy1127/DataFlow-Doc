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

### 2. **Content Selection**

#### 2.1 **Selecting Content**

The first step of the process is to use the **Content Chooser** operator (`ContentChooser`) to select a portion of text content from a large dataset. This step is crucial because it determines which text content will be used in the subsequent generation process.

**Functionality:**

* Identifies and selects representative text content from a set of textual contexts.

**Input:** Original text content

**Output:** Selected text content

```python
content_chooser = ContentChooser(num_samples = 5, method = "random", embedding_model_path = "your_embedding_model_path")
result = content_chooser.run(
            storage = self.storage.step(),
            input_key = "text",
          ) 
```

### 3. **Question and Answer Generation**

#### 3.1 **Automatic Prompt Generation**

The second step of the process is to use the **Automatic Prompt Generator** operator (`AutoPromptGenerator`) to automatically generate dedicated prompts for question and answer generation. This step ensures that each selected text content is paired with an appropriate prompt for the subsequent Q&A generation.

**Functionality:**

* Automatically generates suitable prompts for each selected text content to guide the Q&A generation process.

**Input:** Selected text content  
**Output:** Generated prompts for each text content

```python
prompt_generator = AutoPromptGenerator(api_llm_serving)
result = prompt_generator.run(
            storage = self.storage.step(),
            input_key = "text",
            output_key = "generated_prompt"
        )
```

---

#### 3.2 **Q&A Pair Generation**

The third step of the process is to use the **Q&A Generator** operator (`QAGenerator`) to generate Q&A pairs for each text content and its corresponding prompt. This step produces the core data for subsequent evaluation and use.

**Functionality:**

* Generates questions and their corresponding answers based on the text content and the generated prompts.

**Input:** Selected text content and its generated prompts  
**Output:** Generated Q&A pairs

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

#### 3.3 **Q&A Pair Scoring**

The fourth step of the process is to use the **Q&A Scorer** operator (`QAScorer`) to evaluate the quality of the generated Q&A pairs. This step provides multi-dimensional scores and feedback for each Q&A pair, supporting further filtering and improvement.

**Functionality:**

* Evaluates the generated Q&A pairs from multiple dimensions (such as question quality, answer consistency, answer verifiability, and downstream value), and provides scores and detailed feedback.

**Input:** Generated Q&A pairs  
**Output:** Evaluation scores and feedback for each Q&A pair

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

## 3. Running the Process

Run the complete process:

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

        self.content_chooser_step1 = ContentChooser(num_samples=5,
            method= "random", embedding_model_path="your_embedding_model_path")

        self.prompt_generator_step2 = AutoPromptGenerator(api_llm_serving)

        self.qa_generator_step3 = QAGenerator(api_llm_serving)

        self.qa_scorer_step4 = QAScorer(api_llm_serving)
        
    def forward(self):

        self.content_chooser_step1.run(
            storage = self.storage.step(),
            input_key= "text"
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