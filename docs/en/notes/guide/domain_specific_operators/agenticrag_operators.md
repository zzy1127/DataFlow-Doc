---
title: AgenticRAG Operators
createTime: 2025/06/24 11:43:42
permalink: /en/guide/agenticrag_operators/
---

# AgenticRAG Operators

## Overview

AgenticRAG Operators are a specialized suite of tools designed for agentic RAG (Retrieval-Augmented Generation) tasks, with a particular focus on generating question-and-answer (QA) samples from provided text to support RL-based agentic RAG training. These operators are primarily categorized into two groups: **Data Generation Operators (Generators)** and **Processing Operators (Processors)**.

- 🚀 **Independent Innovation**: Core algorithms developed from scratch, filling existing algorithmic gaps or further improving performance, breaking through current performance bottlenecks.
- ✨ **Open Source First**: First integration of this operator into mainstream community frameworks, facilitating use by more developers and achieving open-source sharing.

## Data Generation Operators

Data Generation Operators are responsible for producing RAG-related RL training data, including automated prompt creation, question and answer generation, and QA scoring.

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Application Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Official Repository or Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">AutoPromptGenerator🚀</td>
      <td class="tg-0pky">Prompt Synthesis</td>
      <td class="tg-0pky">Generates prompts for question and answer creation tailored to specific content by leveraging large language models.</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QAGenerator✨</td>
      <td class="tg-0pky">Question and Answer Generation</td>
      <td class="tg-0pky">Produces questions and answers for given text content using large language models and generated prompts.</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QAScorer✨</td>
      <td class="tg-0pky">Question and Answer Scoring</td>
      <td class="tg-0pky">Evaluates question quality, answer alignment, answer verifiability, and downstream value for QA pairs.</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>



## Processing Operators

Processing Operators are mainly tasked with choosing suitable data.

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Application Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Official Repository or Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">ContentChooser🚀</td>
      <td class="tg-0pky">Content chooser</td>
      <td class="tg-0pky">Selects a subset of content from a larger collection for further processing within the pipeline.</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>

## Operator Interface Usage Instructions

Specifically, for operators that specify storage paths or call models, we provide encapsulated **model interfaces** and **storage object interfaces**. You can predefine model API parameters for operators in the following way:

```python
from dataflow.llmserving import APILLMServing_request

api_llm_serving = APILLMServing_request(
                api_url="your_api_url",
                model_name="model_name",
                max_workers=5
        )
```

You can predefine storage parameters for operators in the following way:

```python
from dataflow.utils.storage import FileStorage

 self.storage = FileStorage(
            first_entry_file_name="your_file_path",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="json", # jsonl, json, ...
        )
```

The `api_llm_serving` and `self.storage` used in the following text are the interface objects defined here. Complete usage examples can be found in `test/test_agentic_rag.py`.

For parameter passing, the constructor of operator objects mainly passes information related to operator configuration, which can be configured once and called multiple times; while the `X.run()` function passes `key` information related to IO. Details can be seen in the operator description examples below.

## Detailed Operator Descriptions

### Data Generation Operators

#### 1. AutoPromptGenerator

**Function Description:**  This operator is specifically designed to generate specialized prompts for creating question-and-answer pairs based on given text content.

**Input Parameters:**

- `__init__()`
  - `llm_serving`: Large language model interface object to use (default: predefined value above)
- `run()`
  - `storage`: Storage interface object (default: predefined value above)
  - `input_key`: Input text content field name (default: "text")
  - `output_key`: Output generated prompt field name (default: "generated_prompt")

**Key Features:**

- Supports multiple types of text contents
- Automatically generates suitable prompts

**Usage Example:**

```python
prompt_generator = AutoPromptGenerator(api_llm_serving)
result = prompt_generator.run(
            storage = self.storage.step(),
            input_key = "text",
            output_key = "generated_prompt"
        )
```

#### 2. QAGenerator

**Function Description:** This operator generates a pair of question and answer for a special content.

**Input Parameters:**

- `__init__()`
  - `llm_serving`: Large language model interface object to use (default: predefined value above)
- `run()`
  - `storage`: Storage interface object (default: predefined value above)
  - `input_key`: Input text content field name (default: "text")
  - `prompt_key`: Output answer field name (default: "generated_prompt")
  - `output_quesion_key`: Output answer field name (default: "generated_question")
  - `output_answer_key`: Output answer field name (default: "generated_answer")

**Key Features:**

- Supports multiple types of text contents
- Generates suitable pairs of questions and answers

**Usage Example:**

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

**Function Description:** This operator generates multiple evaluation scores for the produced question-and-answer pairs.

**Input Parameters:**

- `__init__()`
  - `llm_serving`: Large language model interface object to use (default: predefined value above)
- `run()`
  - `storage`: Storage interface object (default: predefined value above)
  - `input_question_key`: Input text content field name containing the generated questions (default: "generated_question")
  - `input_answer_key`: Input text content field name containing the generated answers (default: "generated_answer")
  - `output_question_quality_key`: Output field name for question quality grades (default: "question_quality_grades")
  - `output_question_quality_feedback_key`: Output field name for detailed feedback on question quality (default: "question_quality_feedbacks")
  - `output_answer_alignment_key`: Output field name for answer alignment grades (default: "answer_alignment_grades")
  - `output_answer_alignment_feedback_key`: Output field name for detailed feedback on answer alignment (default: "answer_alignment_feedbacks")
  - `output_answer_verifiability_key`: Output field name for answer verifiability grades (default: "answer_verifiability_grades")
  - `output_answer_verifiability_feedback_key`: Output field name for detailed feedback on answer verifiability (default: "answer_verifiability_feedbacks")
  - `output_downstream_value_key`: Output field name for downstream value grades (default: "downstream_value_grades")
  - `output_downstream_value_feedback_key`: Output field name for detailed feedback on downstream value (default: "downstream_value_feedbacks")

**Key Features:**

- Generates multiple useful scores for further filtering

**Usage Example:**

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

### Processing Operators

#### 1. ContentChooser

**Function Description:** This operator identifies and selects representative text content from a set of text contexts.

**Input Parameters:**

- `run()` 
  - `storage`: Storage interface object (default: predefined value above)
  - `input_key`:  Input text content field name (default: "text")
  - `num_samples`: Numuber of choosen samples 
  - `method`: The method used to select from the original text contents (default: 'random')

**Key Features:**

- Supports random choose and kmean choose
- Supports a lot of embedding models

**Usage Example:**

```python
content_chooser = ContentChooser(embedding_model_path="your_embedding_model_path")
result = content_chooser.run(
            storage = self.storage.step(),
            input_key = "text",
            num_samples = 5,
            method = "random"
          ) 
```