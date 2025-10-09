---
title: DeitaComplexitySampleEvaluator
createTime: 2025/10/09 16:52:48
permalink: /en/api/operators/text_sft/eval/deitacomplexitysampleevaluator/
---

<think>Okay, here's the plan. I'm going to create a markdown tutorial for the `DeitaComplexitySampleEvaluator` class, focusing on the `__init__` and `run` methods as requested. I'll provide parameter descriptions in a table format, similar to what I've seen in other documentation. I will skip sections on prompt templates and example usage as the user requested.

First, I'll write a brief overview explaining what the class does: It's an operator that calculates the complexity of instructions using the `hkust-nlp/deita-complexity-scorer` model.

Then, I will detail the `__init__` function. I'll extract the parameters: `device`, `model_cache_dir`, and `max_length`.  I will create a markdown table for them, including their types, default values, and a brief description.

Next, I'll document the `run` method. I'll identify the parameters: `storage`, `input_instruction_key`, `input_output_key`, and `output_key`.  I'll create another table, describing each parameter in the same format as for `__init__`.

I will skip the section on prompt templates, as it's not applicable to this class. Similarly, I will skip the section on example usage.

Finally, I'll describe the output format. I'll explain that the operator adds a new column to the dataframe, named by the `output_key` parameter (defaulting to `DeitaComplexityScore`). I'll provide example JSON input and output to illustrate the changes to the data.

The core of this will be generating the markdown tables, accurately representing the parameters and their properties. I'm confident in creating the tables, handling the information in the JSON examples, and following the structure requested.
</think>
<answer># 📘 Overview
`DeitaComplexitySampleEvaluator` is an operator designed to assess the complexity of a given instruction. It utilizes the `hkust-nlp/deita-complexity-scorer` model to generate a complexity score, typically on a scale from 1 to 6. This helps in understanding the difficulty of instructions within a dataset.

## `__init__`
```python
def __init__(self, device='cuda', model_cache_dir='./dataflow_cache', max_length=512)
```
| Parameter | Type | Default | Description |
| :---------------- | :---- | :-------------------- | :-------------------------------------------------------------------------------------------------- |
| **device** | str | 'cuda' | The device to run the model on, e.g., 'cuda' or 'cpu'. Defaults to 'cuda' if available. |
| **model_cache_dir** | str | './dataflow_cache' | The directory to cache the downloaded model. |
| **max_length** | int | 512 | The maximum sequence length for the model input. |

## `run`
```python
def run(self, storage: DataFlowStorage, input_instruction_key: str = 'instruction', input_output_key: str = 'output', output_key: str = 'DeitaComplexityScore')
```
| Parameter | Type | Default | Description |
| :---------------------- | :---------------- | :----------------------- | :------------------------------------------------------------------ |
| **storage** | DataFlowStorage | Required | The DataFlow storage instance for reading and writing data. |
| **input_instruction_key** | str | 'instruction' | The column name in the input DataFrame that contains the instruction text. |
| **input_output_key** | str | 'output' | The column name in the input DataFrame that contains the output text. |
| **output_key** | str | 'DeitaComplexityScore' | The column name in the output DataFrame where the generated score will be stored. |

## 🧠 Example Usage
```python
# The user does not have enough information to write this part.
```

## 🧾 Output Format

| Field | Type | Description |
| :----------------------- | :------ | :--------------------------------------------------- |
| **(input_fields)** | - | The original fields from the input data are preserved. |
| **DeitaComplexityScore** | float | The calculated complexity score for the instruction (typically from 1 to 6). |

#### Example Input:
```json
{
    "instruction": "Explain the theory of relativity in simple terms.",
    "output": "The theory of relativity, proposed by Albert Einstein, has two main parts: special relativity and general relativity. Special relativity deals with..."
}
```
#### Example Output:
```json
{
    "instruction": "Explain the theory of relativity in simple terms.",
    "output": "The theory of relativity, proposed by Albert Einstein, has two main parts: special relativity and general relativity. Special relativity deals with...",
    "DeitaComplexityScore": 4.85
}
```</answer>
