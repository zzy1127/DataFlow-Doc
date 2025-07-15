---
title: Text2SQL Operators
createTime: 2025/06/24 11:43:42
permalink: /en/guide/Text2SQL_operators/
---

# Text2SQL Operators  

## Overview  

Text-to-SQL operators are specialized components designed for processing and enhancing Text-to-SQL data, aiming to:  
- Clean and expand existing Text-to-SQL datasets  
- Generate high-quality question-answer pairs with training prompts and chain-of-thought reasoning  
- Provide multi-dimensional data quality assessment and difficulty grading  

The open-source operator types are quite limited. To achieve better data processing quality and fill gaps in open-source data synthesis and processing methods, we have meticulously designed and **independently developed** a new set of operators, marked as follows:  

- 🚀 **Independent Innovation**: Core algorithms are original, addressing gaps in existing methods or significantly improving performance to break current bottlenecks.  
- ✨ **Open-Source Debut**: First-time integration of these operators into mainstream community frameworks for broader developer accessibility and open-source sharing.  

## Data Generation Operators  

<table class="tg">  
  <thead>  
    <tr>  
      <th class="tg-0pky">Name</th>  
      <th class="tg-0pky">Type</th>  
      <th class="tg-0pky">Description</th>  
      <th class="tg-0pky">Official Repository/Paper</th>  
    </tr>  
  </thead>  
  <tbody>  
    <tr>  
      <td class="tg-0pky">SQLGenerator</td>  
      <td class="tg-0pky">Data Generation</td>  
      <td class="tg-0pky">Generates diverse SQL statements based on database schemas</td>  
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2503.02240">OmniSQL</a></td>  
    </tr>  
    <tr>  
      <td class="tg-0pky">SQLVariationGenerator🚀</td>  
      <td class="tg-0pky">Data Augmentation</td>  
      <td class="tg-0pky">Generates SQL variants based on existing SQL and schemas</td>  
      <td class="tg-0pky">-</td>  
    </tr>  
    <tr>  
      <td class="tg-0pky">QuestionGeneration</td>  
      <td class="tg-0pky">Question Generation</td>  
      <td class="tg-0pky">Generates natural language questions from SQL</td>  
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2503.02240">OmniSQL</a></td>  
    </tr>  
    <tr>  
      <td class="tg-0pky">PromptGenerator✨</td>  
      <td class="tg-0pky">Prompt Generation</td>  
      <td class="tg-0pky">Constructs training prompts with schemas and questions</td>  
      <td class="tg-0pky">-</td>  
    </tr>  
    <tr>  
      <td class="tg-0pky">CoTGenerator</td>  
      <td class="tg-0pky">Reasoning Chain Generation</td>  
      <td class="tg-0pky">Generates step-by-step reasoning for SQL queries</td>  
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2503.02240">OmniSQL</a></td>  
    </tr>  
  </tbody>  
</table>  

## Data Evaluation Operators  

<table class="tg">  
  <thead>  
    <tr>  
      <th class="tg-0pky">Name</th>  
      <th class="tg-0pky">Type</th>  
      <th class="tg-0pky">Description</th>  
      <th class="tg-0pky">Official Repository/Paper</th>  
    </tr>  
  </thead>  
  <tbody>  
    <tr>  
      <td class="tg-0pky">ComponentClassifier</td>  
      <td class="tg-0pky">Difficulty Assessment</td>  
      <td class="tg-0pky">Grades difficulty based on SQL syntax complexity</td>  
      <td class="tg-0pky"><a href="https://arxiv.org/abs/1809.08887">Spider</a></td>  
    </tr>  
    <tr>  
      <td class="tg-0pky">ExecutionClassifier🚀</td>  
      <td class="tg-0pky">Execution Difficulty</td>  
      <td class="tg-0pky">Grades difficulty based on model execution success rate</td>  
      <td class="tg-0pky">-</td>  
    </tr>  
  </tbody>  
</table>  

## Data Filtering Operators  

<table class="tg">  
  <thead>  
    <tr>  
      <th class="tg-0pky">Name</th>  
      <th class="tg-0pky">Type</th>  
      <th class="tg-0pky">Description</th>  
      <th class="tg-0pky">Official Repository/Paper</th>  
    </tr>  
  </thead>  
  <tbody>  
    <tr>  
      <td class="tg-0pky">ExecutionFilter✨</td>  
      <td class="tg-0pky">Data Cleaning</td>  
      <td class="tg-0pky">Filters non-executable SQL statements</td>  
      <td class="tg-0pky">-</td>  
    </tr>  
    <tr>  
      <td class="tg-0pky">ConsistencyFilter✨</td>  
      <td class="tg-0pky">Data Cleaning</td>  
      <td class="tg-0pky">Validates semantic consistency between SQL and questions</td>  
      <td class="tg-0pky">-</td>  
    </tr>  
  </tbody>  
</table>  

## Operator Interface Usage  

For operators requiring specific storage paths or model calls, we provide encapsulated **model interfaces**, **storage interfaces**, and **database management interfaces** to predefine configurations.  

### Model Interface Configuration  

Configure model API parameters for operators, including generative and embedding models:  

```python  
from dataflow.llmserving import APILLMServing_request  

api_llm_serving = APILLMServing_request(  
    api_url="your_api_url",        # API endpoint  
    model_name="model_name",       # Model name  
    max_workers=5                  # Max concurrency  
)  
```  

### Storage Interface Configuration  

Predefine storage parameters for operators:  

```python  
from dataflow.utils.storage import FileStorage  

storage = FileStorage(  
    first_entry_file_name="your_file_path",           # Initial file path  
    cache_path="./cache",                             # Cache directory  
    file_name_prefix="dataflow_cache_step",           # Filename prefix  
    cache_type="jsonl",                               # Cache file type  
)  
```  

### Database Management Interface  

To read and manage database schemas, predefine the database manager:  

```python  
from dataflow.utils.text2sql.database_manager import DatabaseManager  

database_manager = DatabaseManager(  
    db_type="your_db_type",  # Supports SQLite and MySQL  
    config={  
        "your_db_config_key": "your_db_config_value"  
    }    
)  
```  

For SQLite and MySQL, configure as follows:  

```python  
# SQLite Example  
database_manager = DatabaseManager(  
    db_type="sqlite",  
    config={  
        "root_path": "/path/to/your/database/folder"  # Directory containing SQLite files  
    }  
)  

# MySQL Example  
database_manager = DatabaseManager(  
    db_type="mysql",  
    config={  
        "host": "localhost",           # Database host  
        "user": "root",                # Username  
        "password": "your_password",   # Password  
        "database": "your_database_name",  # Database name  
        "port": 3306                   # Port (optional, default 3306)  
    }  
)  
```  

The `api_llm_serving`, `self.storage`, and `database_manager` objects defined above are used in subsequent operator calls. For complete examples, refer to `/pipelines/api_pipelines/text2sql_pipeline_refine.py`.  

For parameter passing:  
- Operator constructors accept configuration-related parameters (reusable).  
- `X.run()` handles I/O-related keys (detailed in operator examples below).  

## Detailed Operator Specifications  

### Data Generation Operators  

#### 1. SQLGenerator  

**Description**: Generates diverse SQL statements from database schemas.  
- Covers various SQL syntax and difficulty levels  
- Supports complex queries (JOINs, subqueries, aggregates)  

**Parameters**:  
- `__init__()`  
  - `llm_serving`: LLM service interface for SQL generation  
  - `database_manager`: Database manager for schema access  
  - `generate_num`: Number of SQLs to generate per database  

- `run()`  
  - `output_sql_key`: Output SQL field name (default: "SQL")  
  - `output_db_id_key`: Output DB ID field name (default: "db_id")  

**Features**:  
- Intelligent schema analysis and SQL template generation  
- Multi-database support (SQLite, MySQL)  
- Automatic handling of table relationships and foreign keys  

**Example**:  
```python  
sql_generator = SQLGenerator(  
    llm_serving=api_llm_serving,  
    database_manager=database_manager,  
    generate_num=300  
)  
sql_generator.run(  
    storage=self.storage.step(),  
    output_sql_key="SQL",  
    output_db_id_key="db_id"  
)  
```  

#### 2. SQLVariationGenerator🚀  

**Description**: Generates SQL variants from existing SQL and schemas.  
- Enhances syntactic diversity  
- Supports alias replacement, subquery conversion, JOIN rewriting  

**Parameters**:  
- `__init__()`  
  - `llm_serving`: LLM service for variant generation  
  - `database_manager`: Validates variant correctness  
  - `num_variations`: Variants per SQL (default: 5)  

- `run()`  
  - `input_sql_key`: Input SQL field name (default: "SQL")  
  - `input_db_id_key`: Input DB ID field name (default: "db_id")  

**Features**:  
- Multi-directional variant generation  
- Supports complex query transformations  

**Example**:  
```python  
sql_variation_generator = SQLVariationGenerator(  
    llm_serving=api_llm_serving,  
    database_manager=database_manager,  
    num_variations=5  
)  
sql_variation_generator.run(  
    storage=self.storage.step(),  
    input_sql_key="SQL",  
    input_db_id_key="db_id"  
)  
```  

#### 3. QuestionGeneration

**Description:** Generates natural language questions based on SQL queries  
- Analyzes SQL semantics to produce coherent natural language questions  
- Uses embedding technology to select the optimal question candidate  
- Ensures alignment between questions and SQL query intent  
- Supports multiple question phrasing styles  

**Input Parameters:**  

- `__init__()`  
  - `llm_serving`: LLM service interface for question generation  
  - `embedding_api_llm_serving`: Embedding model interface for question selection  
  - `database_manager`: Database manager for schema retrieval  
  - `question_candidates_num`: Number of question candidates (default: 5)  

- `run()`  
  - `input_sql_key`: SQL query field name (default: "SQL")  
  - `input_db_id_key`: Database ID field name (default: "db_id")  
  - `output_question_key`: Output question field name (default: "question")  

**Key Features:**  
- Intelligent question generation based on SQL semantics  
- Multi-candidate generation and optimal selection  
- Contextual understanding with database schema  
- Ensures naturalness and accuracy of questions  

**Usage Example:**  
```python
question_generation = QuestionGeneration(
    llm_serving=api_llm_serving,
    embedding_api_llm_serving=embedding_api_llm_serving,
    database_manager=database_manager,
    question_candidates_num=5
)
question_generation.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    input_db_id_key="db_id",
    output_question_key="question"
)
```


#### 4. PromptGenerator✨  

**Description:** Constructs training prompts incorporating schema and questions  
- Formats database schema information  
- Generates standardized training prompts with questions  
- Supports multiple schema formats (DDL, formatted schema, etc.)  
- Configurable to include example data  

**Input Parameters:**  

- `__init__()`  
  - `database_manager`: Database manager for schema retrieval  
  - `prompt_template`: Prompt template (must include `{schema}` and `{question}` placeholders)  
  - `schema_config`: Schema configuration (`format` and `use_example` fields)  

- `run()`  
  - `input_question_key`: Question field name (default: "question")  
  - `input_db_id_key`: Database ID field name (default: "db_id")  
  - `output_prompt_key`: Output prompt field name (default: "prompt")  

**Key Features:**  
- Flexible prompt templating system  
- Multi-format schema support  
- Automatic schema formatting and optimization  
- Supports schemas with example data  

**Usage Example:**  
```python
prompt_generator = PromptGenerator(
    database_manager=database_manager,
    prompt_template='''Task Overview:
        /* Given the following database schema: */
        {schema}
        /* Answer the following: {question} */
        Let's think step by step''',
    schema_config={
        'format': 'ddl',
        'use_example': True
    }
)
prompt_generator.run(
    storage=self.storage.step(),
    input_question_key="question",
    input_db_id_key="db_id",
    output_prompt_key="prompt"
)
```

#### 5. CoTGenerator  

**Description:** Generates step-by-step Chain-of-Thought (CoT) reasoning for SQL queries  
- Produces detailed reasoning steps based on questions and SQL  
- Explains the logical process of SQL construction  
- Supports error retry and quality assurance  
- Enhances model reasoning and interpretability  

**Input Parameters:**  

- `__init__()`  
  - `llm_serving`: LLM service interface for CoT generation  
  - `database_manager`: Database manager for schema retrieval  
  - `schema_config`: Schema configuration (`format` and `use_example` fields)  
  - `max_retries`: Maximum retry attempts (default: 3)  
  - `enable_retry`: Whether to enable retry mechanism (default: True)  

- `run()`  
  - `input_sql_key`: SQL query field name (default: "SQL")  
  - `input_question_key`: Question field name (default: "question")  
  - `input_db_id_key`: Database ID field name (default: "db_id")  
  - `output_cot_key`: Output CoT reasoning field name (default: "cot_reasoning")  

**Key Features:**  
- High-quality reasoning chain generation  
- Automatic error detection and retry mechanism  
- Contextual reasoning with schema integration  
- Step-by-step decomposition of complex queries  

**Usage Example:**  
```python
cot_generator = CoTGenerator(
    llm_serving=cot_generation_api_llm_serving,
    database_manager=database_manager,
    schema_config={
        'format': 'ddl',
        'use_example': True
    },
    max_retries=3,
    enable_retry=True
)
cot_generator.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    input_question_key="question",
    input_db_id_key="db_id",
    output_cot_key="cot_reasoning"
)
```

### Data Evaluation Operators  

#### 1. ComponentClassifier  

**Description:** Classifies SQL difficulty based on syntactic complexity  
- Analyzes SQL components (JOINs, subqueries, aggregates, etc.)  
- Scores complexity using configurable thresholds  
- Provides standardized difficulty classification  

**Input Parameters:**  

- `__init__()`  
  - `difficulty_config`: Difficulty configuration (`thresholds` and `labels`)  

- `run()`  
  - `input_sql_key`: SQL query field name (default: "SQL")  
  - `output_difficulty_key`: Output difficulty label (default: "sql_component_difficulty")  

**Key Features:**  
- Syntax-based complexity analysis  
- Configurable thresholds and labels  
- Batch processing capability  

**Usage Example:**  
```python
component_classifier = ComponentClassifier(
    difficulty_config={
        'thresholds': [2, 4, 6],
        'labels': ['easy', 'medium', 'hard', 'extra']
    }
)
component_classifier.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    output_difficulty_key="sql_component_difficulty"
)
```

#### 2. ExecutionClassifier🚀  

**Description:** Classifies difficulty based on LLM execution success rate  
- Tests SQL generation with multiple LLM attempts  
- Dynamically adjusts difficulty based on success rate  
- Provides practical difficulty assessment  

**Input Parameters:**  

- `__init__()`  
  - `llm_serving`: LLM service for SQL generation  
  - `database_manager`: Database manager for execution validation  
  - `difficulty_config`: Difficulty configuration (`thresholds` and `labels`)  
  - `num_generations`: Test generations per query (default: 5)  

- `run()`  
  - `input_sql_key`: SQL query field name (default: "SQL")  
  - `input_db_id_key`: Database ID field name (default: "db_id")  
  - `input_prompt_key`: Prompt field name (default: "prompt")  
  - `output_difficulty_key`: Output difficulty label (default: "sql_execution_difficulty")  

**Key Features:**  
- Performance-based difficulty assessment  
- Dynamic difficulty adjustment  
- Statistical analysis of multiple generations  

**Usage Example:**  
```python
execution_classifier = ExecutionClassifier(
    llm_serving=api_llm_serving,
    database_manager=database_manager,
    difficulty_config={
        'thresholds': [2, 5, 9],
        'labels': ['easy', 'medium', 'hard', 'extra']
    },
    num_generations=5
)
execution_classifier.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    input_db_id_key="db_id",
    input_prompt_key="prompt",
    output_difficulty_key="sql_execution_difficulty"
)
```

### Data Filtering Operators  

#### 1. ExecutionFilter✨  

**Description:** Validates SQL executability and syntax correctness  
- Executes SQL in real database environments  
- Filters invalid/failing queries  
- Ensures dataset quality  

**Input Parameters:**  

- `__init__()`  
  - `database_manager`: Database manager for execution  

- `run()`  
  - `input_sql_key`: SQL query field name (default: "SQL")  
  - `input_db_id_key`: Database ID field name (default: "db_id")  

**Key Features:**  
- Real-time SQL validation  
- Automated filtering of failing queries  

**Usage Example:**  
```python
execution_filter = ExecutionFilter(
    database_manager=database_manager
)
execution_filter.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    input_db_id_key="db_id"
)
```

#### 2. ConsistencyFilter✨  

**Description:** Verifies semantic consistency between SQL and questions  
- Uses LLM to check if SQL results answer the question  
- Filters mismatched pairs  

**Input Parameters:**  

- `__init__()`  
  - `llm_serving`: LLM service for consistency checks  
  - `database_manager`: Database manager for execution  

- `run()`  
  - `input_sql_key`: SQL query field name (default: "SQL")  
  - `input_db_id_key`: Database ID field name (default: "db_id")  
  - `input_question_key`: Question field name (default: "question")  

**Key Features:**  
- Semantic alignment verification  
- Automated filtering of inconsistent pairs  

**Usage Example:**  
```python
consistency_filter = ConsistencyFilter(
    llm_serving=api_llm_serving,
    database_manager=database_manager
)
consistency_filter.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    input_db_id_key="db_id",
    input_question_key="question"
)
```