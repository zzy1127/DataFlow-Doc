---
title: 强推理算子
createTime: 2025/06/24 11:43:42
permalink: /zh/guide/Reasoning_operators/
---

# 强推理算子

## 概述

强推理算子是专门用于数学推理和问题求解的算子集合，主要分为两大类：**数据生成算子（Generator）** 和 **处理算子（Processor）**。这些算子能够处理复杂的数学推理任务，包括答案生成、验证、过滤和格式化等功能，同时支持多种数学表示格式。

## 数据生成算子

数据生成器主要负责生成各类推理相关的数据，包括答案生成、问题生成等。

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
      <td class="tg-0pky">AnswerGenerator</td>
      <td class="tg-0pky">答案合成</td>
      <td class="tg-0pky">该算子用于生成数学问题的标准答案，调用大语言模型进行分步推理和计算。</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">PseudoAnswerGenerator</td>
      <td class="tg-0pky">伪答案生成与投票</td>
      <td class="tg-0pky">该算子生成多个候选答案并通过统计选择最优解，实现伪答案生成。</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QuestionGenerator</td>
      <td class="tg-0pky">问题生成</td>
      <td class="tg-0pky">该算子用于基于现有问题生成新问题，支持多种生成策略以保证多样性。</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>


## 处理算子

处理算子主要负责对生成的数据进行处理、验证、过滤和格式化等操作。

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">适用类型</th>
      <th class="tg-0pky">简介</th>
      <th class="tg-0pky">官方仓库或论文等</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">AnswerFormatterFilter</td>
      <td class="tg-0pky">格式验证</td>
      <td class="tg-0pky">该算子用于检查答案格式是否符合规范，主要验证数学答案是否包含正确的\\boxed{}标记。</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerGroundTruthFilter</td>
      <td class="tg-0pky">标准答案匹配</td>
      <td class="tg-0pky">该算子用于对比预测答案与标准答案的匹配度，支持精确匹配和数学验证两种方式。</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerJudger_MathVerify</td>
      <td class="tg-0pky">数学答案验证</td>
      <td class="tg-0pky">该算子通过符号计算验证答案正确性，执行数学表达式解析和等价性验证。</td>
      <td class="tg-0pky"><a href="https://github.com/huggingface/Math-Verify">Code</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerNgramFilter</td>
      <td class="tg-0pky">重复检测</td>
      <td class="tg-0pky">该算子基于n-gram重复率过滤答案，检测回答中的重复模式和冗余内容。</td>
      <td class="tg-0pky"><a href="https://en.wikipedia.org/wiki/N-gram">Wiki</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerPipelineRoot</td>
      <td class="tg-0pky">标准答案存在性分类器</td>
      <td class="tg-0pky">答案处理流程根节点，负责将输入数据根据有无真实标签GT分发到不同处理分支。</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">AnswerTokenLengthFilter</td>
      <td class="tg-0pky">长度控制</td>
      <td class="tg-0pky">该算子根据token数量过滤过长的答案，确保答案长度在合理范围内。</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">QuestionFilter</td>
      <td class="tg-0pky">问题验证</td>
      <td class="tg-0pky">该算子用于对数学问题进行正确性检查，包括格式规范、语义合理性、条件一致性等。</td>
      <td class="tg-0pky"><a href="https://github.com/scuuy/MathQ-Verify">Code</a></td>
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

后文使用的`api_llm_serving`以及`self.storage`即为此处已定义的接口对象，完整调用示例可参考`test/test_reasoning.py`。

对于传参，算子对象的构造函数主要传递与算子配置相关的信息，配置后可以一配置多调用；而`X.run()`函数传递与IO相关的`key`信息，详细可见后文算子说明示例。

## 详细算子说明

### 数据生成算子

#### 1. AnswerGenerator

**功能描述：** 该算子专门用于生成数学问题的标准答案，通过调用大语言模型进行分步推理和精确计算。

**输入参数：**

- `__init__()`
  - `llm_serving`：使用的大语言模型接口对象（默认：前文预设值）
- `run()`
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_key`：输入问题字段名（默认："question"）
  - `output_key`：输出答案字段名（默认："generated_answer"）

**主要特性：**

- 支持多种数学问题类型（代数、几何、概率统计等）
- 采用链式思维（Chain-of-Thought）推理方法
- 自动生成详细的解题步骤
- 支持多轮推理和验证

**使用示例：**

```python
answer_gen = AnswerGenerator(llm_serving=api_llm_serving)
result = answer_gen.run(
          storage=self.storage.step(),
          input_key="question",
          output_key="generated_answer"
          )
```

#### 2. PseudoAnswerGenerator

**功能描述：** 该算子通过生成多个候选答案并使用统计方法选择最优解，实现高质量的伪答案生成。

**输入参数：**

- `__init__()`
  - `llm_serving`：使用的大语言模型接口对象（默认：前文预设值）
- `run()`
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_key`：输入问题字段名（默认："question"）
  - `output_key`：输出答案字段名（默认："pseudo_answer"）

**主要特性：**

- 多候选答案生成策略
- 基于一致性的答案选择
- 支持不确定性量化
- 自适应采样机制

**使用示例：**

```python
pseudo_gen = PseudoAnswerGenerator(llm_serving=api_llm_serving)
result = pseudo_gen.run(
          storage=self.storage.step(),
          input_key="question",
          output_key="pseudo_answer"
          )
```

#### 3. QuestionGenerator

**功能描述：** 该算子能够基于现有问题生成新的相关问题，支持多种生成策略和难度控制。

**输入参数：**

- `__init__()`
  - `llm_serving`：使用的大语言模型接口对象（默认：前文预设值）
  - `num_prompts`：每个问题生成新问题数量（默认：3）
- `run()`
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_key`：输入原始问题字段名（默认："source_question"）
  - `output_key`：输出新问题字段名（默认："generated_question"）

**主要特性：**

- 多样化问题生成策略
- 难度级别自动调节
- 知识点覆盖优化
- 语言表达多样性

**使用示例：**

```python
question_gen = QuestionGenerator(
                num_prompts=3,  # from 1 to k
                llm_serving=api_llm_serving
                )
result = question_gen.run(
          storage=self.storage.step(),
          input_key="source_question",
          output_key="generated_question"
          )
```

### 处理算子

#### 1. AnswerFormatterFilter

**功能描述：** 该算子专门用于检查数学答案的格式规范性，确保答案符合标准的数学表示格式。

**输入参数：**

- `run()` 
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_key`：输入答案字段名（默认："generated_cot"）

**主要特性：**

- 检查\\boxed{}标记格式
- 验证数学符号正确性
- 支持多种数学表示格式
- 自动格式修正建议

**使用示例：**

```python
filter_op = AnswerFormatterFilter()
result = filter_op.run(
          storage=self.storage.step(),
          input_key="generated_cot"
          ) 
```

#### 2. AnswerGroundTruthFilter

**功能描述：** 该算子用于对比预测答案与标准答案的匹配度，支持多种比较策略。

**输入参数：**

- `__init__()`
  - `compare_method`：比较方法（"exact" or "math_verify"）
- `run()` 
  - `storage`：存储接口对象（默认：前文预设值）
  - `test_answer_key`：预测答案字段名（默认："generated_cot"）
  - `gt_answer_key`：标准答案字段名（默认："golden_answer"）

**主要特性：**

- 精确字符串匹配
- 数学等价性验证
- 数值容差处理
- 符号化比较

**使用示例：**

```python
filter_op = AnswerGroundTruthFilter(compare_method="math_verify")
result = filter_op.run(
          storage=self.storage.step(), 
          test_answer_key="generated_cot",
          gt_answer_key="golden_answer"
          )
```

#### 3. AnswerJudger_MathVerify

**功能描述：** 该算子通过高级符号计算验证数学答案的正确性，支持复杂数学表达式的等价性判断。

**输入参数：**

- `run()` 
  - `storage`：存储接口对象（默认：前文预设值）
  - `answer_key`：待验证答案字段名（默认："student_answer"）
  - `gt_key`：标准答案字段名（默认："correct_answer"）

**主要特性：**

- 符号表达式解析
- 等价性数学验证
- 数值精度控制
- 多种数学函数支持

**使用示例：**

```python
judger_op = AnswerJudger_MathVerify()
result = judger_op.run(
          storage=self.storage.step(),
          answer_key="student_answer",
          gt_key="correct_answer"
          )
```

#### 4. AnswerNgramFilter

**功能描述：** 该算子基于n-gram统计分析检测答案中的重复模式，过滤低质量的重复内容。

**输入参数：**

- `__init__()`
  - `min_score`：最小可接受分数（默认：0.1）
  - `max_score`：最大可接受分数（默认：1.0）
  - `ngrams`：n-gram大小（默认：5）
- `run()` 
  - `storage`：存储接口对象（默认：前文预设值）
  - `question_key`：问题字段名（默认："instruction"）
  - `answer_key`：答案字段名（默认："generated_cot"）

**主要特性：**

- N-gram重复率计算
- 可配置的阈值范围
- 文本预处理和清理
- 统计分析报告

**使用示例：**

```python
ngram_filter = AnswerNgramFilter(
                min_score=0.1,
                max_score=1.0,
                ngrams=5
                )
result = ngram_filter.run(
          storage=self.storage.step(),
          question_key="instruction",
          answer_key="generated_cot"
          )
```

#### 5. AnswerPipelineRoot

**功能描述：** 答案处理流程的根节点算子，负责智能分发数据到不同的处理分支。

**输入参数：**
- `run()` 
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_answer_key`：输入答案字段名（默认："output"）
  - `input_gt_key`：输入标准答案字段名（默认："golden_answer"）

**主要特性：**

- 智能数据分发
- 有/无标准答案分支处理
- 答案提取和清理
- 流程状态管理

**使用示例：**

```python
root_op = AnswerPipelineRoot()
result = root_op.run(
          storage=self.storage.step(),
          input_answer_key="output",
          input_gt_key="golden_answer"
          )
```

#### 6. AnswerTokenLengthFilter

**功能描述：** 该算子根据token数量控制答案长度，过滤过长或过短的答案内容。

**输入参数：**

- `__init__()`
  - `max_answer_token_length`：最大token数（默认：8192）
  - `tokenizer_dir`：分词器路径（默认："Qwen/Qwen2.5-0.5B-Instruct"）
- `run()` 
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_key`：输入字段名（默认："generated_cot"）

**主要特性：**

- 精确token计数
- 可配置分词器
- 批量处理优化
- 长度统计报告

**使用示例：**

```python
length_filter = AnswerTokenLengthFilter(
                  max_answer_token_length=8192,
                  tokenizer_dir="Qwen/Qwen2.5-0.5B-Instruct"
                  )
result = length_filter.run(
          storage=self.storage.step(),
          input_key="generated_cot"
          )
```

#### 7. QuestionFilter

**功能描述：** 该算子对数学问题进行全面的质量检查，确保问题的正确性和可解性。

**输入参数：**

- `__init__()`
  - `llm_serving`：使用的大语言模型接口对象（默认：前文预设值）
  - `system_prompt`：系统提示词
- `run()` 
  - `storage`：存储接口对象（默认：前文预设值）
  - `input_key`：输入问题字段名（默认："math_problem"）

**主要特性：**

- 四阶段质量检查
- 格式规范验证
- 语义合理性分析
- 逻辑一致性检查
- 可解性评估

**检查维度：**

1. **格式检查**：验证问题表述是否规范
2. **语义检查**：分析问题是否有明确含义
3. **逻辑检查**：检查条件是否矛盾
4. **可解性检查**：评估是否具备充分信息

**使用示例：**

```python
question_filter = QuestionFilter(
    llm_serving=api_llm_serving,
    system_prompt="You are a math problem validator."
    )
result = question_filter.run(
          storage=self.storage.step(),
          input_key="math_problem"
          )
```


