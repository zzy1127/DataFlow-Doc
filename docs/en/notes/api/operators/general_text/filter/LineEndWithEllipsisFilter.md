---
title: LineEndWithEllipsisFilter
createTime: 2025/10/09 16:52:48
permalink: /en/api/operators/general_text/filter/lineendwithellipsisfilter/
---

<think>Alright, let's get this Markdown tutorial for the `LineEndWithEllipsisFilter` class written. This should be straightforward, I just need to be methodical.

First, I'll start with an **Overview**, giving a quick description of what the class actually *does*. I'll lift that straight from the `get_desc` method, of course.

Next, the `__init__` function. I'll create a section for that, and I need to include the function signature: `__init__(self, threshold: float=0.3)`. Then, I'll set up a table to clearly explain each parameter. Just the `threshold`, its type (float), its default value (0.3), and a concise description of its purpose.

The next two sections are easy: I was specifically told to leave the "Prompt Template Descriptions" and "Example Usage" sections blank. So I'll just create the headings and leave the content empty.

Now for the `run` function. I'll create a section for it, and I'll be sure to include its signature: `run(self, storage: DataFlowStorage, input_key: str, output_key: str = 'line_end_with_ellipsis_filter_label')`. Another table is needed, describing the parameters: `storage`, `input_key`, and `output_key`, with their types, any defaults, and explanations.

Finally, I need to define the **Output Format**. The `run` method adds a new column, specified by `output_key`, and then filters the DataFrame. That means the output *is* a filtered DataFrame. I need to describe that, and I can also mention the added label column and its values. I'll use a table here as well.

Once I've got all that laid out, I'll do a final, critical review. I'll check that it's *only* in English, that it's formatted correctly with Markdown, that there's no unnecessary fluff, that the `__init__` and `run` sections have been filled in, the sections explicitly marked as blank are indeed blank, and, crucially, that the parameter descriptions all follow the style that was requested. This needs to be perfect.
</think>
<answer># 📘 Overview

The `LineEndWithEllipsisFilter` operator detects and filters text lines ending with ellipsis (...) or (……), commonly used to identify incomplete statements. It calculates the ratio of lines ending with an ellipsis to the total number of lines in a given text. If this ratio is below a specified threshold, the text is kept; otherwise, it is filtered out.

## `__init__`

```python
def __init__(self, threshold: float=0.3)
```

| Argument | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **threshold** | float | 0.3 | The maximum allowed ratio of lines ending with an ellipsis. Texts with a ratio below this threshold will be kept. |

## Prompt Template Descriptions

## `run`

```python
def run(self, storage: DataFlowStorage, input_key: str, output_key: str = 'line_end_with_ellipsis_filter_label')
```

| Argument | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **storage** | DataFlowStorage | Required | The DataFlow storage instance for reading and writing data. |
| **input_key** | str | Required | The name of the input column containing the text to be analyzed. |
| **output_key** | str | 'line_end_with_ellipsis_filter_label' | The name of the output column where the filter label (1 for pass, 0 for fail) will be stored. |

## 🧠 Example Usage

## 🧾 Output Format

The operator adds a new column (specified by `output_key`) to the DataFrame, containing a label that indicates whether the text passed the filter. It then writes a new DataFrame to storage containing only the rows that passed the filter (where the label is 1).

| Field | Type | Description |
| :--- | :--- | :--- |
| *original_columns* | | The original columns from the input DataFrame are preserved. |
| **line_end_with_ellipsis_filter_label** | int | A label indicating the filter result. `1` means the text passed the filter (ratio < threshold), and `0` means it failed. |</answer>
