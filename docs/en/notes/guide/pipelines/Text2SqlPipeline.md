---
title: Text-to-SQL Data Synthesis Pipeline  
icon: material-symbols-light:checkbook-outline-rounded  
createTime: 2025/06/17 02:00:31  
permalink: /en/guide/text2sqlpipeline/  

---

# Text-to-SQL Data Synthesis Pipeline

## 1. Overview

The core objective of the **Text-to-SQL Data Synthesis Pipeline** is to create high-quality question-answer data for each sample—including training prompts and chain-of-thought reasoning—by cleaning and augmenting existing Text-to-SQL data. This pipeline enables one-click processing from raw data to final training data, and currently supports the following two data generation modes:

### Supported Application Scenarios:
* **Data Refinement Mode**:
  - Filters, augments, and enhances existing data to generate high-quality training data
  - Input requirements: must include database ID, natural language question, and standard SQL answer
* **Data Synthesis Mode**:
  - Generates training data directly from the database
  - Feature: No existing data samples required, zero-shot initialization

### Processing Workflow:
1. **Data Filtering**:
   - Execution Filter: Remove invalid or non-executable SQL statements
   - Consistency Filter: Ensure consistency among question, SQL, and database schema
2. **Data Generation**:
   - SQL Variation Generation: Generate semantically equivalent variants based on existing SQL
   - SQL Synthesis: Generate new SQL statements based on the database schema
   - Question Generation: Generate corresponding natural language descriptions based on SQL and schema
3. **Training Data Construction**:
   - Prompt Generation: Integrate natural language questions, database schema, and instruction prompts
   - Chain-of-Thought Generation: Build step-by-step reasoning processes (Chain-of-Thought)
4. **Data Grading**:
   - Syntax Difficulty Grading: Classify by SQL statement complexity
   - Execution Difficulty Grading: Assess difficulty based on SQL execution pass rate

## 2. Input Data

According to different requirements, the pipeline is divided into two flows: the data refinement pipeline (selects and augments from existing data) and the data synthesis pipeline (no existing data needed, generated directly from the database).

### 2.1 Data Refinement Pipeline

Input data for this pipeline mainly includes the following fields:

* **db_id**: Database file name, i.e., database ID
* **question**: Natural language question
* **SQL**: Standard SQL answer

- **Example** (`json`):
  ```json
  {
    "db_id": "california_schools",
    "question": "What is the highest eligible free rate for K-12 students in the schools in Alameda County?",
    "SQL": "SELECT `Free Meal Count (K-12)` / `Enrollment (K-12)` FROM frpm WHERE `County Name` = 'Alameda' ORDER BY (CAST(`Free Meal Count (K-12)` AS REAL) / `Enrollment (K-12)`) DESC LIMIT 1"
  }
  ```
- **Demo Dataset**:  
  `example_data/Text2SQLPipeline/pipeline_refine.jsonl`  
  Includes database ID, natural language question, and standard SQL answer, suitable for quick testing and demos.

These input data can be stored in designated files (such as `json`, `jsonl`) and managed/read using the `FileStorage` object. The example loads a default data path, but you can modify the path to load custom data and cache as needed:

```python
self.storage = FileStorage(
    first_entry_file_name="../example_data/Text2SQLPipeline/pipeline_refine.jsonl",
    cache_path="./cache_local",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl"
)
```

### 2.2 Data Synthesis Pipeline

This pipeline does not require existing data; data is synthesized directly from the database. Therefore, you only need to configure the database. After configuring the database, pass it to the DatabaseManager for management. No need to provide `first_entry_file_name`, so set it to `""`.

```python
self.storage = FileStorage(
    first_entry_file_name="",
    cache_path="./cache",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl"
)
```

## 3. Configuration Instructions

Before running the pipeline, please read the following configuration instructions. After completing the relevant parameter configurations, you can proceed to run.

### 3.1 Database Configuration

When parsing and executing the database, you need to configure corresponding database information. Currently, SQLite and MySQL databases are supported. Support for other databases is continually being updated.

#### 3.1.1 SQLite Database

SQLite is a file-based database system, so you need to specify the storage path of the database files.

- **Database Root Directory**: Directory for storing all database files  
  - **Note**: This directory should contain multiple `.sqlite` or `.db` format database files. The database manager will automatically scan and load all database files in this directory.
  
  - **Important Reminder**: Each database file name is the `db_id`, and should be in the format `db_id.sqlite` or `db_id.db`, matching the `db_id` in the input data.

  - **Supported Directory Structures**:  
    The database manager supports arbitrary nesting levels. Here are some valid structure examples:
    ```
    databases/
      ├── california_schools.sqlite
      └── hospitals.sqlite
    ```

    ```
    databases/
      ├── folder1/
      │   └── california_schools.sqlite
      └── folder2/
          └── hospitals.sqlite
    ```

    ```
    databases/
      ├── california_schools.sqlite
      └── folder1/
          └── hospitals.sqlite
    ```

  - **Demo Database**:  
    We provide example databases for testing. Please visit:  
    [https://huggingface.co/datasets/Open-Dataflow/dataflow-Text2SQL-database-example](https://huggingface.co/datasets/Open-Dataflow/dataflow-Text2SQL-database-example)

    **Usage Steps**:
    1. Download the `databases` archive and extract it locally
    2. Assign the extracted path to the variable `db_root_path`
    3. Configure the database manager in code as follows:

    ```python
    database_manager = DatabaseManager(
        db_type="sqlite",
        config={
            "root_path": db_root_path
        }
    )
    ```

    > Note: `db_type` must be set to `"sqlite"`, and `root_path` should be the path to the database folder.

#### 3.1.2 MySQL Database

MySQL databases are server-based and require management of server connection information. Ensure your MySQL service is running and properly configured with username and password. In DataFlow, the `pymysql` library is used to connect to the MySQL server.

- **Configuration Steps**:
  1. Prepare MySQL server information  
  2. Configure MySQL server information in `database_manager`:
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
   > Here, `db_type` must be set to `mysql`. In `config`, set `host`, `user`, and `password` with your MySQL server info. Ensure the required databases exist on the server and you have necessary access permissions.

### 3.2 Model Configuration

#### 3.2.1 API LLM Service Configuration

In DataFlow, the `APILLMServing_request` class manages API-based LLM services.

```python
api_llm_serving = APILLMServing_request(
    api_url="https://api.openai.com/v1/chat/completions",
    model_name="chatgpt",
    max_workers=100
)

cot_generation_api_llm_serving = APILLMServing_request(
    api_url="https://api.openai.com/v1/chat/completions",
    model_name="gpt-4o",  # Use a higher-performance model for long-chain reasoning generation
    max_workers=100
)

embedding_api_llm_serving = APILLMServing_request(
    api_url="https://api.openai.com/v1/embeddings",
    model_name="text-embedding-ada-002",
    max_workers=100
)
```

Where:
- `api_llm_serving` handles general prompt generation tasks;
- `cot_generation_api_llm_serving` generates complex reasoning chains (Chain-of-Thought);
- `embedding_api_llm_serving` generates text embedding vectors.

You may switch to other models or API providers as needed.

#### 3.2.2 Local Model Service Configuration

In DataFlow, the `LocalModelLLMServing_vllm` class manages locally deployed large language model services.

```python
llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-7B-Instruct", 
    vllm_tensor_parallel_size=1,
    vllm_max_tokens=8192,
)

cot_generation_llm_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="Qwen/Qwen2.5-7B-Instruct", 
    vllm_tensor_parallel_size=1,
    vllm_max_tokens=8192,
)

embedding_serving = LocalModelLLMServing_vllm(
    hf_model_name_or_path="Alibaba-NLP/gte-Qwen2-7B-instruct", 
    vllm_max_tokens=8192
)
```

Where:
- `llm_serving` handles general prompt generation tasks;
- `cot_generation_llm_serving` generates complex reasoning chains;
- `embedding_serving` generates text embedding vectors.

### 3.3 Other Parameter Configurations

#### 3.3.1 Difficulty Classification Configuration

```python
execution_difficulty_config = {
    'thresholds': [2, 5, 9],
    'labels': ['easy', 'medium', 'hard', 'extra']
}

component_difficulty_config = {
    'thresholds': [2, 4, 6],      
    'labels': ['easy', 'medium', 'hard', 'extra']
}
```

Where:
- `execution_difficulty_config` is used for execution difficulty classification;
- `component_difficulty_config` is used for SQL component complexity classification.

Notes:
- Both `thresholds` and `labels` must be provided;
- `thresholds` must be in ascending order;
- The number of `labels` must be one more than `thresholds`;
- Classification is based on a score in the range 0–10; higher scores indicate greater difficulty, so `thresholds` should be within 0–10.

#### 3.3.2 Prompt Template Configuration

```python
prompt_template = '''Task Overview:
            /* Given the following database schema: */
            {schema}
            /* Answer the following: {question} */
            Let's think step by step'''
```

This template is used to build prompts for the model, where `{schema}` and `{question}` are placeholders for the database schema and user question, respectively.  
You may customize the template as needed, but **must retain these two placeholders** to ensure the integrity of data injection.

#### 3.3.3 Database Schema Configuration

```python
schema_config = {
    'format': 'ddl',  # Options: 'ddl' or 'formatted_schema'
    'use_example': False  # Whether to include example data
}
```

Explanation:
- `format`: Specifies the output format of the database schema, supports `'ddl'` (Data Definition Language) and `'formatted_schema'` (structured display);
- `use_example`: Whether to include example data in the schema, set to `True` or `False`.

## 4. Data Flow and Pipeline Logic

### 4.1 Data Filters

#### 4.1.1 **SQL Execution Filter (`ExecutionFilter`)**

The **SQL Execution Filter** validates the executability of SQL statements by actually running them, filtering out those that fail.

**Functionality:**

* Verifies executability of SQL statements
* Filters out SQL statements with syntax errors or execution failures

**Input**: SQL statement and database ID  
**Output**: Executable SQL statement

```python
execution_filter = ExecutionFilter(
    database_manager=database_manager
)
```

#### 4.1.2 **SQL Consistency Filter (`ConsistencyFilter`)**

The **SQL Consistency Filter** checks the consistency among the SQL statement, the question, and the database schema to ensure the SQL correctly answers the corresponding question.

**Functionality:**

* Verifies consistency among SQL statement, question, and database schema
* Filters out SQL statements not matching the question or schema

**Input**: SQL statement, database ID, and question  
**Output**: SQL statements consistent with the question

```python
consistency_filter = ConsistencyFilter(
    llm_serving=api_llm_serving,
    database_manager=database_manager
)
```

### 4.2 Data Generators

#### 4.2.1 **SQL Generator (`SQLGenerator`)**

The **SQL Generator** generates SQL queries based on the database schema, supplying the raw SQL data for subsequent processing.

**Functionality:**

* Automatically generates SQL queries from the database schema
* Supports batch generation of a specified number of SQL statements

**Input**: Database schema information  
**Output**: Generated SQL statements and corresponding database ID

```python
sql_generator = SQLGenerator(
    llm_serving=api_llm_serving,
    database_manager=database_manager,
    generate_num=300
)
```

#### 4.2.2 **SQL Variation Generator (`SQLVariationGenerator`)**

The **SQL Variation Generator** creates multiple functionally equivalent variants based on existing SQL statements, enriching the diversity of the dataset.

**Functionality:**

* Generates functionally equivalent SQL variants
* Increases the diversity and complexity of SQL statements

**Input**: Original SQL statement and database ID  
**Output**: Collection of SQL variants

```python
sql_variation_generator = SQLVariationGenerator(
    llm_serving=api_llm_serving,
    database_manager=database_manager,
    num_variations=5
)
```

#### 4.2.3 **Question Generator (`QuestionGeneration`)**

The **Question Generator** creates corresponding natural language questions for given SQL statements, constructing Text-to-SQL question-answer pairs.

**Functionality:**

* Generates natural language questions based on SQL statements
* Supports generation of multiple candidate questions

**Input**: SQL statement and database ID  
**Output**: Natural language question

```python
question_generator = QuestionGeneration(
    llm_serving=api_llm_serving,
    embedding_api_llm_serving=embedding_api_llm_serving,
    database_manager=database_manager,
    question_candidates_num=5
)
```

#### 4.2.4 **Prompt Generator (`PromptGenerator`)**

The **Prompt Generator** creates prompt templates for model training based on the question and database schema.

**Functionality:**

* Generates structured prompt templates
* Integrates question and database schema information

**Input**: Question and database ID  
**Output**: Formatted prompt template

```python
prompt_generator = PromptGenerator(
    database_manager=database_manager,
    prompt_template=prompt_template,
    schema_config=schema_config
)
```

#### 4.2.5 **Chain-of-Thought Generator (`CoTGenerator`)**

The **Chain-of-Thought Generator** produces detailed reasoning steps for SQL queries, helping models understand the logic behind question-to-SQL transformations.

**Functionality:**

* Generates reasoning steps for SQL queries
* Supports retry mechanism to ensure generation quality

**Input**: SQL statement, question, and database ID  
**Output**: Chain-of-thought reasoning process

```python
cot_generator = CoTGenerator(
    llm_serving=cot_generation_api_llm_serving,
    database_manager=database_manager,
    schema_config=schema_config,
    max_retries=3,
    enable_retry=True
)
```

### 4.3 Data Evaluators

#### 4.3.1 **Component Difficulty Classifier (`ComponentClassifier`)**

The **Component Difficulty Classifier** analyzes the component complexity of SQL statements and labels the difficulty level of each data sample.

**Functionality:**

* Analyzes the component complexity of SQL statements
* Labels the sample with a difficulty level

**Input**: SQL statement  
**Output**: SQL component difficulty level

```python
component_classifier = ComponentClassifier(
    difficulty_config=component_difficulty_config
)
```

#### 4.3.2 **Execution Difficulty Classifier (`ExecutionClassifier`)**

The **Execution Difficulty Classifier** evaluates the execution difficulty of SQL queries, providing a comprehensive assessment based on multiple generations.

**Functionality:**

* Evaluates the execution difficulty of SQL queries
* Assesses difficulty based on multiple generations

**Input**: SQL statement, database ID, and prompt  
**Output**: SQL execution difficulty level

```python
execution_classifier = ExecutionClassifier(
    llm_serving=api_llm_serving,
    database_manager=database_manager,
    difficulty_config=execution_difficulty_config,
    num_generations=5
)
```

## 5. **Output Data**

- **Format**: `jsonl` (Each step generates a file)  
- **Field Description**:
  - `db_id`: Database ID
  - `question`: Natural language question
  - `SQL`: Standard SQL answer
  - `prompt`: Training prompt, including the natural language question, database schema, and prompt information
  - `cot_reasoning`: Chain-of-thought reasoning data, including reasoning process and final answer for model training
  - `sql_component_difficulty`: SQL component complexity assessment
  - `sql_execution_difficulty`: SQL execution complexity assessment
- **Example**:
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

## 6. How to Run

Two pipelines are designed here. You can execute different configurations with simple Python commands to meet different data requirements:

* **Data Refinement Pipeline**:

  ```bash
  python /pipelines/api_pipelines/text2sql_pipeline_refine.py
  ```

* **Data Synthesis Pipeline**:

  ```bash
  python /pipelines/api_pipelines/text2sql_pipeline_gen.py
  ```


## 7. Pipeline Examples

Below is an example pipeline demonstrating how to use multiple operators for inference data processing. This example illustrates how to initialize an inference data processing pipeline and sequentially execute various filtering and cleaning steps.

**Refinement Pipeline**:
```python
class Text2SQLPipeline():
    def __init__(self):

        self.storage = FileStorage(
            first_entry_file_name="../example_data/Text2SQLPipeline/pipeline_refine.jsonl",
            cache_path="./cache_local",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl"
        )

        api_llm_serving = APILLMServing_request(
            api_url="http://api.openai.com/v1/chat/completions",
            model_name="gpt-4o",
            max_workers=100
        )

        cot_generation_api_llm_serving = APILLMServing_request(
            api_url="http://api.openai.com/v1/chat/completions",
            model_name="gpt-4o", 
            max_workers=100
        )

        embedding_api_llm_serving = APILLMServing_request(
            api_url="http://api.openai.com/v1/embeddings",
            model_name="text-embedding-ada-002",
            max_workers=100
        )

        execution_difficulty_config = {
            'thresholds': [2, 5, 9],
            'labels': ['easy', 'medium', 'hard', 'extra']
        }

        component_difficulty_config = {
            'thresholds': [2, 4, 6],      
            'labels': ['easy', 'medium', 'hard', 'extra']
        }

        prompt_template = '''Task Overview:
            /* Given the following database schema: */
            {schema}
            /* Answer the following: {question} */
            Let's think step by step'''

        schema_config = {
            'format': 'ddl',  
            'use_example': False  
        }

        db_root_path = "path/to/your/database"  

        database_manager = DatabaseManager(
            db_type="sqlite",
            config={
                "root_path": db_root_path
            }
        )
        
        self.sql_execution_filter_step1 = ExecutionFilter(
            database_manager=database_manager
        )

        self.sql_consistency_filter_step2 = ConsistencyFilter(
            llm_serving=api_llm_serving,
            database_manager=database_manager
        )

        self.sql_variation_generator_step3 = SQLVariationGenerator(
            llm_serving=api_llm_serving,
            database_manager=database_manager,
            num_variations=5
        )

        self.sql_execution_filter_step4 = ExecutionFilter(
            database_manager=database_manager
        )

        self.text2sql_question_generator_step5 = QuestionGeneration(
            llm_serving=api_llm_serving,
            embedding_api_llm_serving=embedding_api_llm_serving,
            database_manager=database_manager,
            question_candidates_num=5
        )

        self.text2sql_prompt_generator_step6 = PromptGenerator(
            database_manager=database_manager,
            prompt_template=prompt_template,
            schema_config=schema_config
        )

        self.sql_cot_generator_step7 = CoTGenerator(
            llm_serving=cot_generation_api_llm_serving,
            database_manager=database_manager,
            schema_config=schema_config,
            max_retries=3,
            enable_retry=True
        )

        self.sql_component_classifier_step8 = ComponentClassifier(
            difficulty_config=component_difficulty_config
        )

        self.sql_execution_classifier_step9 = ExecutionClassifier(
            llm_serving=api_llm_serving,
            database_manager=database_manager,
            difficulty_config=execution_difficulty_config,
            num_generations=5
        )
        
        
    def forward(self):

        sql_key = "SQL"
        db_id_key = "db_id"
        question_key = "question"

        self.sql_execution_filter_step1.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_db_id_key=db_id_key
        )

        self.sql_consistency_filter_step2.run(
            storage=self.storage.step(),   
            input_sql_key=sql_key,
            input_db_id_key=db_id_key,
            input_question_key=question_key
        )

        self.sql_variation_generator_step3.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_db_id_key=db_id_key
        )

        self.sql_execution_filter_step4.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_db_id_key=db_id_key
        )

        self.text2sql_question_generator_step5.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_db_id_key=db_id_key,
            output_question_key=question_key
        )

        self.text2sql_prompt_generator_step6.run(
            storage=self.storage.step(),
            input_question_key=question_key,
            input_db_id_key=db_id_key,
            output_prompt_key="prompt"
        )

        self.sql_cot_generator_step7.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_question_key=question_key,
            input_db_id_key=db_id_key,
            output_cot_key="cot_reasoning"
        )

        self.sql_component_classifier_step8.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            output_difficulty_key="sql_component_difficulty"
        )

        self.sql_execution_classifier_step9.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_db_id_key=db_id_key,
            input_prompt_key="prompt",
            output_difficulty_key="sql_execution_difficulty"
        )

if __name__ == "__main__":
    model = Text2SQLPipeline()
    model.forward()
```

**Synthesis Pipeline**:
```python
class Text2SQLPipeline():
    def __init__(self):

        self.storage = FileStorage(
            first_entry_file_name="",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl",
        )

        api_llm_serving = APILLMServing_request(
            api_url="http://api.openai.com/v1/chat/completions",
            model_name="gpt-4o",
            max_workers=100
        )

        cot_generation_api_llm_serving = APILLMServing_request(
            api_url="http://api.openai.com/v1/chat/completions",
            model_name="gpt-4o", 
            max_workers=100
        )

        embedding_api_llm_serving = APILLMServing_request(
            api_url="http://api.openai.com/v1/embeddings",
            model_name="text-embedding-ada-002",
            max_workers=100
        )

        execution_difficulty_config = {
            'thresholds': [2, 5, 9],
            'labels': ['easy', 'medium', 'hard', 'extra']
        }

        component_difficulty_config = {
            'thresholds': [2, 4, 6],      
            'labels': ['easy', 'medium', 'hard', 'extra']
        }

        prompt_template = '''Task Overview:
            /* Given the following database schema: */
            {schema}
            /* Answer the following: {question} */
            Let's think step by step'''

        schema_config = {
            'format': 'ddl',  
            'use_example': True  
        }

        db_root_path = "path/to/your/database"  

        database_manager = DatabaseManager(
            db_type="sqlite",
            config={
                "root_path": db_root_path
            }
        )
        
        self.sql_generator_step1 = SQLGenerator(
            llm_serving=api_llm_serving,
            database_manager=database_manager,
            generate_num=300
        )

        self.sql_execution_filter_step2 = ExecutionFilter(
            database_manager=database_manager
        )

        self.text2sql_question_generator_step3 = QuestionGeneration(
            llm_serving=api_llm_serving,
            embedding_api_llm_serving=embedding_api_llm_serving,
            database_manager=database_manager,
            question_candidates_num=5
        )

        self.text2sql_prompt_generator_step4 = PromptGenerator(
            database_manager=database_manager,
            prompt_template=prompt_template,
            schema_config=schema_config
        )

        self.sql_cot_generator_step5 = CoTGenerator(
            llm_serving=cot_generation_api_llm_serving,
            database_manager=database_manager,
            schema_config=schema_config,
            max_retries=3,
            enable_retry=True
        )

        self.sql_component_classifier_step6 = ComponentClassifier(
            difficulty_config=component_difficulty_config
        )

        self.sql_execution_classifier_step7 = ExecutionClassifier(
            llm_serving=api_llm_serving,
            database_manager=database_manager,
            difficulty_config=execution_difficulty_config,
            num_generations=5
        )
        
        
    def forward(self):

        sql_key = "SQL"
        db_id_key = "db_id"
        question_key = "question"

        self.sql_generator_step1.run(
            storage=self.storage.step(),
            output_sql_key=sql_key,
            output_db_id_key=db_id_key
        )

        self.sql_execution_filter_step2.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_db_id_key=db_id_key
        )

        self.text2sql_question_generator_step3.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_db_id_key=db_id_key,
            output_question_key=question_key
        )

        self.text2sql_prompt_generator_step4.run(
            storage=self.storage.step(),
            input_question_key=question_key,
            input_db_id_key=db_id_key,
            output_prompt_key="prompt"
        )

        self.sql_cot_generator_step5.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_question_key=question_key,
            input_db_id_key=db_id_key,
            output_cot_key="cot_reasoning"
        )

        self.sql_component_classifier_step6.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            output_difficulty_key="sql_component_difficulty"
        )

        self.sql_execution_classifier_step7.run(
            storage=self.storage.step(),
            input_sql_key=sql_key,
            input_db_id_key=db_id_key,
            input_prompt_key="prompt",
            output_difficulty_key="sql_execution_difficulty"
        )

if __name__ == "__main__":
    model = Text2SQLPipeline()
    model.forward()
```