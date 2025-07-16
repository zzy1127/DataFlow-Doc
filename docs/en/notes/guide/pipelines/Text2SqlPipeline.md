---
title: Text-to-SQL Data Synthesis Pipeline  
icon: material-symbols-light:checkbook-outline-rounded  
createTime: 2025/06/17 02:00:31  
permalink: /en/guide/text2sqlpipeline/  

---

# Text-to-SQL Data Synthesis Pipeline

## 1. Overview

The **Text-to-SQL Data Synthesis Pipeline** is designed to clean and enhance existing Text-to-SQL datasets while generating high-quality Q&A samples containing training prompts and chain-of-thought reasoning. This end-to-end pipeline supports two operational modes:

### Supported Use Cases:
* **Data Refinement Mode**:
  - Filters, expands, and enhances existing training data
  - Input Requirements: Must include database ID, natural language question, and standard SQL answer
* **Data Synthesis Mode**:
  - Generates training data directly from databases
  - Feature: Requires no existing samples (zero-shot initialization)

### Processing Workflow:
1. **Data Filtering**:
  - Execution Filter: Eliminates invalid/non-executable SQL
  - Consistency Filter: Ensures question-SQL-schema alignment
2. **Data Generation**:
  - SQL Variation: Produces semantically equivalent SQL variants
  - SQL Synthesis: Generates new SQL from database schema
  - Question Generation: Creates natural language descriptions from SQL
3. **Training Data Construction**:
  - Prompt Engineering: Integrates questions, schema, and instructions
  - Chain-of-Thought: Builds step-by-step reasoning processes
4. **Difficulty Classification**:
  - Syntax Complexity: Grades SQL structural difficulty
  - Execution Difficulty: Evaluates based on success rates

## 2. Input Data Specifications

The pipeline operates in two distinct modes with different input requirements:

### 2.1 Data Refinement Pipeline

**Required Fields**:
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| db_id | string | Database identifier | "california_schools" |
| question | string | Natural language query | "Find highest free meal eligibility rate..." |
| SQL | string | Standard SQL answer | "SELECT `Free Meal Count...`" |

**Sample Input (JSON)**:
```json
{
  "db_id": "california_schools",
  "question": "What is the highest eligible free rate...",
  "SQL": "SELECT `Free Meal Count...`"
}
```

**Demo Dataset**:  
`example_data/Text2SQLPipeline/pipeline_refine.jsonl`  
Contains ready-to-use samples with all required fields for quick testing.

**Storage Configuration**:
```python
self.storage = FileStorage(
    first_entry_file_name="../example_data/Text2SQLPipeline/pipeline_refine.jsonl",
    cache_path="./cache_local",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl"
)
```

### 2.2 Data Synthesis Pipeline

This mode requires only database configuration:

```python
self.storage = FileStorage(
    first_entry_file_name="",  # Empty for synthesis mode
    cache_path="./cache",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl"
)
```

## 3. Configuration Guide

### 3.1 Database Configuration

#### 3.1.1 SQLite Databases
**Requirements**:
- Database files must use `.sqlite` or `.db` extension
- File naming convention: `[db_id].sqlite` or `[db_id].db`
- Supports nested directory structures

**Sample Structures**:
```
databases/
  ├── db1.sqlite
  └── subfolder/
      └── db2.db
```

**Configuration**:
```python
database_manager = DatabaseManager(
    db_type="sqlite",
    config={"root_path": "/path/to/databases"}
)
```

#### 3.1.2 MySQL Databases
**Requirements**:
- MySQL service must be running
- Valid credentials required

**Configuration**:
```python
database_manager = DatabaseManager(
    db_type="mysql",
    config={
        "host": "localhost",
        "user": "username",
        "password": "password"
    }
)
```

## 4. Pipeline Components

### 4.1 Data Processors

#### Execution Filter
- Validates SQL executability
- Removes syntactically invalid queries

#### Consistency Filter
- Ensures SQL-question-schema alignment
- Uses LLM-based verification

### 4.2 Data Generators

#### SQL Generator
- Creates new SQL from schema
- Configurable output volume

#### Question Generator
- Produces natural language questions
- Generates multiple question variants

## 5. Output Specifications

**Format**: JSON Lines (.jsonl)  
**Fields**:
- Complete prompt templates
- Annotated difficulty levels
- Detailed chain-of-thought reasoning

**Sample Output**:
```json
{
  "db_id": "schools_db",
  "SQL": "SELECT AVG(score) FROM...",
  "prompt": "Task: Given schema...",
  "cot_reasoning": "1. Identify required tables...",
  "difficulty": "intermediate"
}
```

## 6. Execution Methods

**Refinement Pipeline**:
```bash
python pipelines/text2sql_refine.py
```

**Synthesis Pipeline**:
```bash
python pipelines/text2sql_synthesize.py
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