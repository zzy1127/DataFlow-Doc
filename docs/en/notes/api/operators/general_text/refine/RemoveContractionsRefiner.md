---
title: RemoveContractionsRefiner
createTime: 2025/10/09 16:52:48
permalink: /en/api/operators/general_text/refine/removecontractionsrefiner/
---

<think>Okay, here's what I'm thinking. I need to create a markdown tutorial, specifically for the `RemoveContractionsRefiner` class. The goal is a clear and concise guide that's easy to understand, especially since I'm assuming the audience is already familiar with the general structure of the tool.

First, the **Overview**: I'll start with a simple intro, defining the purpose of `RemoveContractionsRefiner`—which, of course, is to expand English contractions.

Then, the details. For the `__init__` function, it's refreshingly straightforward: there are no parameters to document, so I'll create a table to explicitly state that, keeping it clean. I'll remember to only describe the *parameters*, not the full description of what the function *does*.

Next, I remember the user's specific instructions to *leave the "Prompt Template Descriptions" section empty*, noted.

Moving on to the `run` function. I will write the parameter table, making sure to accurately represent the `storage` and `input_key` parameters, including their types and descriptions. 

I'll also remember to leave the "Example Usage" section blank per the instructions.

For the **Output Format**, the key here is that the operator modifies the input column directly. I'll use an input/output example to clearly illustrate how it transforms text containing contractions into expanded forms.

Finally, I'll do a final review to confirm that the output is in English, and the format meticulously matches the provided template (the `ReasoningAnswerGenerator` tutorial) and the sections specified. No extra fluff, only the essential information. The instructions are clear, and I will stick to them. Then, with that done, I can submit it.
</think>
<answer># 📘 Overview

The `RemoveContractionsRefiner` is a refiner operator designed to expand English contractions within a text. It converts abbreviated forms into their full, unabbreviated equivalents (e.g., transforming "can't" to "cannot"). This process helps to standardize the text, which can be beneficial for subsequent natural language processing tasks. It utilizes the `contractions` library to perform the expansion.

## __init__ function

```python
def __init__(self)
```

### init Parameters

| Parameter | Type | Default Value | Description |
| :-------- | :--- | :------------ | :---------- |
| *N/A*     | *N/A*| *N/A*         | This operator does not require any initialization parameters. |

## Prompt Template Descriptions

## run function

```python
def run(self, storage: DataFlowStorage, input_key: str)
```

### Parameters

| Name        | Type              | Default Value | Description                                                    |
| :---------- | :---------------- | :------------ | :------------------------------------------------------------- |
| **storage** | DataFlowStorage   | Required      | The DataFlow storage instance used for reading and writing data. |
| **input_key** | str               | Required      | The name of the input column that contains the text to refine.   |

## 🧠 Example Usage

```python
```

#### 🧾 Default Output Format (Output Format)

The operator modifies the column specified by `input_key` in place, expanding any contractions found in the text.

| Field       | Type | Description                                   |
| :---------- | :--- | :-------------------------------------------- |
| [input_key] | str  | The input text with all contractions expanded. |

**Example Input:**

```json
{
  "text": "I can't go to the party because I'm feeling sick. He'll be there, though."
}
```

**Example Output:**

```json
{
  "text": "I cannot go to the party because I am feeling sick. He will be there, though."
}
```</answer>
