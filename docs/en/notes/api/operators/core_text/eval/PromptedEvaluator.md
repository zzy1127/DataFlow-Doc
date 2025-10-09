---
title: PromptedEvaluator
createTime: 2025/10/09 16:52:48
permalink: /en/api/operators/core_text/eval/promptedevaluator/
---

<think>Okay, here's the plan. I need to create a markdown tutorial for the `PromptedEvaluator` class. The user wants it to look like the example for the `ReasoningAnswerGenerator`, and they've given me specific instructions to follow.

First, I need to understand the task. The goal is to generate documentation, and the format matters. I'll start by analyzing the user's instructions. They want an "Overview," descriptions for the `__init__` and `run` methods (but only the input parameters in a table, similar to PyTorch docs), and blank sections for "Prompt Template Descriptions" and "Example Usage." The output needs to be clean English markdown, and I should avoid adding any extra conversational elements.

Next, I need to dig into the code itself. I will deconstruct the `PromptedEvaluator` class and identify the key elements. I'll start by checking the class docstring, which appears to be a generic one, so I'll craft an overview based on the class's intended functionality. The `get_desc` method seems to be a good source. Then, I will examine the `__init__` and `run` functions and their parameters.

Now, I'll create the markdown output. Based on the instructions, I'll structure the document with the appropriate headings and sections. I know the structure: a title, an overview paragraph, `__init__` parameters, `run` parameters, and the empty sections. I'll construct the parameter tables for `__init__` and `run`, including the name, type, default value, and description for each parameter. I will use the information gathered from the code analysis in the second step.

Finally, I'll perform a final review to make sure the markdown document meets all the requirements. I'll check for proper formatting, English language, no extra text, and the blank sections are indeed blank. The resulting markdown must adhere to the provided specifications. I'm ready to go.
</think>
<answer>## 📘 PromptedEvaluator
PromptedEvaluator is an operator that uses a Large Language Model (LLM) to rate data quality based on a system prompt. It writes the resulting score (an integer from 1 to 5) back to the DataFrame, which is then persisted via a storage object.

## __init__
```python
def __init__(self, llm_serving: LLMServingABC, system_prompt: str = "Please evaluate the quality of this data on a scale from 1 to 5."):
```
### init parameters
| Parameter | Type | Default Value | Description |
| :------------------ | :-------------- | :------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| **llm_serving** | LLMServingABC | Required | The Large Language Model serving instance used for evaluation. |
| **system_prompt** | str | "Please evaluate the quality of this data on a scale from 1 to 5." | The system prompt used to instruct the LLM on how to perform the evaluation. |

### Prompt Template Descriptions

## run
```python
def run(self, storage: DataFlowStorage, input_key: str = "raw_content", output_key: str = "eval")
```
#### Parameters
| Name | Type | Default Value | Description |
| :------------- | :---------------- | :---------------- | :------------------------------------------------------------------- |
| **storage** | DataFlowStorage | Required | The DataFlow storage instance, responsible for reading and writing data. |
| **input_key** | str | "raw_content" | The column name in the input data that contains the text to be evaluated. |
| **output_key** | str | "eval" | The column name where the generated evaluation score will be written. |

## 🧠 Example Usage</answer>
