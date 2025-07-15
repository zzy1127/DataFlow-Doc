---
title: Text2SQL算子
createTime: 2025/06/24 11:43:42
permalink: /zh/guide/Text2SQL_operators/
---

# Text2SQL算子

## 概述

Text-to-SQL算子是专门用于Text-to-SQL问题数据处理和质量提升的算子集合，旨在：
- 清洗并扩充现有的Text-to-SQL数据集
- 为每个样本生成包含训练提示词（prompt）和长链推理过程（chain-of-thought）的高质量问答对
- 提供多维度的数据质量评估和难度分级

开源的算子种类是十分受限的，为了获得更好的数据处理质量，填补开源缺失的数据合成与处理方法，我们精心设计并**自研**了新的算子集，其标记含义如下：

- 🚀 **自主创新**：核心算法原创研发，填补现有算法空白或是进一步提升性能，突破当下性能瓶颈。
- ✨ **开源首发**：首次将该算子集成到社区主流框架中，方便更多开发者使用，实现开源共享。

## 数据生成算子

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
      <td class="tg-0pky">SQLGenerator</td>
      <td class="tg-0pky">数据生成</td>
      <td class="tg-0pky">基于数据库Schema生成多样化SQL语句</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2503.02240">OmniSQL</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">SQLVariationGenerator🚀</td>
      <td class="tg-0pky">数据增强</td>
      <td class="tg-0pky">基于SQL语句和数据库Schema生成SQL变体</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QuestionGeneration</td>
      <td class="tg-0pky">问题生成</td>
      <td class="tg-0pky">基于SQL语句生成对应的自然语言问题</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2503.02240">OmniSQL</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PromptGenerator✨</td>
      <td class="tg-0pky">提示词生成</td>
      <td class="tg-0pky">构建包含Schema和问题的训练提示词</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">CoTGenerator</td>
      <td class="tg-0pky">推理链生成</td>
      <td class="tg-0pky">生成SQL推理的逐步思维链过程</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2503.02240">OmniSQL</a></td>
    </tr>
  </tbody>
</table>

## 数据评估算子

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
      <td class="tg-0pky">ComponentClassifier</td>
      <td class="tg-0pky">难度评估</td>
      <td class="tg-0pky">基于SQL语法复杂度进行难度分级</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/1809.08887">Spider</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">ExecutionClassifier🚀</td>
      <td class="tg-0pky">执行难度评估</td>
      <td class="tg-0pky">基于模型执行成功率进行难度分级</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>

## 数据过滤算子

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
      <td class="tg-0pky">ExecutionFilter✨</td>
      <td class="tg-0pky">数据清洗</td>
      <td class="tg-0pky">过滤无法正常执行的SQL语句</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">ConsistencyFilter✨</td>
      <td class="tg-0pky">数据清洗</td>
      <td class="tg-0pky">验证SQL与问题描述的语义一致性</td>
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

### 数据生成算子

#### 1. SQLGenerator🚀

**功能描述：** 基于数据库Schema生成多样化的SQL语句
- 生成覆盖各种SQL语法、难度的查询语句
- 支持复杂查询如JOIN、子查询、聚合函数等

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口，用于SQL生成
  - `database_manager`: 数据库管理器，用于访问数据库Schema
  - `generate_num`: 每个数据库生成SQL语句的数量

- `run()`
  - `output_sql_key`: 输出SQL语句字段名，默认"SQL"
  - `output_db_id_key`: 输出数据库ID字段名，默认"db_id"

**主要特性：**

- 智能Schema分析和SQL模板生成
- 支持多种数据库类型（SQLite、MySQL）
- 自动处理表关系和外键约束
- 生成覆盖不同难度等级的SQL

**使用示例：**

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

#### 2. ExecutionFilter✨

**功能描述：** 过滤无法正常执行的SQL语句
- 验证SQL语法正确性
- 检查SQL在目标数据库上的可执行性
- 自动剔除执行异常的语句
- 提供详细的错误统计信息

**输入参数：**

- `__init__()`
  - `database_manager`: 数据库管理器，用于SQL执行验证

- `run()`
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_db_id_key`: 数据库ID字段名，默认"db_id"

**主要特性：**

- 高效的批量SQL执行验证
- 支持多种数据库引擎
- 自动错误捕获和分类
- 保留执行成功的高质量数据

**使用示例：**

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

#### 3. ConsistencyFilter✨

**功能描述：** 验证SQL与问题描述的语义一致性
- 使用LLM判断SQL执行结果是否回答了问题
- 检查问题与SQL逻辑的匹配度
- 过滤语义不一致的数据对
- 提升数据集的质量和可靠性

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口，用于一致性判断
  - `database_manager`: 数据库管理器，用于SQL执行

- `run()`
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_db_id_key`: 数据库ID字段名，默认"db_id"
  - `input_question_key`: 问题字段名，默认"question"

**主要特性：**

- 智能语义一致性检查
- 结合SQL执行结果和问题语义
- 自动过滤不匹配的数据对
- 支持复杂查询的一致性验证

**使用示例：**

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

### 4. SQLVariationGenerator🚀

**功能描述：** 生成功能等价的SQL语句变体
- 基于原始SQL生成多种等价表达
- 保持查询结果一致性的前提下增加语法多样性
- 支持别名替换、子查询转换、JOIN重写等
- 有效扩充训练数据的多样性

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口，用于SQL变体生成
  - `database_manager`: 数据库管理器，用于验证变体正确性
  - `num_variations`: 每个SQL生成的变体数量，默认5

- `run()`
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_db_id_key`: 数据库ID字段名，默认"db_id"

**主要特性：**

- 智能SQL重写和变体生成
- 保证功能等价性的前提下增加多样性
- 自动验证变体的正确性
- 支持复杂查询的多种表达方式

**使用示例：**

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

### 5. QuestionGeneration🚀

**功能描述：** 基于SQL语句生成对应的自然语言问题
- 分析SQL语义生成合理的自然语言问题
- 使用embedding技术选择最优问题候选
- 确保问题与SQL查询意图的一致性
- 支持多种问题表达风格

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口，用于问题生成
  - `embedding_api_llm_serving`: 嵌入模型接口，用于问题选择
  - `database_manager`: 数据库管理器，用于Schema信息获取
  - `question_candidates_num`: 问题候选数量，默认5

- `run()`
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_db_id_key`: 数据库ID字段名，默认"db_id"
  - `output_question_key`: 输出问题字段名，默认"question"

**主要特性：**

- 基于SQL语义的智能问题生成
- 多候选问题生成和最优选择
- 结合数据库Schema的上下文理解
- 确保问题的自然性和准确性

**使用示例：**

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

### 6. PromptGenerator

**功能描述：** 构建包含Schema和问题的训练提示词
- 格式化数据库Schema信息
- 结合问题生成标准化的训练提示词
- 支持多种Schema格式（DDL、格式化Schema等）
- 可配置是否包含示例数据

**输入参数：**

- `__init__()`
  - `database_manager`: 数据库管理器，用于Schema信息获取
  - `prompt_template`: 提示词模板，必须包含{schema}和{question}占位符
  - `schema_config`: Schema配置，包含format和use_example字段

- `run()`
  - `input_question_key`: 问题字段名，默认"question"
  - `input_db_id_key`: 数据库ID字段名，默认"db_id"
  - `output_prompt_key`: 输出提示词字段名，默认"prompt"

**主要特性：**

- 灵活的提示词模板系统
- 多种Schema格式支持
- 自动Schema格式化和优化
- 支持包含示例数据的Schema

**使用示例：**

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

### 7. CoTGenerator🚀

**功能描述：** 生成SQL推理的逐步思维链过程
- 基于问题和SQL生成详细的推理步骤
- 解释SQL构建的逻辑过程
- 支持错误重试和质量保证
- 提升模型的推理能力和可解释性

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口，用于CoT生成
  - `database_manager`: 数据库管理器，用于Schema信息获取
  - `schema_config`: Schema配置，包含format和use_example字段
  - `max_retries`: 最大重试次数，默认3
  - `enable_retry`: 是否启用重试机制，默认True

- `run()`
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_question_key`: 问题字段名，默认"question"
  - `input_db_id_key`: 数据库ID字段名，默认"db_id"
  - `output_cot_key`: 输出CoT推理字段名，默认"cot_reasoning"

**主要特性：**

- 高质量的推理链生成
- 自动错误检测和重试机制
- 结合Schema的上下文推理
- 支持复杂查询的逐步分解

**使用示例：**

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

### 8. ComponentClassifier

**功能描述：** 基于SQL语法复杂度进行难度分级
- 分析SQL语句的语法组件复杂度
- 根据JOIN数量、子查询深度、聚合函数等进行评分
- 支持自定义难度阈值和标签
- 提供标准化的难度分类体系

**输入参数：**

- `__init__()`
  - `difficulty_config`: 难度配置，包含thresholds和labels字段

- `run()`
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `output_difficulty_key`: 输出难度标签字段名，默认"sql_component_difficulty"

**主要特性：**

- 基于SQL语法结构的复杂度分析
- 可配置的难度阈值和标签
- 快速批量处理能力
- 标准化的难度评估体系

**使用示例：**

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

### 9. ExecutionClassifier🚀

**功能描述：** 基于模型执行成功率进行难度分级
- 使用LLM多次尝试生成SQL来评估难度
- 根据模型成功率动态调整难度等级
- 提供更贴近实际应用的难度评估
- 支持自定义难度配置和生成次数

**输入参数：**

- `__init__()`
  - `llm_serving`: LLM服务接口，用于SQL生成测试
  - `database_manager`: 数据库管理器，用于SQL执行验证
  - `difficulty_config`: 难度配置，包含thresholds和labels字段
  - `num_generations`: 测试生成次数，默认5

- `run()`
  - `input_sql_key`: SQL语句字段名，默认"SQL"
  - `input_db_id_key`: 数据库ID字段名，默认"db_id"
  - `input_prompt_key`: 提示词字段名，默认"prompt"
  - `output_difficulty_key`: 输出难度标签字段名，默认"sql_execution_difficulty"

**主要特性：**

- 基于实际模型性能的难度评估
- 动态难度调整机制
- 多次生成的统计分析
- 更符合实际应用场景的难度分级

**使用示例：**

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