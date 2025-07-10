---
title: Text2SQL Operators
createTime: 2025/06/24 11:43:42
permalink: /en/guide/Text2SQL_operators/
---

# Text2SQL Operators

## Overview

The Text2SQL operators are a specialized collection designed for processing and enhancing data quality in Text-to-SQL tasks. They aim to:  
- Clean and augment existing Text-to-SQL datasets  
- Generate high-quality question-answer pairs, including training prompts and chain-of-thought reasoning processes  
- Provide multi-dimensional data quality evaluation and difficulty grading  

The types of open-source operators are highly limited. To achieve better data processing quality and address gaps in open-source data synthesis and processing methods, we have meticulously designed and **independently developed** a new set of operators. Their markers are defined as follows:  

- 🚀 **Independent Innovation**: Core algorithms are originally developed to fill gaps in existing methods or to further improve performance, breaking current bottlenecks.  
- ✨ **Open-Source Debut**: These operators are integrated into mainstream community frameworks for the first time, making them accessible to more developers and promoting open-source collaboration.  

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
      <td class="tg-0pky">SQLFilter✨</td>
      <td class="tg-0pky">Data Cleaning</td>
      <td class="tg-0pky">Filters out data with execution errors or semantic inconsistencies</td>
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
      <td class="tg-0pky">Extracts relevant tables and columns based on SQL and database schema</td>
      <td class="tg-0pky">-</td>
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
      <td class="tg-0pky">Generates additional domain knowledge required for SQL reasoning</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QuestionRefiner🚀</td>
      <td class="tg-0pky">Question Optimization</td>
      <td class="tg-0pky">Standardizes and optimizes natural language questions</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">PromptGeneration✨</td>
      <td class="tg-0pky">Training Data Generation</td>
      <td class="tg-0pky">Constructs high-quality Q&A data for SFT and RL training</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">Text2SQLDifficultyClassifier🚀</td>
      <td class="tg-0pky">Execution Difficulty Assessment</td>
      <td class="tg-0pky">Grades difficulty based on model execution success rate</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>

## Operator Interface Usage Instructions

For operators that require specific storage paths or model calls, we provide encapsulated **model interfaces** and **storage object interfaces**. Predefine model API parameters for operators as follows:

```python
from dataflow.llmserving import APILLMServing_request

api_llm_serving = APILLMServing_request(
                api_url="your_api_url",
                model_name="model_name",
                max_workers=5
        )
```

Predefine storage parameters for operators as follows:

```python
from dataflow.utils.storage import FileStorage

self.storage = FileStorage(
            first_entry_file_name="your_file_path",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl", # jsonl, json, ...
        )
```

Hereafter, `api_llm_serving` and `self.storage` refer to the predefined interface objects. For a complete usage example, refer to `test/test_text2sql.py`.

For parameter passing:  
- The constructor of an operator object primarily passes configuration-related information, allowing one configuration for multiple calls.  
- The `X.run()` function passes IO-related `key` information. Details are provided in the operator examples below.

## Detailed Operator Specifications

### 1. SQLFilter✨

**Description**: Filters invalid data  
- Removes gold SQL with execution errors  
- Filters SQL inconsistent with the question description  
- Dual screening ensures data quality  

**Input Parameters**:  
- `__init__()`  
  - `llm_serving`: LLM service interface for consistency checks  
  - `db_root_path`: Root directory path for database files  
  - `num_cpus`: Number of CPU cores for parallel processing (default: 20)  
  - `meta_time_out`: SQL execution timeout in seconds (default: 120)  

- `run()`  
  - `input_sql_key`: SQL statement field name (default: "SQL")  
  - `input_dbid_key`: Database ID field name (default: "db_id")  
  - `input_question_key`: Question field name (default: "question")  

**Key Features**:  
- Parallel SQL execution validation  
- LLM-driven semantic consistency checks  
- Automatic filtering of unqualified data  
- Detailed filtering statistics  

**Example**:  
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

**Description**: Based on [Spider](https://arxiv.org/abs/1809.08887) standards, grades difficulty (easy/medium/hard/extra) by SQL syntax complexity.  

**Input Parameters**:  
- `__init__()`: No special parameters; uses predefined SQL complexity rules.  
- `run()`:  
  - `input_sql_key`: SQL statement field name (default: "SQL")  
  - `output_difficulty_key`: Output difficulty label field name (default: "sql_component_difficulty")  

**Key Features**:  
- Complexity analysis based on SQL syntax  
- Supports nested queries, aggregate functions, joins, etc.  
- Standardized four-level difficulty classification  
- Fast batch processing  

**Example**:  
```python
sql_difficulty_classifier = SQLDifficultyClassifier()
sql_difficulty_classifier.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    output_difficulty_key="sql_component_difficulty"
)
```

### 3. SchemaLinking  

**Description**: Extracts relevant tables and columns from the full database schema based on SQL statements.  

**Input Parameters**:  
- `__init__()`:  
  - `table_info_file`: Path to the database table info file.  
- `run()`:  
  - `input_sql_key`: SQL statement field name  
  - `input_dbid_key`: Database ID field name  
  - `output_used_schema_key`: Output schema field name  

**Key Features**:  
- Auto-detects tables/columns used in SQL  
- Extracts concise schema from the full database  
- Generates optimized schema descriptions  

**Example**:  
```python
schema_linking = SchemaLinking(table_info_file="path/to/tables.json")
schema_linking.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    input_dbid_key="db_id",
    output_used_schema_key="selected_schema"
)
```

### 4. DatabaseSchemaExtractor  

**Description**: Constructs and formats schema information.  

**Input Parameters**:  
- `__init__()`:  
  - `table_info_file`: Path to the table info file  
  - `db_root_path`: Root directory path for databases  
- `run()`:  
  - `input_db_key`: Database ID field name  
  - `table_schema_file_db_key`: Database ID field name in the schema file  
  - `selected_schema_key`: Selected schema field name  
  - `output_raw_schema_key`: Output raw schema field name  
  - `output_ddl_key`: Output DDL statements field name  
  - `output_whole_format_schema_key`: Output formatted schema field name  

**Key Features**:  
- Multiple schema output formats  
- Auto-generates DDL statements  
- Supports selective schema extraction  
- Standardized schema descriptions  

**Example**:  
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

**Description**: Generates additional knowledge required to derive SQL queries from natural language questions, explaining:  
- Quantifier-to-value mappings  
- Noun-entity relationships  

**Input Parameters**:  
- `__init__()`:  
  - `llm_serving`: LLM service interface  
  - `exist_knowledge`: Whether knowledge exists (default: False)  
  - `max_retries`: Maximum retries (default: 2)  
  - `batch_size`: Batch size (default: 50)  
- `run()`:  
  - `input_question_key`: Question field name (default: "question")  
  - `input_sql_key`: SQL field name (default: "SQL")  
  - `input_schema_key`: Schema field name (default: "ddl")  
  - `output_knowledge_key`: Output knowledge field name (default: "evidence")  

**Key Features**:  
- Smart domain knowledge extraction  
- Batch processing for efficiency  
- Auto-retry mechanism  
- Supports multiple knowledge types  

**Example**:  
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

### 6. QuestionRefiner🚀  

**Description**: Standardizes question phrasing:  
- Splits compound questions  
- Unifies question formats (starting with What/How)  
- Improves clarity and accuracy  

**Input Parameters**:  
- `__init__()`:  
  - `llm_serving`: LLM service interface  
  - `num_threads`: Thread count (default: 5)  
  - `max_retries`: Maximum retries (default: 3)  
- `run()`:  
  - `input_question_key`: Input question field name (default: "question")  
  - `output_refined_question_key`: Output refined question field name (default: "refined_question")  

**Key Features**:  
- Question syntax standardization  
- Intelligent splitting of compound questions  
- Multi-threaded processing  
- Auto-error recovery  

**Example**:  
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

### 7. PromptGeneration✨  

**Description**: Constructs training Q&A data:  
- Questions for SFT training  
- High-quality chain-of-thought answers  
- Questions for RL training  

**Input Parameters**:  
- `__init__()`:  
  - `llm_serving`: LLM service interface  
  - `db_root_path`: Database root path  
  - `num_threads`: Thread count (default: 5)  
  - `timeout`: Timeout in seconds (default: 60)  
- `run()`:  
  - `input_sql_key`: SQL field name (default: "SQL")  
  - `input_question_key`: Question field name (default: "question")  
  - `input_dbid_key`: Database ID field name (default: "db_id")  
  - `input_schema_key`: Schema field name (default: "ddl")  
  - `output_sft_prompt_key`: SFT prompt field name (default: "sft_prompt")  
  - `output_rl_prompt_key`: RL prompt field name (default: "rl_prompt")  
  - `output_cot_key`: Chain-of-thought output field name (default: "sft_output")  

**Key Features**:  
- Supports multiple training formats  
- High-quality reasoning chain generation  
- Parallel processing  
- Custom prompt templates  

**Example**:  
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

### 8. Text2SQLDifficultyClassifier🚀  

**Description**: Grades generation difficulty based on execution pass rate:  
- Tests execution success rate via multiple model generations  
- Configurable thresholds (easy/medium/hard/extra)  
- Supports multi-model testing  

**Input Parameters**:  
- `__init__()`:  
  - `llm_serving`: LLM service interface  
  - `db_root_path`: Database root path  
  - `num_cpus`: CPU cores for parallel processing (default: 1)  
  - `meta_time_out`: SQL execution timeout (default: 120.0)  
  - `easy_medium`: Easy threshold (default: 9)  
  - `medium_hard`: Medium threshold (default: 5)  
  - `hard_extra`: Hard threshold (default: 2)  
- `run()`:  
  - `input_dbid_key`: Database ID field name (default: "db_id")  
  - `input_sql_key`: SQL field name (default: "SQL")  
  - `input_prompt_key`: Input prompt field name (default: "rl_prompt")  
  - `output_difficulty_key`: Output difficulty field name (default: "sql_execution_difficulty")  

**Key Features**:  
- Execution-based difficulty assessment  
- Configurable thresholds  
- Statistical analysis of multiple generations  
- Parallel processing  

**Example**:  
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