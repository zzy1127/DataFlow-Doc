---
title: Case 1. Translation
createTime: 2025/06/30 19:19:16
permalink: /en/guide/translation/
icon: basil:lightning-alt-outline
---

# Easy Translation

### Step 1: Install the Dataflow Environment
```bash
pip install open-dataflow
```

### Step 2: Create a New Dataflow Working Directory
```bash
mkdir run_dataflow
cd run_dataflow
```

### Step 3: Initialize Dataflow
```bash
dataflow init
```
After this step, you should see:
```
run_dataflow/playground
```

### Step 4: Set Your API Key and API URL
```bash
export DF_API_KEY=sk-xx
```

Set the `api_url` as follows:
```python
llm_serving = APILLMServing_request(
    api_url="https://api.openai.com/v1/chat/completions",
    model_name="gpt-4o",
    max_workers=100
)
```

### Step 5: Prepare the Data to Be Translated
Create a `.jsonl` file with the following format:
```jsonl
{"raw_content": "This paper presents work whose goal is to advance the field of Machine Learning. There are many potential societal consequences of our work, none which we feel must be specifically highlighted here."}
```

Then specify the file path in your configuration:
```python
self.storage = FileStorage(
    first_entry_file_name="your path",
    cache_path="./cache",
    file_name_prefix="raw_content",
    cache_type="jsonl",
)
```
