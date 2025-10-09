---
title: MinHashDeduplicateFilter
createTime: 2025/10/09 16:52:48
permalink: /en/api/operators/general_text/filter/minhashdeduplicatefilter/
---

<think>Okay, here's the breakdown of what I'm about to do. I've received a request to generate a Markdown tutorial for the `MinHashDeduplicateFilter` Python class. I need to act as a helpful assistant and follow a provided template, focusing on the `__init__` and `run` functions. I will use the class definition and the example template for a similar class as my source of information.

Here's how I will approach this task, step by step:

1.  **Understanding the Task and Constraints:** The main goal is to create a Markdown tutorial. I'm provided with a Python class and a template for another class. The tutorial should cover the `__init__` and `run` functions, detailing their parameters. Key constraints include sticking to the template structure, only describing the specified functions' parameters, and leaving certain sections blank. The output should be in English Markdown, without any extra conversational text.

2.  **Analyzing the Provided Template:** I will deconstruct the template to understand its structure. I'll need to translate some Chinese headings to English and understand the sections for Overview, \_\_init\_\_, run, Example Usage, and Output Format.

3.  **Gathering Information from the Class Definition:** I will extract the necessary information from the `MinHashDeduplicateFilter` class, including:
    *   A brief overview of the class using the `get_desc` method.
    *   The signatures and parameter details for the `__init__` and `run` functions. This includes parameter names, types, default values, and descriptions (derived from the code and the template).

4.  **Creating the Markdown Document:** Based on the information gathered and the template structure, I'll construct the Markdown tutorial:
    *   Start with the title: `MinHashDeduplicateFilter`.
    *   Add the overview section, using the description from `get_desc`.
    *   Create the `## __init__` section, including the function signature and parameter table.
    *   Create the `## run` section, including the function signature and parameter table.
    *   Create the `## 🧠 Example Usage` section, leaving it blank as per the instructions.
    *   Create the `#### 🧾 Output Format` section, which will contain a description of the output and an example.

5.  **Final Refinement and Output:** Before presenting the final output, I'll perform a review to make sure the Markdown document adheres to all the requirements and constraints. The output will be the complete English Markdown code block, ready for use.

Now, I will proceed to translate the thoughts into code.
</think>
<answer># 📘 Overview
`MinHashDeduplicateFilter` is an operator that performs efficient near-duplicate detection using MinHash and Locality-Sensitive Hashing (LSH). It converts texts into MinHash signatures and uses LSH to quickly find similar texts, enabling near-deduplication for large-scale datasets.

## __init__
```python
def __init__(self, num_perm=128, threshold=0.9, use_n_gram=True, ngram=5):
```
### Parameters
| Parameter | Type | Default | Description |
| :---------- | :--- | :-------- | :-------------------------------------------------------------- |
| **num_perm** | int | 128 | The number of permutations for generating MinHash signatures. |
| **threshold** | float | 0.9 | The Jaccard similarity threshold above which texts are considered duplicates. |
| **use_n_gram** | bool | True | Specifies whether to use n-gram tokenization for creating MinHash. |
| **ngram** | int | 5 | The value of 'n' for n-gram tokenization if `use_n_gram` is True. |

## run
```python
def run(self, storage: DataFlowStorage, input_keys: list = None, input_key: str = None, output_key: str = 'minhash_deduplicated_label'):
```
### Parameters
| Parameter | Type | Default | Description |
| :------------ | :---------------- | :--------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **storage** | DataFlowStorage | Required | The DataFlow storage instance used for reading the input DataFrame and writing the deduplicated output. |
| **input_keys** | list | None | A list of column names whose content will be concatenated and used for deduplication. Use this for comparing combined text from multiple fields. |
| **input_key** | str | None | The name of the single column to be used for deduplication. Either `input_key` or `input_keys` must be provided, but not both. |
| **output_key** | str | 'minhash_deduplicated_label' | The name of the new column that will be added to the DataFrame to store the deduplication label (1 for unique, 0 for duplicate). |

## 🧠 Example Usage
```python
# Blank as per request
```

#### 🧾 Output Format
The operator filters the input dataframe, keeping only the rows identified as unique. It also adds a new column (specified by `output_key`) to the dataframe, where `1` indicates a unique item.

| Field | Type | Description |
| :--------------------------- | :--- | :------------------------------------------- |
| *(original_fields)* | * | Original fields from the input data. |
| **minhash_deduplicated_label** | int | The label indicating uniqueness; always `1` in the output dataframe as duplicates are removed. |

**Example Input:**
```json
{"text": "This is the first sentence."}
{"text": "This is the second sentence."}
{"text": "This is the first sentence."}
```
**Example Output:**
```json
{"text": "This is the first sentence.", "minhash_deduplicated_label": 1}
{"text": "This is the second sentence.", "minhash_deduplicated_label": 1}
```</answer>
