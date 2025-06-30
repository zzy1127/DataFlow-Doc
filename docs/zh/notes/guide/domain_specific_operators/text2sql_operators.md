---
title: Text2SQL算子
createTime: 2025/06/24 11:43:42
permalink: /zh/guide/Text2SQL_operators/
---

# Text2SQL算子

## 概述

Text2SQL算子是专门用于Text2SQL问题数据处理和质量提升的算子集合，旨在：
- 清洗并扩充现有的Text-to-SQL数据集
- 为每个样本生成包含训练提示词（prompt）和长链推理过程（chain-of-thought）的高质量问答对
- 提供多维度的数据质量评估和难度分级

开源的算子种类是十分受限的，为了获得更好的数据处理质量，填补开源缺失的数据合成与处理方法，我们精心设计并**自研**了新的算子集，其标记含义如下：

- 🚀 **自主创新**：核心算法原创研发，填补现有算法空白或是进一步提升性能，突破当下性能瓶颈。
- ✨ **开源首发**：首次将该算子集成到社区主流框架中，方便更多开发者使用，实现开源共享。


<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">适用类型</th>
      <th class="tg-0pky">简介</th>
      <th class="tg-0pky">官方仓库或论文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">SQLFilter✨</td>
      <td class="tg-0pky">数据清洗</td>
      <td class="tg-0pky">筛选SQL执行异常和语义不一致的数据</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">SQLDifficultyClassifier</td>
      <td class="tg-0pky">难度评估</td>
      <td class="tg-0pky">基于SQL语法复杂度进行难度分级</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/1809.08887">Spider</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">SchemaLinking</td>
      <td class="tg-0pky">Schema提取</td>
      <td class="tg-0pky">基于SQL和数据库Schema提取相关表和列</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">DatabaseSchemaExtractor</td>
      <td class="tg-0pky">Schema处理</td>
      <td class="tg-0pky">构建和格式化数据库Schema信息</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">ExtraKnowledgeGeneration</td>
      <td class="tg-0pky">知识增强</td>
      <td class="tg-0pky">生成SQL推理所需的额外领域知识</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QuestionRefiner🚀</td>
      <td class="tg-0pky">问题优化</td>
      <td class="tg-0pky">标准化和优化自然语言问题表述</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">PromptGeneration✨</td>
      <td class="tg-0pky">训练数据生成</td>
      <td class="tg-0pky">构建SFT和RL训练所需的高质量问答数据</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">Text2SQLDifficultyClassifier🚀</td>
      <td class="tg-0pky">执行难度评估</td>
      <td class="tg-0pky">基于模型执行成功率进行难度分级</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>

## 算子接口调用说明

特别地，对于指定存储路径等或是调用模型的算子，我们提供了封装后的**模型接口**以及**存储对象接口**，可以通过以下方式为算子进行模型API参数预定义：

```python
from dataflow.llmserving import APILLMServing_request

api_llm_serving = APILLMServing_request(
                api_url="your_api_url",
                model_name="model_name",
                max_workers=5
        )
```
可以通过以下方式为算子进行存储参数预定义：

```python
from dataflow.utils.storage import FileStorage

self.storage = FileStorage(
            first_entry_file_name="your_file_path",
            cache_path="./cache",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl", # jsonl, json, ...
        )
```

后文使用的`api_llm_serving`以及`self.storage`即为此处已定义的接口对象，完整调用示例可参考`test/test_text2sql.py`。

对于传参，算子对象的构造函数主要传递与算子配置相关的信息，配置后可以一配置多调用；而`X.run()`函数传递与IO相关的`key`信息，详细可见后文算子说明示例。

## 详细算子说明

### 1. SQLFilter✨

**功能描述：** 筛选无效数据
- 剔除执行异常的gold SQL  
- 过滤与问题描述不一致的SQL  
- 双重筛选确保数据质量

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口，用于一致性判断
  - `db_root_path`: 数据库文件根目录路径
  - `num_cpus`: 并行处理的CPU核数，默认20
  - `meta_time_out`: SQL执行超时时间（秒），默认120

- `run()`
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_dbid_key`: 数据库ID字段名，默认"db_id"  
  - `input_question_key`: 问题字段名，默认"question"

**主要特性：**

- 并行SQL执行验证
- LLM驱动的语义一致性检查
- 自动过滤不合格数据
- 详细的筛选统计报告

**使用示例：**

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

**功能描述：** 参考 [Spider](https://arxiv.org/abs/1809.08887) 的标准，基于SQL语法复杂度划分难度等级（easy/medium/hard/extra）

**输入参数：**

- `__init__()`
  - 无需特殊参数，使用预定义的SQL复杂度评估规则

- `run()`
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `output_difficulty_key`: 输出难度标签字段名，默认"sql_component_difficulty"

**主要特性：**

- 基于SQL语法结构的复杂度分析
- 支持嵌套查询、聚合函数、连接操作等复杂度评估
- 标准化的四级难度分类
- 快速批量处理能力

**使用示例：**

```python
sql_difficulty_classifier = SQLDifficultyClassifier()
sql_difficulty_classifier.run(
    storage=self.storage.step(),
    input_sql_key="SQL",
    output_difficulty_key="sql_component_difficulty"
)
```

### 3. SchemaLinking

**功能描述：** 基于SQL语句，从全量数据库Schema中提取使用的关联表和列

**输入参数：**

- `__init__()`
  - `table_info_file`: 数据库表信息文件路径

- `run()`
  - `input_sql_key`: SQL语句字段名
  - `input_dbid_key`: 数据库ID字段名
  - `output_used_schema_key`: 输出使用的Schema字段名

**主要特性：**

- 自动识别SQL语句中使用的表和列
- 从完整数据库Schema中提取相关部分
- 生成精简有效的Schema信息

**使用示例：**

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

**功能描述：** 构建Schema信息和格式化描述

**输入参数：**

- `__init__()`
  - `table_info_file`: 数据库表信息文件路径
  - `db_root_path`: 数据库文件根目录路径

- `run()` 
  - `input_db_key`: 数据库ID字段名
  - `table_schema_file_db_key`: 表Schema文件中的数据库ID字段名
  - `selected_schema_key`: 选择的Schema字段名
  - `output_raw_schema_key`: 输出原始Schema字段名
  - `output_ddl_key`: 输出DDL语句字段名
  - `output_whole_format_schema_key`: 输出完整格式化Schema字段名

**主要特性：**

- 多种Schema格式输出
- DDL语句自动生成
- 支持选择性Schema提取
- 标准化Schema描述格式

**使用示例：**

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

**功能描述：** 构建自然语言问题推导至SQL查询所需的额外知识，需要解释两个方面：
- 解释量词对应数值  
- 明确名词实体映射关系  

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口
  - `exist_knowledge`: 是否已存在知识，默认False
  - `max_retries`: 最大重试次数，默认2
  - `batch_size`: 批处理大小，默认50

- `run()` 
  - `input_question_key`: 问题字段名，默认"question"
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_schema_key`: Schema字段名，默认"ddl"
  - `output_knowledge_key`: 输出知识字段名，默认"evidence"

**主要特性：**

- 智能领域知识提取
- 批量处理提高效率
- 自动重试机制
- 支持多种知识类型生成

**使用示例：**

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

**功能描述：** 标准化问题表述
- 拆分复合问句  
- 统一提问句式（What/How开头）  
- 优化问题清晰度和准确性

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口
  - `num_threads`: 线程数，默认5
  - `max_retries`: 最大重试次数，默认3

- `run()` 
  - `input_question_key`: 输入问题字段名，默认"question"
  - `output_refined_question_key`: 输出优化问题字段名，默认"refined_question"

**主要特性：**

- 问题语法标准化
- 复合问句智能拆分
- 多线程并行处理
- 自动错误恢复机制

**使用示例：**

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

**功能描述：** 构建训练问答数据
- 用于SFT训练的问题 
- 长链推理过程的高质量回答
- 用于RL训练的问题

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口
  - `db_root_path`: 数据库文件根目录路径
  - `num_threads`: 线程数，默认5
  - `timeout`: 超时时间（秒），默认60

- `run()` 
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_question_key`: 问题字段名，默认"question"
  - `input_dbid_key`: 数据库ID字段名，默认"db_id"
  - `input_schema_key`: Schema字段名，默认"ddl"
  - `output_sft_prompt_key`: SFT训练提示词字段名，默认"sft_prompt"
  - `output_rl_prompt_key`: RL训练提示词字段名，默认"rl_prompt"
  - `output_cot_key`: 推理链输出字段名，默认"sft_output"

**主要特性：**

- 多种训练格式支持
- 高质量推理链生成
- 并行处理能力
- 自定义提示词模板

**使用示例：**

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

**功能描述：** 基于执行通过率划分生成难度
- 通过多次模型生成测试执行成功率
- 阈值可配置（easy/medium/hard/extra）  
- 支持多模型测试和评估

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口
  - `db_root_path`: 数据库文件根目录路径
  - `num_cpus`: 并行处理CPU核数，默认1
  - `meta_time_out`: SQL执行超时时间（秒），默认120.0
  - `easy_medium`: easy难度阈值，默认9
  - `medium_hard`: medium难度阈值，默认5
  - `hard_extra`: hard难度阈值，默认2

- `run()` 
  - `input_dbid_key`: 数据库ID字段名，默认"db_id"
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_prompt_key`: 输入提示词字段名，默认"rl_prompt"
  - `output_difficulty_key`: 输出难度字段名，默认"sql_execution_difficulty"

**主要特性：**

- 基于实际执行的难度评估
- 可配置的难度阈值
- 多次生成的统计分析
- 并行处理提高效率

**使用示例：**

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