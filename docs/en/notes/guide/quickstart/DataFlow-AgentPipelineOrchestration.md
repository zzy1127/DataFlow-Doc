---
title: DataFlow-Agent
icon: carbon:ibm-consulting-advantage-agent
createTime: 2025/06/19 10:29:31
permalink: /en/guide/DataFlow-AgentPipelineOrchestration/

---

## Quick Start

### 1. Overview

DataFlow Agent is an automated multi-agent collaborative task processing system that covers the **entire process from task decomposition → tool registration → scheduling and execution → result validation → report generation**, aiming for intelligent management and execution of complex tasks. Based on user data types and requirements, it supports:

1. Dedicated operator recommendation, orchestration, execution, and summarization
2. User-personalized operator generation in a Dataflow style

Example scripts can be found in `test\test_dataflow_agent.py`. Most configurations can be set by configuring the parameters of the `ChatAgentRequest` class, including:
- User request (`target`)
- Local data reading path (`json_file`)
- Model invocation method and model type (`use_local_model`, `model`, `local_model_name_or_path`)
- Path for storing the generated code (`py_path`)


### 2. Data Preparation

- **Supported formats**: `json`, `jsonl`, `pdf`.
- In the example script `test\test_dataflow_agent.py`, the default data location is `example/ReasoningPipeline/pipeline_math_short.json`. You can set the `json_file` parameter to the path of your data file.


### 3. Model Preparation

DataFlow Agent supports two methods: calling large models via API and local large model deployment.

- For API calls, you need to configure environment variables. On Linux systems:
```shell
export CHATANY_API_KEY=your_api_key
export CHATANY_API_URL=your_api_base_url
```
And specify the model type via the `model` parameter when instantiating `ChatAgentRequest`.


- For local large model deployment, you need to configure the local large model storage path. Set the `local_model_name_or_path` parameter of the `ChatAgentRequest` class to your local model path and set `use_local_model=True`.


### 4. Operator Recommendation, Orchestration, Execution, and Summarization

You can run the following command to execute the example script, which creates a simple data processing pipeline for mathematical data. The generated pipeline code will be saved in `test/recommend_pipeline_2.py`.

```shell
cd DataFlow
python test/test_dataflow_agent.py recommend
```

The generated pipeline code (results may vary depending on the selected large model type and version) is roughly as follows:
```python
import pytest
from dataflow.operators.generate.Reasoning.QuestionGenerator import QuestionGenerator
from dataflow.operators.process.Reasoning.QuestionFilter import QuestionFilter
from dataflow.operators.generate.Reasoning.QuestionDifficultyClassifier import QuestionDifficultyClassifier
from dataflow.operators.generate.Reasoning.QuestionCategoryClassifier import QuestionCategoryClassifier
from dataflow.utils.storage import FileStorage
from dataflow.serving import APILLMServing_request, LocalModelLLMServing_vllm, LocalModelLLMServing_sglang


class RecommendPipeline():
    def __init__(self):

        # -------- FileStorage (Please modify parameters as needed) --------
        self.storage = FileStorage(
            first_entry_file_name="/mnt/public/data/lh/ygc/dataflow-agent/DataFlow/dataflow/example/ReasoningPipeline/pipeline_math_short.json",
            cache_path="./cache_local",
            file_name_prefix="dataflow_cache_step",
            cache_type="jsonl",
        )


        # -------- LLM Serving (Local) --------
        llm_serving = LocalModelLLMServing_vllm(
            hf_model_name_or_path="/mnt/public/model/huggingface/Qwen2.5-7B-Instruct",
            vllm_tensor_parallel_size=1,
            vllm_max_tokens=8192,
            hf_local_dir="local",
        )

        self.questiongenerator = QuestionGenerator(num_prompts=1, llm_serving=llm_serving)
        self.questionfilter = QuestionFilter(system_prompt="You are a helpful assistant.", llm_serving=llm_serving)
        self.questiondifficultyclassifier = QuestionDifficultyClassifier(llm_serving=llm_serving)
        self.questioncategoryclassifier = QuestionCategoryClassifier(llm_serving=llm_serving)

    def forward(self):
        self.questiongenerator.run(
            storage=self.storage.step(), input_key=""
        )
        self.questionfilter.run(
            storage=self.storage.step(), input_key="math_problem"
        )
        self.questiondifficultyclassifier.run(
            storage=self.storage.step(), input_key="", output_key="difficulty_score"
        )
        self.questioncategoryclassifier.run(
            storage=self.storage.step(), input_key="instruction", output_key="question_category"
        )


if __name__ == "__main__":
    pipeline = RecommendPipeline()
    pipeline.forward()
```

You can personalize configurations by modifying the parameters in `ChatAgentRequest`.

### 5. User-Personalized Operator Generation

You can run the following command to execute the example script, which generates a simple MinHash text deduplication operator for mathematical data. The generated operator code will be saved in `test/operator.py`.

```shell
cd DataFlow
python test/test_dataflow_agent.py write
```

The generated operator code (results may vary depending on the selected large model type and version) is roughly as follows:
```python
from tqdm import tqdm
from datasketch import MinHash, MinHashLSH
from dataflow import get_logger
from dataflow.core import OperatorABC
from dataflow.utils.storage import DataFlowStorage
from dataflow.utils.registry import OPERATOR_REGISTRY

@OPERATOR_REGISTRY.register()
class TextMinHashDeduplicator(OperatorABC):
    def __init__(self, num_perm: int = 128, threshold: float = 0.9, ngram: int = 5):
        self.logger = get_logger()
        self.num_perm = num_perm
        self.threshold = threshold
        self.ngram = ngram

    @staticmethod
    def get_desc(lang: str = "zh"):
        return "使用 MinHash 算法对文本去重" if lang == "zh" else "Deduplicate text with MinHash"

    def _build_minhash(self, text: str):
        m = MinHash(num_perm=self.num_perm)
        for i in range(max(len(text) - self.ngram + 1, 1)):
            m.update(text[i:i + self.ngram].encode("utf8"))
        return m

    def run(self, storage: DataFlowStorage, input_key: str = "text", output_key: str = "dedup_label"):
        df = storage.read("dataframe")
        lsh = MinHashLSH(threshold=self.threshold, num_perm=self.num_perm)
        labels = [0] * len(df)
        with lsh.insertion_session() as session:
            for idx, row in tqdm(df.iterrows(), total=len(df)):
                text = str(row[input_key])
                mh = self._build_minhash(text)
                if len(lsh.query(mh)) == 0:
                    labels[idx] = 1
                    session.insert(idx, mh)
        df[output_key] = labels
        storage.write(df[df[output_key] == 1])
        return [output_key]
```

You can personalize configurations by modifying the parameters in `ChatAgentRequest`.