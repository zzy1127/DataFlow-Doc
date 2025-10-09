---
title: CodeQualitySampleEvaluator
createTime: 2025/10/09 16:52:48
permalink: /en/api/operators/code/eval/codequalitysampleevaluator/
---

<think>Alright, time to generate that markdown document. I'm starting with the `CodeQualitySampleEvaluator` class and need to create a tutorial for it, mirroring the structure of the `ReasoningAnswerGenerator` example.

First things first, understand the goal: a markdown tutorial in English, focusing on the `__init__` and `run` functions and their parameters. The template guides the sections: Overview, `__init__`, Prompt Template, `run`, Example Usage, and Output Format, plus examples.

I'll analyze the template now, extracting key elements. I need to use the class docstring for the overview, and extract the parameters and their types from the `__init__` and `run` signatures.

Now, onto the code itself. The docstring is crucial for that overview. It says: "CodeQualitySampleEvaluator is an operator that evaluates the quality of a generated code snippet against its source instruction. It uses an LLM to provide both a numerical score and textual feedback, acting as an automated code reviewer." Good stuff.

Then, I'll look closely at the function signatures.
*   `__init__` has `llm_serving` (LLMServingABC type) and `prompt_template` (default to None, could be `CodeQualityEvaluatorPrompt`, `DiyCodePrompt`, or a string).
*   `run` needs the `storage` (DataFlowStorage), `input_key` (string), `output_score_key` (string, defaults to "quality_score"), and `output_feedback_key` (string, defaults to "quality_feedback").

I'll use the extracted signatures and parameter descriptions to complete the tables in the markdown.

For the example inputs and outputs, I need to be careful with the details. The `input_key` points to a dictionary containing "instruction" and "code". The `run` function adds `quality_score` and `quality_feedback`. I'll make sure my examples reflect this. The output will be a JSON object, showing a simple example using "instruction" and "code" as the input and added "quality_score" and "quality_feedback" keys.

Specifically for the example input and output, I will make it so the input is a dictionary with keys "generated_instruction" and "generated_code" as input to the `run` function. The output is the same dictionary but with keys `quality_score` and `quality_feedback` added. I'll make sure my input-output examples follow the expected format.

Now, the structure of the markdown:
*   Class name and overview from docstring.
*   `__init__` section with signature and parameter table.
*   Prompt Template Description section, will be left blank.
*   `run` section, with the signature and parameter table.
*   Example Usage section, also left blank.
*   Output Format: A table describing the input and output columns.
*   Example Input/Output: With the example JSONs.
I'll follow the instruction of only including the input formal parameters and skipping the function description.

Finally, I'll check for accuracy and consistency. Time to write the markdown!
</think>
<answer>## 📘 Overview
`CodeQualitySampleEvaluator` is an operator that evaluates the quality of a generated code snippet against its source instruction. It uses an LLM to provide both a numerical score and textual feedback, acting as an automated code reviewer.

## __init__ function
```python
def __init__(self, llm_serving: LLMServingABC, prompt_template=None):
```
### init parameter description
| Parameter | Type | Default Value | Description |
| :------------------ | :-------------- | :---------------------------- | :------------------------------ |
| **llm_serving** | `LLMServingABC` | Required | An instance of a language model serving class, used to execute the evaluation. |
| **prompt_template** | `PromptABC`, `str`, or `None` | `CodeQualityEvaluatorPrompt()` | The prompt template object used to structure the input for the LLM. Supports built-in templates or custom strings. If `None`, defaults to `CodeQualityEvaluatorPrompt`. |

### Prompt Template Descriptions
| Prompt Template Name | Primary Purpose | Applicable Scenarios | Feature Description |
| -------------------- | --------------- | -------------------- | ------------------- |
|                      |                 |                      |                     |
|                      |                 |                      |                     |
|                      |                 |                      |                     |

## run function
```python
def run(self, storage: DataFlowStorage, input_key: str, output_score_key: str = "quality_score", output_feedback_key: str = "quality_feedback")
```
#### Parameters
| Name | Type | Default Value | Description |
| :-------------------- | :---------------- | :-------------------- | :----------------- |
| **storage** | `DataFlowStorage` | Required | The DataFlow storage instance, responsible for reading and writing data. |
| **input_key** | `str` | Required | The name of the input column. This column should contain a dictionary with `instruction` and `code` keys. |
| **output_score_key** | `str` | `"quality_score"` | The name of the output column where the numerical quality score will be stored. |
| **output_feedback_key**| `str` | `"quality_feedback"`| The name of the output column where the textual feedback will be stored. |

## 🧠 Example Usage
```python

```
#### 🧾 Default Output Format (Output Format)
| Field | Type | Description |
| :-------------------- | :---- | :---------- |
| *input_fields* | any | The original fields from the input data are preserved. |
| quality_score | int | The numerical quality score assigned by the LLM (e.g., from 1 to 10). |
| quality_feedback | str | The detailed textual feedback on the code's quality provided by the LLM. |

**Example Input:**
*(Note: The operator processes a DataFrame. The JSON below represents a single row.)*
```json
{
  "generated_instruction": "Create a Python function that calculates the factorial of a non-negative integer.",
  "generated_code": "def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)"
}
```
**Example Output:**
```json
{
  "generated_instruction": "Create a Python function that calculates the factorial of a non-negative integer.",
  "generated_code": "def factorial(n):\n    if n == 0:\n        return 1\n    else:\n        return n * factorial(n-1)",
  "quality_score": 10,
  "quality_feedback": "The code is correct, efficient, and properly handles the base case (n=0). The recursive implementation is clear and follows standard Python conventions for this problem."
}
```</answer>
