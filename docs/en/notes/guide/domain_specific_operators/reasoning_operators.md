---
title: Reasoning Operators
createTime: 2025/06/24 11:43:42
permalink: /en/guide/Reasoning_operators/
---

# Reasoning Operators

## Overview

Strong reasoning operators are a specialized collection of operators designed for mathematical reasoning and problem-solving tasks. They are primarily divided into two categories: **Data Generation Operators (Generators)** and **Processing Operators (Processors)**. These operators can handle complex mathematical reasoning tasks, including answer generation, verification, filtering, and formatting, while supporting various mathematical representation formats.

## Data Generation Operators

Data generators are primarily responsible for generating various types of reasoning-related data, including answer generation, question generation, and more.

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
      <td class="tg-0pky">AnswerGenerator</td>
      <td class="tg-0pky">Answer Synthesis</td>
      <td class="tg-0pky">This operator generates standard answers for mathematical problems by calling large language models for step-by-step reasoning and computation.</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">PseudoAnswerGenerator</td>
      <td class="tg-0pky">Pseudo Answer Generation & Voting</td>
      <td class="tg-0pky">This operator generates multiple candidate answers and selects the optimal solution through statistical methods to achieve pseudo answer generation.</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QuestionGenerator</td>
      <td class="tg-0pky">Question Generation</td>
      <td class="tg-0pky">This operator generates new questions based on existing problems, supporting multiple generation strategies to ensure diversity.</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>



## Processing Operators

Processing operators are primarily responsible for processing, verifying, filtering, and formatting generated data.

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
      <td class="tg-0pky">AnswerFormatterFilter</td>
      <td class="tg-0pky">Format Validation</td>
      <td class="tg-0pky">This operator checks whether answer formats comply with standards, primarily verifying if mathematical answers contain correct \\boxed{} notation.</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerGroundTruthFilter</td>
      <td class="tg-0pky">Ground Truth Matching</td>
      <td class="tg-0pky">This operator compares predicted answers with ground truth answers, supporting both exact matching and mathematical verification methods.</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerJudger_MathVerify</td>
      <td class="tg-0pky">Mathematical Answer Verification</td>
      <td class="tg-0pky">This operator verifies answer correctness through symbolic computation, performing mathematical expression parsing and equivalence verification.</td>
      <td class="tg-0pky"><a href="https://github.com/huggingface/Math-Verify">Code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerNgramFilter</td>
      <td class="tg-0pky">Repetition Detection</td>
      <td class="tg-0pky">This operator filters answers based on n-gram repetition rates, detecting repetitive patterns and redundant content in responses.</td>
      <td class="tg-0pky"><a href="https://en.wikipedia.org/wiki/N-gram">Wiki</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerPipelineRoot</td>
      <td class="tg-0pky">Ground Truth Existence Classifier</td>
      <td class="tg-0pky">Root node of the answer processing pipeline, responsible for distributing input data to different processing branches based on the presence or absence of ground truth labels.</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerTokenLengthFilter</td>
      <td class="tg-0pky">Length Control</td>
      <td class="tg-0pky">This operator filters overly long answers based on token count, ensuring answer length remains within reasonable limits.</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QuestionFilter</td>
      <td class="tg-0pky">Question Validation</td>
      <td class="tg-0pky">This operator performs correctness checks on mathematical problems, including format compliance, semantic reasonableness, and condition consistency.</td>
      <td class="tg-0pky"><a href="https://github.com/scuuy/MathQ-Verify">Code</a></td>
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
            cache_type="jsonl", # jsonl, json, ...
        )
```

The `api_llm_serving` and `self.storage` used in the following text are the interface objects defined here. Complete usage examples can be found in `test/test_reasoning.py`.

For parameter passing, the constructor of operator objects mainly passes information related to operator configuration, which can be configured once and called multiple times; while the `X.run()` function passes `key` information related to IO. Details can be seen in the operator description examples below.

## Detailed Operator Descriptions

### Data Generation Operators

#### 1. AnswerGenerator

**Function Description:** This operator is specifically designed to generate standard answers for mathematical problems through large language model calls for step-by-step reasoning and precise computation.

**Input Parameters:**
- `__init__()`
  - `model_name`: Name of the large language model to use
- `run()`
  - `input_key`: Input question field name (default: "question")
  - `output_key`: Output answer field name (default: "generated_answer")


**Output Parameters:**

- `generated_answer`: Generated standard answer

**Key Features:**

- Supports multiple types of mathematical problems (algebra, geometry, probability and statistics, etc.)
- Employs Chain-of-Thought reasoning methodology
- Automatically generates detailed solution steps
- Supports multi-round reasoning and verification

**Usage Example:**

```python
answer_gen = AnswerGenerator(llm_serving=api_llm_serving)
result = answer_gen.run(
          storage=self.storage.step(),
          input_key="math_problem",
          output_key="solution"
          )
```

#### 2. PseudoAnswerGenerator

**Function Description:** This operator generates multiple candidate answers and uses statistical methods to select the optimal solution, achieving high-quality pseudo answer generation.

**Input Parameters:**

- `input_key`: Input question field name (default: "question")
- `output_key`: Output answer field name (default: "pseudo_answer")

**Output Parameters:**

- `pseudo_answer`: Selected optimal answer

**Key Features:**

- Multiple candidate answer generation strategies
- Consistency-based answer selection
- Uncertainty quantification support
- Adaptive sampling mechanisms

**Usage Example:**

```python
pseudo_gen = PseudoAnswerGenerator(llm_serving=api_llm_serving)
result = pseudo_gen.run(
          storage=self.storage.step(),
          input_key="problem_text",
          output_key="best_answer"
          )
```

#### 3. QuestionGenerator

**Function Description:** This operator can generate new related questions based on existing problems, supporting multiple generation strategies and difficulty control.

**Input Parameters:**

- `input_key`: Input original question field name (default: "source_question")
- `output_key`: Output new question field name (default: "generated_question")
- `num_questions`: Number of new questions to generate per problem (default: 3)

**Output Parameters:**

- `generated_questions`: List of generated new questions

**Key Features:**

- Diversified question generation strategies
- Automatic difficulty level adjustment
- Knowledge point coverage optimization
- Language expression diversity

**Usage Example:**

```python
question_gen = QuestionGenerator(
                num_prompts=1,  # from 1 to k
                llm_serving=api_llm_serving
                )
result = question_gen.run(
          storage=self.storage.step(),
          input_key="base_problem",
          output_key="new_problems"
          )
```

### Processing Operators

#### 1. AnswerFormatterFilter

**Function Description:** This operator is specifically designed to check the format compliance of mathematical answers, ensuring answers conform to standard mathematical representation formats.

**Input Parameters:**

- `input_key`: Input answer field name (default: "generated_cot")
- `result_key`: Result field name

**Output Parameters:**

- Returns 1 if format check passes, 0 otherwise

**Key Features:**

- Checks \\boxed{} notation format
- Verifies mathematical symbol correctness
- Supports multiple mathematical representation formats
- Automatic format correction suggestions

**Usage Example:**

```python
filter_op = AnswerFormatterFilter()
result = filter_op.run(
          storage=self.storage.step(),
          input_key="answer_text"
          ) 
```

#### 2. AnswerGroundTruthFilter

**Function Description:** This operator compares predicted answers with ground truth answers, supporting multiple comparison strategies.

**Input Parameters:**

- `test_answer_key`: Predicted answer field name (default: "generated_cot")
- `gt_answer_key`: Ground truth answer field name (default: "golden_answer")
- `compare_method`: Comparison method ("exact"/"math_verify")

**Output Parameters:**

- Returns 1 if match is successful, 0 otherwise

**Key Features:**

- Exact string matching
- Mathematical equivalence verification
- Numerical tolerance handling
- Symbolic comparison

**Usage Example:**

```python
filter_op = AnswerGroundTruthFilter(compare_method="math_verify")
result = filter_op.run(
          storage=self.storage.step(), 
          test_answer_key="pred_answer",
          gt_answer_key="true_answer"
          )
```

#### 3. AnswerJudger_MathVerify

**Function Description:** This operator verifies mathematical answer correctness through advanced symbolic computation, supporting equivalence judgment of complex mathematical expressions.

**Input Parameters:**

- `answer_key`: Answer field name to be verified
- `gt_key`: Ground truth answer field name

**Output Parameters:**

- `result_key`: Verification result field (True/False)

**Key Features:**

- Symbolic expression parsing
- Mathematical equivalence verification
- Numerical precision control
- Support for various mathematical functions

**Usage Example:**

```python
judger_op = AnswerJudger_MathVerify()
result = judger_op.run(
          storage=self.storage.step(),
          answer_key="student_answer",
          gt_key="correct_answer"
          )
```

#### 4. AnswerNgramFilter

**Function Description:** This operator detects repetitive patterns in answers based on n-gram statistical analysis, filtering low-quality repetitive content.

**Input Parameters:**

- `question_key`: Question field name (default: "instruction")
- `answer_key`: Answer field name (default: "generated_cot")
- `min_score`: Minimum acceptable score (default: 0.1)
- `max_score`: Maximum acceptable score (default: 1.0)
- `ngrams`: N-gram size (default: 5)

**Output Parameters:**

- Returns 1 if repetition rate score is within range, 0 otherwise

**Key Features:**

- N-gram repetition rate calculation
- Configurable threshold ranges
- Text preprocessing and cleaning
- Statistical analysis reporting

**Usage Example:**

```python
ngram_filter = AnswerNgramFilter(
                min_score=0.2,
                max_score=0.8,
                ngrams=3
                )
result = ngram_filter.run(
          storage=self.storage.step(),
          question_key="problem",
          answer_key="solution"
          )
```

#### 5. AnswerPipelineRoot

**Function Description:** Root node operator of the answer processing pipeline, responsible for intelligently distributing data to different processing branches.

**Input Parameters:**

- `input_answer_key`: Input answer field name (default: "output")
- `input_gt_key`: Input ground truth answer field name (default: "golden_answer")

**Output Parameters:**

- Multiple branch output file paths

**Key Features:**

- Intelligent data distribution
- Processing branches for with/without ground truth
- Answer extraction and cleaning
- Process state management

**Usage Example:**

```python
root_op = AnswerPipelineRoot()
result = root_op.run(
          storage=self.storage.step(),
          input_answer_key="raw_answer",
          input_gt_key="ground_truth"
          )
```

#### 6. AnswerTokenLengthFilter

**Function Description:** This operator controls answer length based on token count, filtering answers that are too long or too short.

**Input Parameters:**

- `input_key`: Input field name (default: "generated_cot")
- `max_answer_token_length`: Maximum token count (default: 8192)
- `tokenizer_dir`: Tokenizer path (default: "Qwen/Qwen2.5-0.5B-Instruct")

**Output Parameters:**

- Returns 1 if length meets requirements, 0 otherwise

**Key Features:**

- Precise token counting
- Configurable tokenizer
- Batch processing optimization
- Length statistics reporting

**Usage Example:**

```python
length_filter = AnswerTokenLengthFilter(
                  max_answer_token_length=4096,
                  tokenizer_dir="custom/tokenizer"
                  )
result = length_filter.run(
          storage=self.storage.step(),
          input_key="answer_text"
          )
```

#### 7. QuestionFilter

**Function Description:** This operator performs comprehensive quality checks on mathematical problems, ensuring problem correctness and solvability.

**Input Parameters:**

- `input_key`: Input question field name
- `system_prompt`: System prompt
- `llm_serving`: Large language model service

**Output Parameters:**

- Returns True if question quality is acceptable, False otherwise

**Key Features:**

- Four-stage quality checking
- Format compliance verification
- Semantic reasonableness analysis
- Logical consistency checking
- Solvability assessment

**Check Dimensions:**

1. **Format Check**: Verifies if problem statement is standardized
2. **Semantic Check**: Analyzes if problem has clear meaning
3. **Logic Check**: Checks for contradictory conditions
4. **Solvability Check**: Evaluates if sufficient information is available

**Usage Example:**

```python
question_filter = QuestionFilter(
    system_prompt="You are a math problem validator.",
    llm_serving=api_llm_serving
    )
result = question_filter.run(
          storage=self.storage.step(),
          input_key="math_problem"
          )
```

