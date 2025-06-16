---
title: Text-to-SQL Data Synthesis Pipeline  
icon: material-symbols-light--checkbook-outline-rounded  
createTime: 2025/06/17 02:00:31  
permalink: /en/guide/text2sqlpipeline/  

---

# Text-to-SQL Data Synthesis Pipeline  

## 1. Overview  

The **Text-to-SQL Data Synthesis Pipeline** is designed to:  
- Clean and augment existing Text-to-SQL data  
- Generate high-quality QA pairs for each sample, including training prompts and chain-of-thought reasoning processes  

Supported input data must include at least the following three components:  
1. Database ID  
2. Natural language question  
3. Standard SQL answer  

This pipeline is driven by a configurable `yaml` file and a unified `pipeline_step.py` script, enabling one-click execution of all steps.  

---

## 2. One-Click Execution  

Run the following script directly:  
```bash  
bash Text2SqlPipeline/text2sql_pipeline.sh  
```  

---

## 3. Data Format  

### 3.1 Database Configuration  

Since the pipeline involves database parsing and execution, database information must be provided.  

- `tables.json`: Database schema definition file (JSON format)  
- `Database`: Contains SQLite3 database files in the format `{db_id}.db`  

### 3.2 Input Data  

- **Supported Formats**: `json`, `jsonl`  
- **Required Fields**:  
  - `db_id`: Database ID  
  - `question`: Natural language question  
  - `SQL`: Standard SQL answer  
- **Optional Fields**: Other fields will be ignored, but it is recommended to retain only necessary fields to avoid conflicts with subsequent processing.  
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
  Includes database IDs, natural language questions, and standard SQL answers, suitable for quick testing and demonstration.  

### 3.3 Output Data  

- **Format**: `jsonl` (Each step generates a separate file)  
- **Field Descriptions**:  
  - `evidence`: Key evidence or intermediate results extracted during reasoning  
  - `selected_schema`: Filtered database schema information  
  - `raw_schema`: Original complete database schema information  
  - `ddl`: Database table structure definition statements  
  - `whole_format_schema`: Fully formatted database schema description  
  - `selected_format_schema`: Filtered and formatted database schema description  
  - `refined_question`: Semantically optimized natural language question  
  - `rl_prompt`: Final generated prompt template  
  - `sft_output`: Raw output from the supervised fine-tuning (SFT) model  
  - `sql_component_difficulty`: SQL component complexity assessment (easy/medium/hard/extra)  
  - `sql_execution_difficulty`: SQL execution complexity assessment (easy/medium/hard)  
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

The entire pipeline consists of several operators, each corresponding to a `yaml` configuration and driven by `pipeline_step.py`.  

#### 1. **SQL Filter (SQLFilter)**  
- **Function**: Filters invalid data  
  - Removes gold SQL queries with execution errors  
  - Filters SQL queries inconsistent with the question description  
- **Command**:  
  ```bash  
  python Text2SqlPipeline/code/SQLFilter.py \  
    --yaml_path "Text2SqlPipeline/yaml/SQLFilter.yaml"  
  ```  

#### 2. **SQL Difficulty Classifier (SQLDifficultyClassifier)**  
- **Function**: Classifies difficulty levels (easy/medium/hard/extra) based on SQL syntax complexity, following the [Spider](https://arxiv.org/abs/1809.08887) standard.  
- **Command**:  
  ```bash  
  python Text2SqlPipeline/code/SQLDifficultyClassifier.py \  
    --yaml_path "Text2SqlPipeline/yaml/SQLDifficultyClassifier.yaml"  
  ```  

#### 3. **Schema Linker (SchemaLinking)**  
- **Function**: Extracts relevant tables and columns from the full database schema using the [CodeS](https://arxiv.org/abs/2402.16347) method.  
- **Command**:  
  ```bash  
  python Text2SqlPipeline/code/SchemaLinking.py \  
    --yaml_path "Text2SqlPipeline/yaml/SchemaLinking_eval.yaml"  
  ```  

#### 4. **Schema Extractor (DatabaseSchemaExtractor)**  
- **Function**: Constructs schema information and formatted descriptions.  
- **Command**:  
  ```bash  
  python Text2SqlPipeline/code/DatabaseSchemaExtractor.py \  
    --yaml_path "Text2SqlPipeline/yaml/DataSchemaExtractor.yaml"  
  ```  

#### 5. **Knowledge Generator (ExtraKnowledgeGeneration)**  
- **Function**: Constructs additional knowledge required to derive SQL queries from natural language questions, explaining:  
  - Quantifier-to-value mappings  
  - Noun-entity relationships  
- **Command**:  
  ```bash  
  python Text2SqlPipeline/code/ExtraKnowledgeGenerator.py \  
    --yaml_path "Text2SqlPipeline/yaml/ExtraKnowledgeGenerator.yaml"  
  ```  

#### 6. **Question Refiner (QuestionRefiner)**  
- **Function**: Standardizes question expressions  
  - Splits compound questions  
  - Unifies question phrasing (starting with What/How)  
- **Command**:  
  ```bash  
  python Text2SqlPipeline/code/QuestionRefiner.py \  
    --yaml_path "Text2SqlPipeline/yaml/QuestionRefiner.yaml"  
  ```  

#### 7. **Prompt Generator (PromptGeneration)**  
- **Function**: Constructs training QA data  
  - Questions for SFT training  
  - High-quality answers with chain-of-thought reasoning  
  - Questions for RL training  
- **Command**:  
  ```bash  
  python Text2SqlPipeline/code/PromptGenerator.py \  
    --yaml_path "Text2SqlPipeline/yaml/PromptGenerator.yaml"  
  ```  

#### 8. **Execution Difficulty Classifier (Text2SQLDifficultyClassifier)**  
- **Function**: Classifies generation difficulty based on execution pass rates  
  - Configurable thresholds (easy/medium/hard/extra)  
  - Supports multi-model testing  
- **Command**:  
  ```bash  
  python Text2SqlPipeline/code/Text2SQLDifficultyClassifier.py \  
    --yaml_path "Text2SqlPipeline/yaml/Text2SQLDifficultyClassifier.yaml"  
  ```  
