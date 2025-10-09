---
title: ReasoningAnswerGroundTruthFilter
createTime: 2025/10/09 16:52:48
permalink: /en/api/operators/reasoning/filter/reasoninganswergroundtruthfilter/
---

<think>Okay, let's get this markdown tutorial for the `ReasoningAnswerGroundTruthFilter` class done. The user provided the code and a template, so I'll follow those instructions.

First, the core idea is that this class filters rows based on whether a generated answer matches a ground truth answer. It uses either an "exact" match or a "math_verify" approach. Simple enough.

Now, breaking down the sections:

1.  **Title and Overview:**  Pretty straightforward. Title will be the class name, `ReasoningAnswerGroundTruthFilter`, and a brief overview explaining its purpose.

2.  **`__init__` Function Section:**  Need to describe the `__init__` parameters.  The signature is `def __init__(self, compare_method: Literal["math_verify", "exact"] = "math_verify")`. I will translate the `Literal` to `str` in the table for clarity.

    *   **`compare_method`**:  This determines how the answers are compared.

3.  **Prompt Template Section:** The user specified to keep this section blank. Okay, no problem. This class doesn't use prompts, so that makes sense.

4.  **`run` Function Section:**  Need to describe the `run` parameters.  The signature is `def run(self, storage:DataFlowStorage, input_test_answer_key: str = "generated_cot", input_gt_answer_key: str = "golden_answer")`.

    *   **`storage`**:  The data flow storage.
    *   **`input_test_answer_key`**:  Column name for the generated answer.
    *   **`input_gt_answer_key`**:  Column name for the ground truth.

5.  **Example Usage Section:** The user wants this section empty.  Understood.

6.  **Output Format Section:**  The output is the input DataFrame, but filtered. That's the key.  I need to explain that the columns stay the same, but only rows where the answers match are kept. I'll include an example input and output using JSON to illustrate the filtering. I'll build those right now, to make sure they are correct.

7.  **Final Review:**  I need to ensure everything is in English, markdown format, and follows the specifications, especially those blank sections. The user doesn't want any extra words. I will make sure the function and class names are correct, and the structure mirrors the example. Alright, let's generate the markdown.
</think>
<answer># 📘 Overview

[ReasoningAnswerGroundTruthFilter](https://github.com/OpenDCAI/DataFlow/blob/main/dataflow/operators/...) is an operator designed to filter data by comparing a generated answer against a ground truth answer. It supports both exact string matching and mathematical equivalence verification. Rows where the answers match are retained, while non-matching rows are discarded.

## `__init__`

```python
def __init__(self, compare_method: Literal["math_verify", "exact"] = "math_verify"):
```

| Parameter Name | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **compare_method** | str | "math_verify" | The comparison method. `"math_verify"` checks for mathematical equivalence, while `"exact"` performs a strict string comparison. |

## `run`

```python
def run(self, storage: DataFlowStorage, input_test_answer_key: str = "generated_cot", input_gt_answer_key: str = "golden_answer"):
```

| Parameter Name | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **storage** | DataFlowStorage | Required | The data flow storage instance for reading input data and writing the filtered output. |
| **input_test_answer_key** | str | "generated_cot" | The column name in the input data that contains the generated answer to be verified. |
| **input_gt_answer_key** | str | "golden_answer" | The column name in the input data that contains the ground truth answer for comparison. |

## 🧠 Example Usage

```python

```

#### 🧾 Output Format

The operator filters the input DataFrame, keeping only the rows where the answer in `input_test_answer_key` matches the answer in `input_gt_answer_key` according to the specified `compare_method`. The output schema is identical to the input schema.

**Example Input:**
```json
[
    {
        "instruction": "What is 15 plus 20?",
        "generated_cot": "The sum is 35.",
        "golden_answer": "35"
    },
    {
        "instruction": "What is the capital of France?",
        "generated_cot": "The capital is Lyon.",
        "golden_answer": "Paris"
    }
]
```

**Example Output (with `compare_method='math_verify'`):**
```json
[
    {
        "instruction": "What is 15 plus 20?",
        "generated_cot": "The sum is 35.",
        "golden_answer": "35"
    }
]
```</answer>
