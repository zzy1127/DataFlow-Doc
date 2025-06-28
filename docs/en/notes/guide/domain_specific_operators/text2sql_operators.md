---
title: Text2SQL Operators
createTime: 2025/06/24 11:43:42
permalink: /en/guide/Text2SQL_operators/
---

# Text2SQL Operators  

## Overview  

Text2SQL operators are specialized operator collections designed for processing and enhancing Text2SQL data quality, aiming to:  
- Clean and augment existing Text-to-SQL datasets  
- Generate high-quality Q&A pairs containing training prompts and chain-of-thought reasoning processes  
- Provide multi-dimensional data quality assessment and difficulty grading  

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Official Repo/Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">SQLFilter</td>
      <td class="tg-0pky">Data Cleaning</td>
      <td class="tg-0pky">Filters SQL execution exceptions and semantically inconsistent data</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">SQLDifficultyClassifier</td>
      <td class="tg-0pky">Difficulty Assessment</td>
      <td class="tg-0pky">Classifies difficulty levels based on SQL syntax complexity</td>
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
      <td class="tg-0pky">QuestionRefiner</td>
      <td class="tg-0pky">Question Optimization</td>
      <td class="tg-0pky">Standardizes and optimizes natural language question expressions</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">PromptGeneration</td>
      <td class="tg-0pky">Training Data Generation</td>
      <td class="tg-0pky">Constructs high-quality Q&A data for SFT and RL training</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">Text2SQLDifficultyClassifier</td>
      <td class="tg-0pky">Execution Difficulty Assessment</td>
      <td class="tg-0pky">Classifies difficulty levels based on model execution success rate</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>

## Operator Interface Specifications  

For operators requiring specific storage paths or model calls, we provide encapsulated **model interfaces** and **storage object interfaces**. Model API parameters can be predefined for operators as follows:  

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

The `api_llm_serving` and `self.storage` used in subsequent sections refer to the interface objects defined above. For complete usage examples, refer to `test/test_text2sql.py`.  

For parameter passing:  
- Operator constructors primarily pass operator configuration-related information (one configuration supports multiple calls)  
- The `X.run()` function passes IO-related `key` information (detailed in operator examples below)  

## Detailed Operator Specifications  

### 1. SQLFilter  

**Description:** Filters invalid data  
- Eliminates gold SQL with execution exceptions  
- Filters SQL inconsistent with question descriptions  
- Dual filtering ensures data quality  

**Parameters:**  

- `__init__()`  
  - `llm_serving`: LLM service interface for consistency checks  
  - `db_root_path`: Database file root directory path  
  - `num_cpus`: Number of CPU cores for parallel processing (default: 20)  
  - `meta_time_out`: SQL execution timeout in seconds (default: 120)  

- `run()`  
  - `input_sql_key`: SQL statement field name (default: "SQL")  
  - `input_dbid_key`: Database ID field name (default: "db_id")  
  - `input_question_key`: Question field name (default: "question")  

**Key Features:**  
- Parallel SQL execution validation  
- LLM-driven semantic consistency checks  
- Automatic filtering of unqualified data  
- Detailed filtering statistics report  

**Example:**  

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

**Description:** Classifies difficulty levels (easy/medium/hard/extra) based on SQL syntax complexity following [Spider](https://arxiv.org/abs/1809.08887) standards  

**Parameters:**  

- `__init__()`  
  - No special parameters required (uses predefined SQL complexity evaluation rules)  

- `run()`  
  - `input_sql_key`: SQL statement field name (default: "SQL")  
  - `output_difficulty_key`: Output difficulty label field name (default: "sql_component_difficulty")  

**Key Features:**  
- Complexity analysis based on SQL syntax structure  
- Supports nested queries, aggregate functions, join operations, etc.  
- Standardized four-level difficulty classification  
- Fast batch processing capability  

**Example:**  

```python
sql_difficulty_classifier = SQLDifficultyClassifier()
sql_difficulty_classifier.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    output_difficulty_key="sql_component_difficulty"
)
```

### 3. SchemaLinking  

**Description:** Extracts associated tables and columns from full database schema based on SQL statements  

**Parameters:**  

- `__init__()`  
  - `table_info_file`: Database table information file path  

- `run()`  
  - `input_sql_key`: SQL statement field name  
  - `input_dbid_key`: Database ID field name  
  - `output_used_schema_key`: Output schema field name  

**Key Features:**  
- Automatically identifies tables and columns used in SQL statements  
- Extracts relevant parts from complete database schema  
- Generates concise and effective schema information  

**Example:**  

```python
schema_linking = SchemaLinking(
    table_info_file="path/to/tables.json" 
)

schema_linking.run(
    storage=self.storage.step(),                
    input_sql_key="SQL",                
    input_dbid_key="db_id",             
    output_used_schema_key="selected_schema"  
)
```

### 4. DatabaseSchemaExtractor  

**Description:** Constructs schema information and formatted descriptions  

**Parameters:**  

- `__init__()`  
  - `table_info_file`: Database table information file path  
  - `db_root_path`: Database file root directory path  

- `run()`  
  - `input_db_key`: Database ID field name  
  - `table_schema_file_db_key`: Database ID field name in table schema file  
  - `selected_schema_key`: Selected schema field name  
  - `output_raw_schema_key`: Output raw schema field name  
  - `output_ddl_key`: Output DDL statements field name  
  - `output_whole_format_schema_key`: Output fully formatted schema field name  

**Key Features:**  
- Multiple schema format outputs  
- Automatic DDL statement generation  
- Supports selective schema extraction  
- Standardized schema description format  

**Example:**  

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
- Quantifier corresponding values  
- Noun entity mapping relationships  

**Parameters:**  

- `__init__()`  
  - `llm_serving`: LLM service interface  
  - `exist_knowledge`: Whether knowledge already exists (default: False)  
  - `max_retries`: Maximum retries (default: 2)  
  - `batch_size`: Batch size (default: 50)  

- `run()`  
  - `input_question_key`: Question field name (default: "question")  
  - `input_sql_key`: SQL statement field name (default: "SQL")  
  - `input_schema_key`: Schema field name (default: "ddl")  
  - `output_knowledge_key`: Output knowledge field name (default: "evidence")  

**Key Features:**  
- Intelligent domain knowledge extraction  
- Batch processing for efficiency  
- Automatic retry mechanism  
- Supports multiple knowledge type generation  

**Example:**  

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

**Description:** Standardizes question expressions  
- Splits compound questions  
- Unifies question formats (starting with What/How)  
- Optimizes question clarity and accuracy  

**Parameters:**  

- `__init__()`  
  - `llm_serving`: LLM service interface  
  - `num_threads`: Number of threads (default: 5)  
  - `max_retries`: Maximum retries (default: 3)  

- `run()`  
  - `input_question_key`: Input question field name (default: "question")  
  - `output_refined_question_key`: Output optimized question field name (default: "refined_question")  

**Key Features:**  
- Question grammar standardization  
- Intelligent splitting of compound questions  
- Multi-threaded parallel processing  
- Automatic error recovery mechanism  

**Example:**  

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

**Description:** Constructs training Q&A data  
- Questions for SFT training  
- High-quality answers with chain-of-thought reasoning  
- Questions for RL training  

**Parameters:**  

- `__init__()`  
  - `llm_serving`: LLM service interface  
  - `db_root_path`: Database file root directory path  
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
- Supports multiple training formats  
- High-quality chain-of-thought generation  
- Parallel processing capability  
- Customizable prompt templates  

**Example:**  

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

**Description:** Classifies generation difficulty based on execution pass rate  
- Tests execution success rate through multiple model generations  
- Configurable thresholds (easy/medium/hard/extra)  
- Supports multi-model testing and evaluation  

**Parameters:**  

- `__init__()`  
  - `llm_serving`: LLM service interface  
  - `db_root_path`: Database file root directory path  
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

**Example:**  

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