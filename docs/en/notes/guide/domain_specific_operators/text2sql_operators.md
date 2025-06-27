---
title: Text2SQL Operators
createTime: 2025/06/24 11:43:42
permalink: /en/guide/Text2SQL_operators/
---

# Text2SQL Operators

## Overview

Text2SQL operators are specialized operator collections designed for Text2SQL data processing and quality enhancement, aiming to:
- Clean and augment existing Text-to-SQL datasets
- Generate high-quality QA pairs containing training prompts and chain-of-thought reasoning for each sample
- Provide multi-dimensional data quality assessment and difficulty grading

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Applicable Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Official Repository/Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">SQLFilter</td>
      <td class="tg-0pky">Data Cleaning</td>
      <td class="tg-0pky">Filters data with execution errors and semantic inconsistencies</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">SQLDifficultyClassifier</td>
      <td class="tg-0pky">Difficulty Assessment</td>
      <td class="tg-0pky">Grades difficulty based on SQL syntax complexity</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/1809.08887">Spider</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">SchemaLinking</td>
      <td class="tg-0pky">Schema Extraction</td>
      <td class="tg-0pky">Extracts relevant tables and columns from database schema</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2402.16347">CodeS</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">DatabaseSchemaExtractor</td>
      <td class="tg-0pky">Schema Processing</td>
      <td class="tg-0pky">Constructs and formats database schema information</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">ExtraKnowledgeGeneration</td>
      <td class="tg-0pky">Knowledge Enhancement</td>
      <td class="tg-0pky">Generates additional domain knowledge for SQL reasoning</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QuestionRefiner</td>
      <td class="tg-0pky">Question Optimization</td>
      <td class="tg-0pky">Standardizes and optimizes natural language questions</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">PromptGeneration</td>
      <td class="tg-0pky">Training Data Generation</td>
      <td class="tg-0pky">Constructs high-quality QA data for SFT and RL training</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">Text2SQLDifficultyClassifier</td>
      <td class="tg-0pky">Execution Difficulty Assessment</td>
      <td class="tg-0pky">Grades difficulty based on model execution success rate</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>

## Operator Interface Usage Instructions

For operators that require specified storage paths or model calls, we provide encapsulated **model interfaces** and **storage object interfaces**. You can predefine model API parameters for operators as follows:

```python
from dataflow.llmserving import APILLMServing_request

api_llm_serving = APILLMServing_request(
                api_url="your_api_url",
                model_name="model_name",
                max_workers=5
        )
```

Storage parameters can be predefined as follows:

```python
from dataflow.utils.storage import FileStorage

self.storage = FileStorage(
            first_entry_file_name="your_file_path",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl", # jsonl, json, ...
        )
```

The `api_llm_serving` and `self.storage` objects used later refer to the interface objects defined here. For complete usage examples, refer to `test/test_text2sql.py`.

For parameter passing, the operator's constructor mainly passes configuration-related information, which can be configured once and used multiple times. The `X.run()` function passes IO-related `key` information. See the operator examples below for details.

## Detailed Operator Specifications

### 1. SQLFilter

**Description:** Filters invalid data
- Removes gold SQL with execution errors
- Filters SQL inconsistent with question descriptions
- Dual filtering ensures data quality

**Input Parameters:**

- `__init__()`
  - `llm_serving`: LLM service interface for consistency checks
  - `db_root_path`: Root directory path for database files
  - `num_cpus`: Number of CPU cores for parallel processing (default: 20)
  - `meta_time_out`: SQL execution timeout in seconds (default: 120)

- `run()`
  - `input_sql_key`: SQL statement field name (default: "SQL")
  - `input_dbid_key`: Database ID field name (default: "db_id")
  - `input_question_key`: Question field name (default: "question")

**Key Features:**
- Parallel SQL execution validation
- LLM-driven semantic consistency checks
- Automatic filtering of invalid data
- Detailed filtering statistics report

**Usage Example:**

```python
sql_filter = SQLFilter(
    llm_serving=api_llm_serving,
    db_root_path=db_root_path,
    num_cpus=20,
    meta_time_out=120
)
result = sql_filter.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    input_dbid_key="db_id",
    input_question_key="question"
)
```

### 2. SQLDifficultyClassifier

**Description:** Classifies difficulty levels (easy/medium/hard/extra) based on SQL syntax complexity, following [Spider](https://arxiv.org/abs/1809.08887) standards.

**Input Parameters:**

- `__init__()`
  - No special parameters required (uses predefined SQL complexity rules)

- `run()`
  - `input_sql_key`: SQL statement field name (default: "SQL")
  - `output_difficulty_key`: Output difficulty label field name (default: "sql_component_difficulty")

**Key Features:**
- Complexity analysis based on SQL syntax structure
- Supports nested queries, aggregate functions, join operations, etc.
- Standardized four-level difficulty classification
- Fast batch processing capability

**Usage Example:**

```python
sql_difficulty_classifier = SQLDifficultyClassifier()
sql_difficulty_classifier.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    output_difficulty_key="sql_component_difficulty"
)
```

### 3. SchemaLinking

**Description:** Implements [CodeS](https://arxiv.org/abs/2402.16347) method to extract relevant tables and columns from full database schema.

**Input Parameters:**

- `__init__()`
  - `table_info_file`: Database table information file path
  - `model_path`: Pretrained model path
  - `selection_mode`: Selection mode (default: "eval")
  - `num_top_k_tables`: Number of top-k tables to select (default: 5)
  - `num_top_k_columns`: Number of top-k columns to select (default: 5)

- `run()`
  - `input_sql_key`: SQL statement field name
  - `input_dbid_key`: Database ID field name
  - `input_question_key`: Question field name
  - `input_table_names_original_key`: Original table name field
  - `input_table_names_statement_key`: Formatted table name field
  - `input_column_names_original_key`: Original column name field
  - `input_column_names_statement_key`: Formatted column name field
  - `output_schema_key`: Output selected schema field name

**Key Features:**
- Intelligent schema association
- Similarity-based table/column selection
- Multiple selection strategies
- Reduces schema noise to improve model performance

**Usage Example:**

```python
schema_linking = SchemaLinking(
    table_info_file=table_info_file,
    model_path="/mnt/public/data/cqf/models/sic_merged",
    selection_mode="eval",                       
    num_top_k_tables=5,                           
    num_top_k_columns=5     
)
schema_linking.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    input_dbid_key="db_id",
    input_question_key="question",
    input_table_names_original_key="table_names_original",
    input_table_names_statement_key="table_names",
    input_column_names_original_key="column_names_original",    
    input_column_names_statement_key="column_names",
    output_schema_key="selected_schema"        
)
```

### 4. DatabaseSchemaExtractor

**Description:** Constructs and formats schema information.

**Input Parameters:**

- `__init__()`
  - `table_info_file`: Database table information file path
  - `db_root_path`: Root directory path for database files

- `run()`
  - `input_db_key`: Database ID field name
  - `table_schema_file_db_key`: Database ID field in schema file
  - `selected_schema_key`: Selected schema field name
  - `output_raw_schema_key`: Output raw schema field name
  - `output_ddl_key`: Output DDL statement field name
  - `output_whole_format_schema_key`: Output fully formatted schema field name

**Key Features:**
- Multiple schema format outputs
- Automatic DDL statement generation
- Selective schema extraction
- Standardized schema description format

**Usage Example:**

```python
database_schema_extractor = DatabaseSchemaExtractor(
    table_info_file=table_info_file,
    db_root_path=db_root_path,
)
result = database_schema_extractor.run(
    storage=self.storage.step(),
    input_db_key="db_id",
    table_schema_file_db_key="db_id",
    selected_schema_key="selected_schema",
    output_raw_schema_key="whole_schema",
    output_ddl_key="ddl",
    output_whole_format_schema_key="whole_format_schema"
)
```

### 5. ExtraKnowledgeGeneration

**Description:** Constructs additional knowledge required for deriving SQL queries from natural language questions, explaining:
- Quantifier-to-value mapping
- Noun entity relationships

**Input Parameters:**

- `__init__()`
  - `llm_serving`: LLM service interface
  - `exist_knowledge`: Whether knowledge already exists (default: False)
  - `max_retries`: Maximum retry attempts (default: 2)
  - `batch_size`: Batch processing size (default: 50)

- `run()`
  - `input_question_key`: Question field name (default: "question")
  - `input_sql_key`: SQL statement field name (default: "SQL")
  - `input_schema_key`: Schema field name (default: "ddl")
  - `output_knowledge_key`: Output knowledge field name (default: "evidence")

**Key Features:**
- Intelligent domain knowledge extraction
- Batch processing for efficiency
- Automatic retry mechanism
- Supports multiple knowledge types

**Usage Example:**

```python
extra_knowledge_generator = ExtraKnowledgeGenerator(
    llm_serving=api_llm_serving,
    exist_knowledge=False,
    max_retries=2,
    batch_size=50
)
result = extra_knowledge_generator.run(
    storage=self.storage.step(),
    input_question_key="question",
    input_sql_key="SQL",
    input_schema_key="ddl",
    output_knowledge_key="evidence"
)
```

### 6. QuestionRefiner

**Description:** Standardizes question expressions:
- Splits compound questions
- Standardizes question phrasing (What/How starters)
- Improves question clarity and accuracy

**Input Parameters:**

- `__init__()`
  - `llm_serving`: LLM service interface
  - `num_threads`: Number of threads (default: 5)
  - `max_retries`: Maximum retry attempts (default: 3)

- `run()`
  - `input_question_key`: Input question field name (default: "question")
  - `output_refined_question_key`: Output refined question field name (default: "refined_question")

**Key Features:**
- Question grammar standardization
- Intelligent compound question splitting
- Multi-threaded parallel processing
- Automatic error recovery

**Usage Example:**

```python
question_refiner = QuestionRefiner(
    llm_serving=api_llm_serving,
    num_threads=5,
    max_retries=3
)
result = question_refiner.run(
    storage=self.storage.step(),
    input_question_key="question",
    output_refined_question_key="refined_question"
)
```

### 7. PromptGeneration

**Description:** Constructs training QA data:
- Questions for SFT training
- High-quality answers with chain-of-thought reasoning
- Questions for RL training

**Input Parameters:**

- `__init__()`
  - `llm_serving`: LLM service interface
  - `db_root_path`: Root directory path for database files
  - `num_threads`: Number of threads (default: 5)
  - `timeout`: Timeout in seconds (default: 60)

- `run()`
  - `input_sql_key`: SQL statement field name (default: "SQL")
  - `input_question_key`: Question field name (default: "question")
  - `input_dbid_key`: Database ID field name (default: "db_id")
  - `input_schema_key`: Schema field name (default: "ddl")
  - `output_sft_prompt_key`: SFT training prompt field name (default: "sft_prompt")
  - `output_rl_prompt_key`: RL training prompt field name (default: "rl_prompt")
  - `output_cot_key`: Chain-of-thought output field name (default: "sft_output")

**Key Features:**
- Multiple training format support
- High-quality reasoning chain generation
- Parallel processing capability
- Custom prompt templates

**Usage Example:**

```python
prompt_generator = PromptGenerator(
    llm_serving=api_llm_serving,
    db_root_path=db_root_path,
    num_threads=5,
    timeout=60
)
result = prompt_generator.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    input_question_key="question",
    input_dbid_key="db_id",
    input_schema_key="ddl",
    output_sft_prompt_key="sft_prompt",
    output_rl_prompt_key="rl_prompt",
    output_cot_key="sft_output"
)
```

### 8. Text2SQLDifficultyClassifier

**Description:** Classifies generation difficulty based on execution pass rate:
- Tests execution success rate through multiple model generations
- Configurable thresholds (easy/medium/hard/extra)
- Supports multi-model testing and evaluation

**Input Parameters:**

- `__init__()`
  - `llm_serving`: LLM service interface
  - `db_root_path`: Root directory path for database files
  - `num_cpus`: Number of CPU cores for parallel processing (default: 1)
  - `meta_time_out`: SQL execution timeout in seconds (default: 120.0)
  - `easy_medium`: Easy difficulty threshold (default: 9)
  - `medium_hard`: Medium difficulty threshold (default: 5)
  - `hard_extra`: Hard difficulty threshold (default: 2)

- `run()`
  - `input_dbid_key`: Database ID field name (default: "db_id")
  - `input_sql_key`: SQL statement field name (default: "SQL")
  - `input_prompt_key`: Input prompt field name (default: "rl_prompt")
  - `output_difficulty_key`: Output difficulty field name (default: "sql_execution_difficulty")

**Key Features:**
- Execution-based difficulty assessment
- Configurable difficulty thresholds
- Statistical analysis of multiple generations
- Parallel processing for efficiency

**Usage Example:**

```python
text2sql_difficulty_classifier = Text2SQLDifficultyClassifier(
    llm_serving=api_llm_serving,
    db_root_path=db_root_path,
    num_cpus=1, 
    meta_time_out=120.0,
    easy_medium=9,
    medium_hard=5,
    hard_extra=2
)
text2sql_difficulty_classifier.run(
    storage=self.storage.step(),
    input_dbid_key="db_id",
    input_sql_key="SQL",
    input_prompt_key="rl_prompt",
    output_difficulty_key="sql_execution_difficulty"
)
```