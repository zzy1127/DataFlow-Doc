---
title: Text-to-SQL数据合成流水线
icon: material-symbols-light:checkbook-outline-rounded
createTime: 2025/06/17 02:00:31  
permalink: /zh/guide/text2sqlpipeline/  
---

# Text-to-SQL数据合成流水线

## 1. 概述

**Text-to-SQL数据合成流水线**的核心目标是通过清洗和扩充现有的Text-to-SQL数据，并为每个样本生成包含训练提示词（prompt）和长链推理过程（chain-of-thought）的高质量问答数据。流水线能够一键完成从原始数据到最终训练数据的全流程处理。目前支持两种数据生成流程：

我们支持以下应用场景：
* 对已有的数据进行筛选、扩充和构建，生成高质量训练数据
  - 必须包含数据库id、自然语言问题和标准SQL答案三个部分
* 从数据库中合成数据，生成高质量训练数据
  - 不需要已有数据，直接从数据库中合成数据

流水线的主要流程包括：
1. **数据过滤**：
  - 执行过滤：筛选无效SQL和无法执行的SQL
  - 一致性过滤：筛选与问题和数据库Schema不一致的数据
2. **数据生成**：
  - SQL变体生成：基于已有的SQL，生成SQL的变体
  - SQL生成：基于数据库Schema，生成SQL
  - 问题生成：基于SQL和数据库Schema，生成自然语言问题
3. **训练数据生成**：
  - 提示词生成：构建提示词问题，包含自然语言问题、数据库Schema和提示信息
  - 长链推理生成：构建解决问题所需的长链推理过程，用于模型训练
4. **数据分类**：
  - 难度分类：基于SQL语法复杂度划分难度等级
  - 执行难度分类：基于执行通过率划分生成难度


## 2. 数据格式

### 2.2 输入数据

分为两条流水线，一条数据优化流水线：从已有数据进行筛选并扩充，另一条数据合成流水线：不需要已有数据，直接从数据库中合成数据。

#### 数据优化流水线

流水线的输入数据主要包括以下字段：

* **db_id**：数据库文件名称，即数据库id
* **question**：自然语言问题
* **SQL**：标准SQL答案

- **示例**（`json`）：
  ```json
  {
    "db_id": "california_schools",
    "question": "What is the highest eligible free rate for K-12 students in the schools in Alameda County?",
    "SQL": "SELECT `Free Meal Count (K-12)` / `Enrollment (K-12)` FROM frpm WHERE `County Name` = 'Alameda' ORDER BY (CAST(`Free Meal Count (K-12)` AS REAL) / `Enrollment (K-12)`) DESC LIMIT 1"
  }
  ```
- **演示数据集**：  
  `example_data/Text2SQLPipeline/pipeline_refine.json`  
  包含数据库id、自然语言问题和标准SQL答案，适用于快速测试和演示。

这些输入数据可以存储在指定的文件（如`json`、`jsonl`）中，并通过`FileStorage`对象进行管理和读取。示例中会载入默认的数据路径，实际使用场景下可以根据需求修改路径以载入自定义的数据和缓存路径：

```python
self.storage = FileStorage(
    first_entry_file_name="../example_data/Text2SQLPipeline/pipeline_refine.json",
    cache_path="./cache_local",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl"
)
```

#### 数据合成流水线

流水线不需要已有数据，直接从数据库中合成数据。因此这里只需要配置数据库即可。将数据库配置好之后，送入DatabaseManager进行管理。

此时不需要传入first_entry_file_name，因此将first_entry_file_name设置为None即可。

```python
self.storage = FileStorage(
    first_entry_file_name=None,
    cache_path="./cache_local",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl"
)
```

### 2.3 输出数据

- **格式**：`jsonl`（每个步骤都会生成一个文件）  
- **字段说明**：
  - `db_id`: 数据库id
  - `question`: 自然语言问题
  - `SQL`: 标准SQL答案
  - `prompt`: 用于训练的提示词，包含自然语言问题、数据库Schema和提示信息
  - `cot_reasoning`: 长链推理数据，包含推理过程和最终答案，用于模型训练
  - `sql_component_difficulty`: SQL组件复杂度评估
  - `sql_execution_difficulty`: SQL执行复杂度评估
- **示例**：
  ```json
  {
      "db_id":"california_schools",
      "SQL":"SELECT AVG(s.AvgScrRead) AS average_reading_score\nFROM satscores s\nINNER JOIN frpm f ON s.cds = f.CDSCode\nINNER JOIN schools sc ON f.CDSCode = sc.CDSCode\nWHERE s.cname = 'Alameda'\n  AND f.\"Charter School (Y\/N)\" = 1\n  AND f.\"Charter Funding Type\" = 'Directly funded'\n  AND sc.County = 'Alameda';",
      "question":"What is the average reading score for directly funded charter schools in Alameda County?",
      "prompt":"Task Overview: /* Given the following database schema: ... /* Answer the following: What is the average reading score for directly funded charter schools in Alameda County? * Let's think step by step",
      "cot_reasoning":"To translate the natural language question into an executable SQLite query, we will follow these steps. ... we can construct the full SQLite query based on these steps:\n\n```sql\nSELECT AVG(s.AvgScrRead) AS average_reading_score\nFROM satscores s\nINNER JOIN frpm f ON s.cds = f.CDSCode\nINNER JOIN schools sc ON f.CDSCode = sc.CDSCode\nWHERE s.cname = 'Alameda'\n  AND f.\"Charter School (Y\/N)\" = 1\n  AND f.\"Charter Funding Type\" = 'Directly funded'\n  AND sc.County = 'Alameda';\n```\n\nThis query follows the logic outlined above and ensures alignment with the reference solution.",
      "sql_component_difficulty":"medium",
      "sql_execution_difficulty":"medium"
  }
  ```

## 配置说明

### 2.1 数据库配置

在进行数据库解析和执行时，需要配置相应的数据库信息。目前支持 SQLite 数据库和MySQL数据库，对其他数据库的支持正在更新中。

#### SQLite 数据库

SQLite 数据库是以文件形式存在的，因此需要管理读取文件的路径

- **数据库文件夹**：包含可执行的数据库文件
  - **说明**：**数据库文件夹**是存放所有数据库的目录。其中包含多个数据库文件，格式可以为`.sqlite`或者`.db`。只需确保数据库文件夹中存在数据库文件即可，数据库管理器会找到其中的数据库文件，并进行管理。

  - **重要提醒**：数据库文件的名称就是`db_id`，所有数据库的格式需要为`db_id.sqlite`或者`db_id.db`，在传入的数据中，`db_id`需要和数据库文件的名称对应

  - **数据库格式**：对于您传入的数据库文件夹，由于数据库管理器会找到其中的数据库文件，并进行管理。因此对于数据库文件夹中数据库文件的路径并没有要求，只需要存在即可，因此下面任何一种文件夹都是可以的。
  ```
  databases/                    # 数据库文件夹
    ├── california_schools.sqlite   # 数据库文件
    └── hospitals.sqlite
    ```
  和
  ```
  databases/                    # 数据库文件夹
    ├── forder1/         
    │   └── california_schools.sqlite   # 数据库文件
    └── forder2/
        └── hospitals.sqlite
    ```
  和  
  databases/                    # 数据库文件夹
    ├── california_schools.sqlite   # 数据库文件
    └── forder1/
        └── hospitals.sqlite
    ```
    
  - **演示**：  
    为便于演示，我们提供了示例数据库，你可以使用演示数据库来测试流水线的功能：  
    https://huggingface.co/datasets/Open-Dataflow/dataflow-Text2SQL-database-example  
    
    **使用步骤**：  
    1. 完整下载 `databases` 压缩包到本地
    2. 使用`  `指令对压缩文件进行解压
    3. 将代码中的 `db_root_path` 参数设置为本地解压后的 `databases` 文件夹的完整路径，即如果您的 `databases` 文件夹位于 `/Users/username/data/databases`，则将 `db_root_path` 设置为该路径。
  
  - **配置方式**：
  1. 准备数据库文件夹
  2. 将数据库文件夹的完整路径设置为`db_root_path`
  3. 配置`database_manager`：
  ```python
  database_manager = DatabaseManager(
            db_type="sqlite",
            config={
                "root_path": db_root_path
            }
        )
  ```其中db_type必须设定为`sqlite`，在config中，只需设定root_path为数据库文件夹的完整路径即可。

请确保数据库文件夹中存在数据库文件，并且数据库文件的名称就是`db_id`，所有数据库的格式需要为`db_id.sqlite`或者`db_id.db`，在传入的数据中，`db_id`需要和数据库文件的名称对应。

#### MySQL 数据库

MySQL 数据库是以服务器形式存在的，因此需要管理读取服务器的信息，请确保您的MySQL服务处于开启状态，并配置好相应的用户名和密码。在DataFlow中，我们使用`pymysql`库来连接MySQL服务器。

- **配置方式**：
  1. 准备MySQL服务器信息
  2. 将MySQL服务器信息设置为`database_manager`：
  ```python
  database_manager = DatabaseManager(
            db_type="mysql",
            config={
                "host": "localhost",
                "user": "root",
                "password": "password"
            }
        )
  ```
  其中db_type必须设定为`mysql`，在config中，只需设定host、user、password为MySQL服务器信息即可。

  
请确保需要使用的数据库在MySQL服务器中，并且有相应的权限。

### 2.2 模型配置

#### API LLM服务配置

在DataFlow中，我们使用`APILLMServing_request`来管理API LLM服务。

```python
        api_llm_serving = APILLMServing_request(
            api_url="https://api.openai.com/v1/chat/completions",
            model_name="gpt-4o",
            max_workers=100
        )

        cot_generation_api_llm_serving = APILLMServing_request(
            api_url="https://api.openai.com/v1/chat/completions",
            model_name="gpt-4o", # 使用更好的模型生成长链推理过程
            max_workers=100
        )

        embedding_api_llm_serving = APILLMServing_request(
            api_url="https://api.openai.com/v1/embeddings",
            model_name="text-embedding-ada-002",
            max_workers=100
        )
```

其中api_llm_serving是用于生成提示词的模型，cot_generation_api_llm_serving是用于生成长链推理的模型，embedding_api_llm_serving是用于生成embedding的模型。在实际使用中，您可以更换为其他模型，或者使用其他API LLM服务。

#### 本地模型服务配置

在DataFlow中，我们使用`LocalModelLLMServing`来管理本地模型服务。

```python
llm_serving = LocalModelLLMServing_vllm(
            hf_model_name_or_path="Qwen/Qwen2.5-7B-Instruct", # set to your own model path
            vllm_tensor_parallel_size=1,
            vllm_max_tokens=8192,
        )

        # It is recommended to use better LLMs for the generation of Chain-of-Thought (CoT) reasoning process.
        cot_generation_llm_serving = LocalModelLLMServing_vllm(
            hf_model_name_or_path="Qwen/Qwen2.5-7B-Instruct", # set to your own model path
            vllm_tensor_parallel_size=1,
            vllm_max_tokens=8192,
        )

        embedding_serving = LocalModelLLMServing_vllm(hf_model_name_or_path="Alibaba-NLP/gte-Qwen2-7B-instruct", vllm_max_tokens=8192)
```

其中llm_serving是用于生成提示词的模型，cot_generation_llm_serving是用于生成长链推理的模型，embedding_serving是用于生成embedding的模型。在实际使用中，您可以更换为其他模型，或者使用其他本地模型服务。

### 2.3 参数配置

#### 难度配置

```python
        # You can customize the difficulty config here, but it must contain 'thresholds' and 'labels' keys
        execution_difficulty_config = {
            'thresholds': [2, 5, 9],
            'labels': ['easy', 'medium', 'hard', 'extra']
        }

        component_difficulty_config = {
            'thresholds': [2, 4, 6],      
            'labels': ['easy', 'medium', 'hard', 'extra']
        }
```

其中execution_difficulty_config是用于执行难度分类的配置，component_difficulty_config是用于SQL组件复杂度分类的配置。注意，thresholds和labels必须同时存在，且thresholds必须为升序排列。

#### 提示词模板配置

```python
prompt_template = '''Task Overview:
            /* Given the following database schema: */
            {schema}
            /* Answer the following: {question} */
            Let's think step by step'''
```

其中prompt_template是用于生成提示词的模板，其中{schema}和{question}是占位符，分别表示数据库Schema和自然语言问题。这里你可以根据需要进行修改，但必须包含{schema}和{question}这两个占位符。

#### 数据库Schema配置

```python
schema_config = {
            'format': 'ddl',  # Optional: 'ddl', 'formatted_schema'
            'use_example': False  # Whether to include example data
        }
```

其中format是用于指定数据库Schema的格式，可选值为'ddl'和'formatted_schema'。use_example是用于指定是否包含示例数据，可选值为True和False。这表示是否在数据库Schema中包含示例数据。

## 3. **数据处理流程**

### 3.1 **SQL过滤器（SQLFilter）**
**功能**：
* 剔除执行异常的gold SQL
* 过滤与问题描述不一致的SQL

**输入**：原始输入数据
**输出**：有效的Text-to-SQL数据

### 3.2 **SQL难度分类器（SQLDifficultyClassifier）**
**功能**：
* 参考Spider标准，基于SQL语法复杂度划分难度等级
* 难度等级：easy/medium/hard/extra

**输入**：过滤后的数据
**输出**：带有难度标签的数据

### 3.3 **模式链接器（SchemaLinking）**
**功能**：
* 基于SQL查询，从全量数据库Schema中提取使用的关联表和列

**输入**：带有难度标签的数据
**输出**：包含Schema链接信息的数据

### 3.4 **Schema提取器（DatabaseSchemaExtractor）**
**功能**：
* 构建完整的数据库Schema信息
* 生成格式化的Schema描述
* 包括DDL语句和自然语言描述

**输入**：Schema链接后的数据
**输出**：带有完整Schema信息的数据

### 3.5 **知识生成器（ExtraKnowledgeGeneration）**
**功能**：
* 构建自然语言问题推到至SQL查询所需的额外知识
* 解释量词对应数值
* 明确名词实体映射关系

**输入**：带有Schema信息的数据
**输出**：包含额外知识的数据

### 3.6 **问题优化器（QuestionRefiner）**
**功能**：
* 标准化问题表述
* 拆分复合问句
* 统一提问句式（What/How开头）

**输入**：包含额外知识的数据
**输出**：优化后的问题数据

### 3.7 **提示词生成器（PromptGeneration）**
**功能**：
* 构建用于SFT训练的问题
* 生成长链推理过程的高质量回答
* 生成用于RL训练的问题

**输入**：优化后的问题数据
**输出**：训练用的问答数据

### 3.8 **执行难度分类器（Text2SQLDifficultyClassifier）**
**功能**：
* 基于执行通过率划分生成难度
* 支持多模型测试
* 难度等级：easy/medium/hard/extra

**输入**：生成的问答数据
**输出**：带有执行难度标签的最终数据

## 4. **输出数据**

最终输出数据包含以下字段：
* **evidence**：推理过程中提取的关键证据
* **selected_schema**：从SQL中提取的数据库schema信息
* **raw_schema**：原始完整的数据库schema
* **ddl**：数据库表结构定义语句
* **whole_format_schema**：完整格式化的schema说明
* **selected_format_schema**：筛选后格式化的schema说明
* **refined_question**：优化后的自然语言问题
* **rl_prompt**：最终生成的提示词模板
* **sft_output**：监督式微调模型的原始输出
* **sql_component_difficulty**：SQL组件复杂度评估
* **sql_execution_difficulty**：SQL执行复杂度评估

示例输出：
```json
{
  
}
```

## 5. 运行方式

该流水线通过简单的Python命令执行：

```bash
python test/test_text2sql.py
```