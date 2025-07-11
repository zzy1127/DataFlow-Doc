---
title: 知识库清洗流水线
icon: fa6-regular:bookmark
createTime: 2025/06/16 13:08:42
permalink: /zh/guide/kbcpipeline/

---

# 知识库清洗及QA合成流水线

## 1. 概述

知识库清洗流水线的核心目标是对于用户提供的格式异构、信息噪声高的原始文档，提供**端到端的**信息提取、规范化以及必要元信息的生成服务。这样提取出的数据可以直接用于RAG、预训练，以及众多大模型下游任务。在此基础上，流水线通过滑动窗口的方式，把清洗好的知识转化成一组Multi-Hop QA。根据[MIRIAD](https://github.com/eth-medical-ai-lab/MIRIAD)的实验，这种QA格式的知识更有利于RAG准确推理。

知识库清洗支持的文件格式包括**PDF, Markdown, HTML以及爬取URL**对应的网页信息。

流水线的主要流程包括：

1. 信息提取：借助[MinerU](https://github.com/opendatalab/MinerU), [trafilatura](https://github.com/adbar/trafilatura)等工具从原始文档中提取文本信息。
2. 文本分段：借助[chonkie](https://github.com/chonkie-inc/chonkie)将文本切分成片段，支持通过Token，字符，句子等分段方式。
3. 知识清洗：从冗余标签，格式错误，屏蔽隐私信息和违规信息等角度对原始文本信息进行清洗，使文本信息更加清洁可用。
4. QA构建：利用长度为三个句子的滑动窗口，将清洗好的知识库转写成一系列需要多步推理的QA，更有利于RAG准确推理。

## 2. 流水线设计

### 1. 信息提取

流水线第一步是通过KnowledgeExtractor从用户原始文档或URL中提取文本知识。此步骤至关重要，它将各种格式的原始文档提取成统一的markdown格式文本，方便后续清洗步骤进行。

由于MinerU的特殊配置要求，你可能需要新建一个conda环境。
```shell
conda create -n dataflow_kbc python=3.10
conda activate dataflow_kbc
git clone https://github.com/OpenDCAI/DataFlow.git
cd DataFlow
pip install -e .
```

本系统中PDF文件的提取基于[MinerU](https://github.com/opendatalab/MinerU),需进行额外配置，用户可通过如下方式配置。

```shell
pip install open-dataflow[kbc]
mineru-models-download #只需安装pipeline部分
```

 具体信息可参考https://github.com/opendatalab/mineru#local-deployment.

**输入**：原始文档文件或URL **输出**：提取后的markdown文本

**示例**：

```python
knowledge_extractor = KnowledgeExtractor(
    intermediate_dir="../example_data/KBCleaningPipeline/raw/",
    lang="en"
)
extracted=knowledge_extractor.run(
    storage=self.storage,
    raw_file=raw_file,
    url=url,
)
```

### 2. 文本分块

文档被提取之后，文本分块(corpus_text_splitter)步骤将提取中的长文本切分成块，系统支持通过token, character, sentence, semantic维度进行分块。

**输入**：提取后的Markdown文本 **输出**：分块后的json文件

**示例**：

```python
text_splitter = CorpusTextSplitter(
    split_method="token",
    chunk_size=512,
    tokenizer_name="Qwen/Qwen2.5-7B-Instruct",
)
text_splitter.run(
    storage=self.storage.step(),
    input_file=extracted,
    output_key="raw_content",
)
```

### 3. 知识清洗

文本被切块之后，知识清洗(knowledge_cleaner)专门用于对RAG（检索增强生成）系统中的原始知识内容进行标准化处理。该过程通过大语言模型接口，实现对非结构化知识的智能清洗和格式化，提升知识库的准确性和可读性。

**输入**：分块后的json文件 **输出**：清洗后的json文件

```python
knowledge_cleaner = KnowledgeCleaner(
    llm_serving=api_llm_serving,
    lang="en"
)
extracted_path = knowledge_cleaner.run(
  storage=self.storage.step(),
  input_key= "raw_content",
  output_key="cleaned",
)
```

### 4. QA生成

知识被清洗之后，多跳QA合成(multihop_qa_generator)专门用于从文本数据中自动生成需要多步推理的问题-答案对。该过程通过大语言模型接口，实现对文本的智能分析和复杂问题构建，适用于构建高质量的多跳问答数据集。根据[MIRIAD](https://github.com/eth-medical-ai-lab/MIRIAD)的实验，这种QA格式的知识更有利于RAG准确推理。

**输入**：json格式的普通文本 

**输出**：针对每一条文本合成一组多跳问答 输出json格式

**使用示例**：

```python
multi_hop_qa_generator = multihop_qa_generator(
    llm_serving=local_llm_serving,
    lang="en"
)
multi_hop_qa_generator.run(
    storage=self.storage.step(),
    input_key="cleaned",
    output_key="MultiHop_QA"
)
```

## 3. 运行示例

用户执行下面的脚本可以满足不用的数据需求，注意gpu_pipelines, api_pipelines, cpu_pipelines下面的脚本分别适用于测试机配有GPU，用户配置了API以及其他情况。

- PDF文件知识库清洗构建

  ```shell
  python gpu_pipelines/kbcleaning_pipeline_pdf.py
  ```

- URL爬取后知识库清洗构建

  ```shell
  python gpu_pipelines/kbcleaning_pipeline_url.py
  ```

## 4. 流水线示例

以下给出示例流水线，演示如何使用多个算子进行知识库清洗。该示例展示了如何初始化一个知识库清洗流水线，并且顺序执行各个提取和清理步骤。

```python
from dataflow.operators.generate.KnowledgeCleaning import (
    CorpusTextSplitter,
    KnowledgeExtractor,
    KnowledgeCleaner,
    MultiHopQAGenerator,
)
from dataflow.utils.storage import FileStorage
from dataflow.serving import APILLMServing_request

class KBCleaningPipeline():
    def __init__(self):

        self.storage = FileStorage(
            first_entry_file_name="../example_data/KBCleaningPipeline/kbc_placeholder.json",
            cache_path="./.cache/api",
            file_name_prefix="pdf_cleaning_step",
            cache_type="json",
        )

        api_llm_serving = APILLMServing_request(
                api_url="https://api.openai.com/v1/chat/completions",
                model_name="gpt-4o",
                max_workers=100
        )

        self.knowledge_cleaning_step1 = KnowledgeExtractor(
            intermediate_dir="../example_data/KBCleaningPipeline/raw/",
            lang="en"
        )

        self.knowledge_cleaning_step2 = CorpusTextSplitter(
            split_method="token",
            chunk_size=512,
            tokenizer_name="Qwen/Qwen2.5-7B-Instruct",
        )

        self.knowledge_cleaning_step3 = KnowledgeCleaner(
            llm_serving=api_llm_serving,
            lang="en"
        )

        self.knowledge_cleaning_step4 = MultiHopQAGenerator(
            llm_serving=api_llm_serving,
            lang="en"
        )

    def forward(self, url:str=None, raw_file:str=None):
        extracted=self.knowledge_cleaning_step1.run(
            storage=self.storage,
            raw_file=raw_file,
            url=url,
        )
        
        self.knowledge_cleaning_step2.run(
            storage=self.storage.step(),
            input_file=extracted,
            output_key="raw_content",
        )

        self.knowledge_cleaning_step3.run(
            storage=self.storage.step(),
            input_key= "raw_content",
            output_key="cleaned",
        )
        self.knowledge_cleaning_step4.run(
            storage=self.storage.step(),
            input_key="cleaned",
            output_key="MultiHop_QA"
        )
        
if __name__ == "__main__":
    model = KBCleaningPipeline()
    model.forward(raw_file="../example_data/KBCleaningPipeline/test.pdf")
```

