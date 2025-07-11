---
title: Knowledge Base Cleaning Pipeline
createTime: 2025/07/05 12:23:14
icon: fa6-regular:bookmark
permalink: /en/guide/r51ooua8/
---

# Knowledge Base Cleaning & QA Generation Pipeline

## 1. Overview

The core objective of the knowledge base cleaning pipeline is to provide **end-to-end** information extraction, normalization, and necessary metadata generation services for raw documents provided by users, which often come in heterogeneous formats and contain high levels of informational noise. The extracted data can be directly used for RAG, pre-training, and various downstream tasks for large language models. Additionally, the pipeline converts the cleaned knowledge into a set of Multi-Hop QAs using a sliding window approach. According to experiments from [MIRIAD](https://github.com/eth-medical-ai-lab/MIRIAD), this QA-formatted knowledge significantly enhances the accuracy of RAG-based reasoning.

The knowledge base cleaning pipeline supports the following file formats: **PDF, Markdown, HTML, and webpage information crawled from URLs**.

The main workflow of the pipeline includes:

1. **Information Extraction**: Utilizing tools like [MinerU](https://github.com/opendatalab/MinerU) and [trafilatura](https://github.com/adbar/trafilatura) to extract textual information from raw documents.
2. **Text Segmentation**: Using [chonkie](https://github.com/chonkie-inc/chonkie) to split the text into segments, supporting segmentation by tokens, characters, sentences, and other methods.
3. **Knowledge Cleaning**: Cleaning the raw textual information by removing redundant tags, correcting formatting errors, and filtering out private or non-compliant content to make the text cleaner and more usable.
4. **QA Construction**: Employing a sliding window of three sentences to transform the cleaned knowledge base into a series of multi-step reasoning QAs, which further improves the accuracy of RAG-based reasoning.

## 2. Pipeline Designing

### 1. Information Extraction

The first step of the pipeline is to extract textual knowledge from users' original documents or URLs using knowledge_extractor. This step is crucial as it converts various formats of raw documents into unified markdown text, facilitating subsequent cleaning processes.

In this system, PDF file extraction is based on [MinerU](https://github.com/opendatalab/MinerU). You might need to create a new environment because of special requirements for depandencies.
```shell
conda create -n dataflow_kbc python=3.10
conda activate dataflow_kbc
git clone https://github.com/OpenDCAI/DataFlow.git
cd DataFlow
pip install -e .
```
Additional MinerU configuration is required beyond the basic environment. Users can configure it as follows:

```shell
pip install open-dataflow[kbc]
mineru-models-download #只需安装pipeline部分
```

For detailed information, please refer to https://github.com/opendatalab/mineru#local-deployment.

**Input**: Original document files or URL
 ​**​Output​**: Extracted markdown text

**Example**:

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

------

### 2. Text Chunking

After document extraction, the text chunking step(CorpusTextSplitter) divides the extracted long text into chunks. The system supports chunking by token, character, sentence, or semantic dimensions.

**Input**: Extracted Markdown text
 ​**​Output​**: Chunked JSON file

**Example**:

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

### 3. Knowledge Cleaning

After text chunking, the Knowledge Cleaning(KnowledgeCleaner) specializes in standardizing raw knowledge content for RAG (Retrieval-Augmented Generation) systems. This process utilizes large language model interfaces to intelligently clean and format unstructured knowledge, improving the accuracy and readability of the knowledge base.

**Input**: Chunked JSON file
 ​**​Output​**: Cleaned JSON file

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

### 4. QA Generation

After knowledge cleaning, the MultiHop-QA Generation(MultiHopQAGenerator) specializes in automatically generating multi-step reasoning question-answer pairs from text data. This process uses large language model interfaces for intelligent text analysis and complex question construction, suitable for building high-quality multi-hop QA datasets. According to experiments from [MIRIAD](https://github.com/eth-medical-ai-lab/MIRIAD), this QA-formatted knowledge significantly enhances RAG reasoning accuracy.

**Input**: JSON-formatted plain text
 ​**​Output​**: For each text segment, generates a set of multi-hop QAs (output in JSON format)

**Usage Example**:

```python
  multi_hop_qa_generator = MultiHopQAGenerator(
      llm_serving=local_llm_serving,
      lang="en"
  )
  multi_hop_qa_generator.run(
      storage=self.storage.step(),
      input_key="cleaned",
      output_key="MultiHop_QA"
  )
```

## 3. Execution Examples

Users can execute the following scripts to meet different data requirements. Note that scripts under gpu_pipelines, api_pipelines, and cpu_pipelines are respectively suitable for test machines with GPU, user-configured API, and other scenarios.

- Knowledge base cleaning and construction for PDF files:

```shell
python gpu_pipelines/kbcleaning_pipeline_pdf.py
```

- Knowledge base cleaning and construction after URL crawling:

```shell
python gpu_pipelines/kbcleaning_pipeline_url.py
```

## 4. Pipeline Example

The following provides an example pipeline demonstrating how to use multiple operators for knowledge base cleaning. This example shows how to initialize a knowledge base cleaning pipeline and sequentially execute various extraction and cleaning steps.

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

