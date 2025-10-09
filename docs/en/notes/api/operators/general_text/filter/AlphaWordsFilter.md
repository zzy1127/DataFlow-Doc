---
title: AlphaWordsFilter
createTime: 2025/10/09 16:52:48
permalink: /en/api/operators/general_text/filter/alphawordsfilter/
---

<think>Okay, here's how I'll approach generating the markdown tutorial for the `AlphaWordsFilter` class, adhering strictly to the user's instructions and the template provided. My goal is to be concise, informative, and avoid any unnecessary conversational text.

First, I'll begin by structuring the document, starting with the main heading and the overview. I'll then move into detailed sections on `__init__`, `run`, and finally the output format. Each of the tables will have parameter descriptions as specified, and I'll make sure to leave the example usage and prompt template sections blank as requested. The format will be pure markdown.

```markdown
# AlphaWordsFilter

## Overview

The `AlphaWordsFilter` is a data processing tool designed to filter text based on the ratio of alphabetic words. It determines whether the proportion of alphabetic words within a given text exceeds a predefined threshold. This filter utilizes either the NLTK tokenizer or simple space splitting to identify words and perform its calculations.

## __init__

| Parameter        | Type   | Description                                                                         |
| :--------------- | :----- | :---------------------------------------------------------------------------------- |
| `threshold`      | `float` | The minimum ratio of alphabetic words for a text to be considered valid.             |
| `use_tokenizer` | `bool`  | A boolean flag to determine whether to use the NLTK tokenizer for splitting text into words. If False, simple space splitting is used. |

## Prompt Template Descriptions

| Field | Description |
| :---- | :---------- |

## run

| Parameter     | Type               | Description                                               |
| :------------ | :----------------- | :-------------------------------------------------------- |
| `storage`     | `DataFlowStorage` | The DataFlowStorage instance for reading and writing data. |
| `input_key`   | `str`              | The column name in the input DataFrame that contains the text to be processed.                 |
| `output_key`  | `str`              | The column name for the output results, which will contain a boolean label (1 for pass, 0 for fail) for each text. |

## 🧠 Example Usage

```python

```

## 🧾 Output Format

| Field                     | Description                                                                             |
| :------------------------ | :-------------------------------------------------------------------------------------- |
| *[Input Field]*    | The original fields passed into the filter. |
| `alpha_words_filter_label` | A boolean value indicating whether the text passed the alpha words filter (1) or not (0). |

Example Input:

```json
{
  "text": "This is a test sentence."
}
```

Example Output:

```json
{
  "text": "This is a test sentence.",
  "alpha_words_filter_label": 1
}
```

```
Now, I have a markdown document that fulfills all the requirements. The tutorial is concise, only lists parameters and not function descriptions. The example usage is correctly empty. The output format, as required, describes the changes made. The output format showcases what is returned. I'm confident in the accuracy and completeness of this generated documentation.
</think>
<answer># 📘 `AlphaWordsFilter`

`AlphaWordsFilter` is an operator designed to filter text data based on the proportion of alphabetic words. It calculates the ratio of words containing at least one letter to the total number of words in a given text. If this ratio exceeds a specified threshold, the text is retained; otherwise, it is filtered out. The operator supports two modes for word tokenization: using the NLTK library for more accurate linguistic tokenization or a simple split by whitespace for faster processing.

## `__init__`

```python
def __init__(self, threshold: float, use_tokenizer: bool):
```

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **threshold** | float | Required | The minimum ratio of alphabetic words required for the text to pass the filter. |
| **use_tokenizer** | bool | Required | If `True`, uses the NLTK tokenizer. If `False`, splits text by whitespace. |

### Prompt Template Descriptions

| Prompt Template Name | Primary Purpose | Applicable Scenarios | Feature Description |
| :--- | :--- | :--- | :--- |
| | | | |

## `run`

```python
def run(self, storage: DataFlowStorage, input_key: str, output_key: str='alpha_words_filter_label'):
```

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **storage** | DataFlowStorage | Required | The DataFlowStorage instance used for reading and writing data. |
| **input_key** | str | Required | The name of the input column containing the text to be filtered. |
| **output_key** | str | 'alpha_words_filter_label' | The name of the output column where the filter result (1 for pass, 0 for fail) is stored. |

## 🧠 Example Usage

```python
# Example Usage information is not available.
```

#### 🧾 Output Format

The operator adds a new column (specified by `output_key`) to the input data, containing a binary label (1 if the text passes the filter, 0 otherwise). It then returns a DataFrame containing only the rows that passed the filter.

| Field | Type | Description |
| :--- | :--- | :--- |
| *input_fields* | - | All original fields from the input data are preserved. |
| `alpha_words_filter_label` | int | The result of the filter check: 1 indicates the text passed, 0 indicates it failed. The final output only contains rows where this value is 1. |

**Example Input:**

```json
{
    "text": "This is a sample sentence with 9 words."
}
```

**Example Output (assuming it passes a threshold):**

```json
{
    "text": "This is a sample sentence with 9 words.",
    "alpha_words_filter_label": 1
}
```</answer>
