---
title: Text-to-SQL Data Synthesis Pipeline  
icon: material-symbols-light:checkbook-outline-rounded  
createTime: 2025/06/17 02:00:31  
permalink: /en/guide/text2sqlpipeline/  

---

# Text-to-SQL Data Synthesis Pipeline

## 1. Overview

The **Text-to-SQL Data Synthesis Pipeline** aims to:  
- Clean and augment existing Text-to-SQL data.  
- Generate high-quality Q&A pairs, including training prompts and chain-of-thought reasoning for each sample.  

The input data must include at least the following three components:  
1. Database ID  
2. Natural language question  
3. Standard SQL answer  

This pipeline is driven by a configurable `yaml` file and a unified `pipeline_step.py`, enabling one-click execution of all steps.  

---

## 2. One-Click Execution

Run the following script directly:  
```bash
bash Text2SqlPipeline/text2sql_pipeline.sh
```

---

## 3. Data Format

### 3.1 Database Configuration

Database information must be configured for parsing and execution.  

- **Schema Definition File**: `tables.json` (JSON format)  
  - **Description**: This file defines the database schema.  
  - **Reference**: The `tables.json` file in the [Spider dataset](https://drive.google.com/file/d/1403EGqzIDoHMdQF4c9Bkyl7dZLZ5Wt6J/view).  
  - **Example**:  
    ```json
    [
      {
        "db_id": "banking",
        "table_names_original": ["accounts", "customers", "transactions"],
        "table_names": ["Accounts", "Customers", "Transactions"],
        "column_names_original": [
          [-1, "*"],
          [0, "account_id"],
          [0, "customer_id"],
          [0, "balance"],
          [1, "customer_id"],
          [1, "name"],
          [1, "email"],
          [2, "transaction_id"],
          [2, "account_id"],
          [2, "amount"],
          [2, "date"]
        ],
        "column_names": [
          [-1, "*"],
          [0, "Account ID"],
          [0, "Customer ID"],
          [0, "Balance"],
          [1, "Customer ID"],
          [1, "Name"],
          [1, "Email"],
          [2, "Transaction ID"],
          [2, "Account ID"],
          [2, "Amount"],
          [2, "Date"]
        ],
        "column_types": [
          "text",
          "integer",
          "integer",
          "real",
          "integer",
          "text",
          "text",
          "integer",
          "integer",
          "real",
          "date"
        ],
        "primary_keys": [1, 4, 7],
        "foreign_keys": [
          [2, 4],
          [8, 1]
        ]
      }
    ]
    ```

- **Database Folder**: Contains executable database files.  
  - **Description**: The folder stores actual database files. Each database (`db_id_i`) must include an SQLite file (`db_id_i.sqlite`).  
  - **Reference**: The `database` folder in the [Spider dataset](https://drive.google.com/file/d/1403EGqzIDoHMdQF4c9Bkyl7dZLZ5Wt6J/view).  
  - **Structure Example**:  
    ```
    - database
      - db_id_1
        - db_id_1.sqlite
      - db_id_2
        - db_id_2.sqlite
      - db_id_3
        - db_id_3.sqlite
    ```

- **Schema Filter**: Filters database schemas.  
  - **Description**: Download the model from [Schema Filter](https://github.com/RUCKBReasoning/text2sql-schema-filter), extract it, and configure the path as a parameter.  

### 3.2 Input Data

- **Supported Formats**: `json`, `jsonl`  
- **Required Fields**:  
  - `db_id`: Database ID  
  - `question`: Natural language question  
  - `SQL`: Standard SQL answer  
- **Optional Fields**: Other fields will be ignored. It is recommended to retain only necessary fields to avoid conflicts with downstream processing.  
- **Example** (`json`):  
  ```json
  {
    "db_id": "california_schools",
    "question": "What is the highest eligible free rate for K-12 students in the schools in Alameda County?",
    "SQL": "SELECT `Free Meal Count (K-12)` / `Enrollment (K-12)` FROM frpm WHERE `County Name` = 'Alameda' ORDER BY (CAST(`Free Meal Count (K-12)` AS REAL) / `Enrollment (K-12)`) DESC LIMIT 1"
  }
  ```
- **Demo Dataset**:  
  `Text2SqlPipeline/bird_example/dev_20240627/dev.json`  
  Includes database IDs, natural language questions, and standard SQL answers for quick testing and demonstration.  

### 3.3 Output Data

- **Format**: `jsonl` (Each step generates a file.)  
- **Field Descriptions**:  
  - `evidence`: Key evidence or intermediate results extracted during reasoning.  
  - `selected_schema`: Filtered database schema information.  
  - `raw_schema`: Original complete database schema.  
  - `ddl`: Database table structure definition statements.  
  - `whole_format_schema`: Fully formatted database schema description.  
  - `selected_format_schema`: Filtered and formatted database schema description.  
  - `refined_question`: Semantically optimized natural language question.  
  - `rl_prompt`: Final generated prompt template.  
  - `sft_output`: Raw output from the supervised fine-tuning (SFT) model.  
  - `sql_component_difficulty`: SQL component complexity evaluation (`easy`/`medium`/`hard`/`extra`).  
  - `sql_execution_difficulty`: SQL execution complexity evaluation (`easy`/`medium`/`hard`).  
- **Example**:  
  ```json
  {
    "evidence": "Eligible free rate = `Free Meal Count` / `Enrollment`",
    "selected_schema": "[{'table_name': ...]}]",
    "raw_schema": "{'tables': {'frpm': [...], 'schools': [...]}}",
    "ddl": "CREATE TABLE frpm (...);\nCREATE TABLE schools (...);",
    "whole_format_schema": "## Table: frpm ...",
    "selected_format_schema": "Table frpm ...",
    "refined_question": "What is the highest free benefit rate for K-12 in Alameda?",
    "rl_prompt": "Task: Generate SQL from schema...\nSchema: {...}\nQuestion: {...}",
    "sft_output": "Let's think step by step...",
    "sql_component_difficulty": "medium",
    "sql_execution_difficulty": "medium"
  }
  ```

---

## 4. Pipeline and Operators

The pipeline consists of multiple operators, each corresponding to a `yaml` configuration and executed via `pipeline_step.py`.  

#### 1. **SQL Filter (SQLFilter)**  
- **Function**: Filters invalid data.  
  - Removes gold SQL with execution errors.  
  - Filters SQL inconsistent with the question description.  
- **Command**:  
  ```bash
  python Text2SqlPipeline/code/SQLFilter.py \
    --yaml_path "Text2SqlPipeline/yaml/SQLFilter.yaml" \
    --step_name SQLFilter \
    --step_type generator
  ```

#### 2. **SQL Difficulty Classifier (SQLDifficultyClassifier)**  
- **Function**: Classifies difficulty levels (`easy`/`medium`/`hard`/`extra`) based on SQL syntax complexity, following the [Spider](https://arxiv.org/abs/1809.08887) standard.  
- **Command**:  
  ```bash
  python Text2SqlPipeline/code/SQLDifficultyClassifier.py \
    --yaml_path "Text2SqlPipeline/yaml/SQLDifficultyClassifier.yaml" \
    --step_name SQLDifficultyClassifier \
    --step_type generator
  ```

#### 3. **Schema Linker (SchemaLinking)**  
- **Function**: Extracts relevant tables and columns from the full database schema using the [CodeS](https://arxiv.org/abs/2402.16347) method.  
- **Prerequisite**: Download the [Schema Filter](https://github.com/RUCKBReasoning/text2sql-schema-filter) model and configure its path in the `yaml` file.  
- **Command**:  
  ```bash
  python Text2SqlPipeline/code/SchemaLinking.py \
    --yaml_path "Text2SqlPipeline/yaml/SchemaLinking_eval.yaml" \
    --step_name SchemaLinking_eval \
    --step_type generator
  ```

#### 4. **Schema Extractor (DatabaseSchemaExtractor)**  
- **Function**: Constructs schema information and formatted descriptions.  
- **Command**:  
  ```bash
  python Text2SqlPipeline/code/DatabaseSchemaExtractor.py \
    --yaml_path "Text2SqlPipeline/yaml/DataSchemaExtractor.yaml" \
    --step_name DataSchemaExtractor \
    --step_type generator
  ```

#### 5. **Knowledge Generator (ExtraKnowledgeGeneration)**  
- **Function**: Generates additional knowledge required to derive SQL queries from natural language questions, explaining:  
  - Quantifier-to-value mappings.  
  - Noun-entity relationships.  
- **Command**:  
  ```bash
  python Text2SqlPipeline/code/ExtraKnowledgeGenerator.py \
    --yaml_path "Text2SqlPipeline/yaml/ExtraKnowledgeGenerator.yaml" \
    --step_name ExtraKnowledgeGenerator \
    --step_type generator
  ```

#### 6. **Question Refiner (QuestionRefiner)**  
- **Function**: Standardizes question phrasing.  
  - Splits compound questions.  
  - Unifies question formats (starting with "What"/"How").  
- **Command**:  
  ```bash
  python Text2SqlPipeline/code/QuestionRefiner.py \
    --yaml_path "Text2SqlPipeline/yaml/QuestionRefiner.yaml" \
    --step_name QuestionRefiner \
    --step_type generator
  ```

#### 7. **Prompt Generator (PromptGeneration)**  
- **Function**: Constructs training Q&A data, including:  
  - Questions for SFT training.  
  - High-quality chain-of-thought answers.  
  - Questions for RL training.  
- **Command**:  
  ```bash
  python Text2SqlPipeline/code/PromptGenerator.py \
    --yaml_path "Text2SqlPipeline/yaml/PromptGenerator.yaml" \
    --step_name PromptGenerator \
    --step_type generator
  ```

#### 8. **Execution Difficulty Classifier (Text2SQLDifficultyClassifier)**  
- **Function**: Classifies generation difficulty based on execution pass rates.  
  - Configurable thresholds (`easy`/`medium`/`hard`/`extra`).  
  - Supports multi-model testing.  
- **Command**:  
  ```bash
  python Text2SqlPipeline/code/Text2SQLDifficultyClassifier.py \
    --yaml_path "Text2SqlPipeline/yaml/Text2SQLDifficultyClassifier.yaml" \
    --step_name Text2SQLDifficultyClassifier \
    --step_type generator
  ```  
