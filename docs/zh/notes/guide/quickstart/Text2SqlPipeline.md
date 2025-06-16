---
title: Text-to-SQL数据合成流水线
icon: material-symbols-light--checkbook-outline-rounded
createTime: 2025/06/17 02:00:31  
permalink: /zh/guide/text2sqlpipeline/  
---

# Text-to-SQL数据合成流水线

## 1. 概述

**Text-to-SQL数据合成流水线**旨在：  
- 清洗并扩充现有的Text-to-SQL数据  
- 为每个样本生成包含训练提示词（prompt）和长链推理过程（chain‐of‐thought）的高质量问答

支持输入的数字应至少包含下面三个部分：
1. 数据库id
2. 自然语言问题  
3. 标准SQL答案

该流水线通过配置化的 `yaml` 和统一的 `pipeline_step.py` 驱动，能一键完成所有步骤。

---

## 2. 一键运行

直接运行下面的执行脚本：  
```bash
bash Text2SqlPipeline/text2sql_pipeline.sh
```

---

## 3. 数据格式

### 3.1 数据库配置

由于设计数据库的解析和执行，需要添加数据库信息。

- `tables.json`：数据库Schema定义文件（JSON格式）
- `数据库`：其中有SQLite3数据库文件，格式为`{db_id}.db`

### 3.2 输入数据

- **支持格式**：`json`、`jsonl`  
- **必需字段**：  
  - `db_id`：数据库id
  - `question`：自然语言问题  
  - `SQL`：标准SQL答案
- **可选字段**：其它字段会被忽略，但建议只保留必要字段，避免与后续处理冲突。  
- **示例**（`json`）：
  ```json
  {
    "db_id": "california_schools",
    "question": "What is the highest eligible free rate for K-12 students in the schools in Alameda County?",
    "SQL": "SELECT `Free Meal Count (K-12)` / `Enrollment (K-12)` FROM frpm WHERE `County Name` = 'Alameda' ORDER BY (CAST(`Free Meal Count (K-12)` AS REAL) / `Enrollment (K-12)`) DESC LIMIT 1"
  }
  ```
- **演示数据集**：  
  `Text2SqlPipeline/bird_example/dev_20240627/dev.json`  
  包含数据库id、自然语言问题和标准SQL答案，适用于快速测试和演示。

### 3.3 输出数据

- **格式**：`jsonl`（每个步骤都会生成一个文件）  
- **字段说明**：
  - `evidence`: 推理过程中提取的关键证据或中间结果
  - `selected_schema`: 经过筛选的数据库schema信息
  - `raw_schema`: 原始完整的数据库schema信息
  - `ddl`: 数据库表结构定义语句
  - `whole_format_schema`: 完整格式化的数据库schema说明
  - `selected_format_schema`: 筛选后格式化的数据库schema说明
  - `refined_question`: 经过语义优化的自然语言问题
  - `rl_prompt`: 最终生成的提示词模板
  - `sft_output`: 监督式微调(SFT)模型的原始输出
  - `sql_component_difficulty`: SQL组件复杂度评估（easy/medium/hard/extra）
  - `sql_execution_difficulty`: SQL执行复杂度评估（easy/medium/hard）
- **示例**：
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

## 4. 流程与算子

整个流水线由若干算子组成，每个算子对应一个 `yaml` 配置，通过 `pipeline_step.py` 驱动执行。

#### 1. **SQL过滤器 (SQLFilter)**  
- **功能**：筛选无效数据
  - 剔除执行异常的gold SQL  
  - 过滤与问题描述不一致的SQL  
- **命令**：
  ```bash
  python Text2SqlPipeline/code/SQLFilter.py \
    --yaml_path "Text2SqlPipeline/yaml/SQLFilter.yaml"
  ```

#### 2. **SQL难度分类器 (SQLDifficultyClassifier)**  
- **功能**：参考 [Spider](https://arxiv.org/abs/1809.08887) 的标准，基于SQL语法复杂度划分难度等级（easy/medium/hard/extra）  
- **命令**：
  ```bash
  python Text2SqlPipeline/code/SQLDifficultyClassifier.py \
    --yaml_path "Text2SqlPipeline/yaml/SQLDifficultyClassifier.yaml"
  ```

#### 3. **模式链接器 (SchemaLinking)**  
- **功能**：采用 [CodeS](https://arxiv.org/abs/2402.16347) 的方法，从全量数据库Schema中提取使用的关联表和列  
- **命令**：
  ```bash
  python Text2SqlPipeline/code/SchemaLinking.py \
    --yaml_path "Text2SqlPipeline/yaml/SchemaLinking_eval.yaml"
  ```

#### 4. **Schema提取器 (DatabaseSchemaExtractor)**  
- **功能**：构建Schema信息和格式化描述  
- **命令**：
  ```bash
  python Text2SqlPipeline/code/DatabaseSchemaExtractor.py \
    --yaml_path "Text2SqlPipeline/yaml/DataSchemaExtractor.yaml"
  ```

#### 5. **知识生成器 (ExtraKnowledgeGeneration)**  
- **功能**：构建自然语言问题推到至SQL查询所需的额外知识，需要解释两个方面：  
  - 解释量词对应数值  
  - 明确名词实体映射关系  
- **命令**：
  ```bash
  python Text2SqlPipeline/code/ExtraKnowledgeGenerator.py \
    --yaml_path "Text2SqlPipeline/yaml/ExtraKnowledgeGenerator.yaml"
  ```

#### 6. **问题优化器 (QuestionRefiner)**  
- **功能**：标准化问题表述  
  - 拆分复合问句  
  - 统一提问句式（What/How开头）  
- **命令**：
  ```bash
  python Text2SqlPipeline/code/QuestionRefiner.py \
    --yaml_path "Text2SqlPipeline/yaml/QuestionRefiner.yaml"
  ```

#### 7. **提示词生成器 (PromptGeneration)**  
- **功能**：构建训练问答数据  
  - 用于SFT训练的问题 
  - 长链推理过程的高质量回答
  - 用于RL训练的问题
- **命令**：
  ```bash
  python Text2SqlPipeline/code/PromptGenerator.py \
    --yaml_path "Text2SqlPipeline/yaml/PromptGenerator.yaml"
  ```

#### 8. **执行难度分类器 (Text2SQLDifficultyClassifier)**  
- **功能**：基于执行通过率划分生成难度  
  - 阈值可配置（easy/medium/hard/extra）  
  - 支持多模型测试  
- **命令**：
  ```bash
  python Text2SqlPipeline/code/Text2SQLDifficultyClassifier.py \
    --yaml_path "Text2SqlPipeline/yaml/Text2SQLDifficultyClassifier.yaml"
  ```



