---
title: 文本到图片生成、图片编辑
createTime: 2025/07/14 22.24.56
permalink: /zh/guide/aigc-image-gen/
icon: basil:lightning-alt-outline
---

# 快速开始
为了让DataFlow可以支持图片生成功能，我们基于[diffuser](https://github.com/huggingface/diffusers)中最新的图片生成方法实现大规模的图像生成与编辑，并基于[Qwen-VL](https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct)模型对生成图片质量进行评估，下面进行具体介绍。

## 文本到图片生成
### 第一步:安装dataflow环境
```shell
pip install open-dataflow
```

### 第二步:(如果选择本地模型进行图片生成)
本地模型调用方式如下：
```python
from dataflow.serving import LocalImageGenServing

self.serving = LocalImageGenServing(
    hf_model_name_or_path="black-forest-labs/FLUX.1-dev",
    hf_cache_dir="~/.cache/huggingface",
    hf_local_dir="./ckpt/models/",
    device="cuda"
)
```

### 第三步:准备用于生成图片的文本提示词数据
```jsonl
{"conversations": [{"content": "a fox darting between snow-covered pines at dusk", "role": "user"}], "images": [""]}
{"conversations": [{"content": "a kite surfer riding emerald waves under a cloudy sky", "role": "user"}], "images": [""]}
```
提供上述格式的数据，并且将数据路径填入
```python
self.storage = FileStorage(
    first_entry_file_name="your path",
    cache_path="./cache",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl",
    media_key="images",
    media_type="image"
)
```

### 第四步:进行图片生成
根据如下脚本可完成生图任务
```python
from dataflow.operators import Text2ImageGenerator

self.generator = Text2ImageGenerator(pipe=self.serving)

self.generator.run(
    storage=self.storage.step(),
    input_key="conversations",
    output_key="images"
)
```

## 图片编辑
该任务和文本到图片生成基本一致，需要对模型调用、数据准备以及算子调用进行一定的微调

本地模型调用方式如下：
```python
from dataflow.serving import LocalImageGenServing

self.serving = LocalImageGenServing(
    hf_model_name_or_path="black-forest-labs/FLUX.1-Kontext-dev",
    hf_cache_dir="~/.cache/huggingface",
    hf_local_dir="./ckpt/models/",
    device="cuda",
    Image_gen_task="imageedit",
    diffuser_model_name="FLUX-Kontext"
)
```

数据准备调整如下：
```jsonl
{"conversations": [{"content": "Change the woman's clothes to a white dress.", "role": "user"}], "images": ["./dataflow/example/test_image_editing/images/image1.png"], "edited_images": [""]}
{"conversations": [{"content": "Change the vase to red.", "role": "user"}], "images": ["./dataflow/example/test_image_editing/images/image2.png"], "edited_images": [""]}
```

生成脚本调整如下：
```python
from dataflow.operators import ImageEditor

self.generator = ImageEditor(pipe=self.serving)

self.generator.run(
    storage=self.storage.step(),
    input_key=["conversations", "images"],
    output_key="edited_images",
    save_interval = save_interval
)
```


## 图片质量评估
为了评估图片质量并进行筛选，我们采用多模态大模型来评估图片的质量

数据准备格式为：
```jsonl
{"conversations": [{"content": "four cups were filled with hot coffee", "role": "user"}], "images": ["./dataflow/example/test_text_to_image_eval/images/four cups were filled with hot coffee_001005.png"]}
{"conversations": [{"content": "four balloons, one cup, four desks, two dogs and four microwaves", "role": "user"}], "images": ["./dataflow/example/test_text_to_image_eval/images/four balloons, one cup, four desks, two dogs and four microwaves_003032.png"]}
```

具体测试脚如下：
```python
from dataflow.prompts.EvalImageGenerationPrompt import EvalImageGenerationPrompt
from dataflow.serving import LocalModelLLMServing_vllm 
from qwen_vl_utils import process_vision_info
from dataflow.operators.eval.image.image_evaluator import EvalImageGenerationGenerator
from dataflow.utils.storage import FileStorage

model = LocalModelLLMServing_vllm(
    hf_model_name_or_path=model_path,
    vllm_tensor_parallel_size=2,
    vllm_temperature=0.7,
    vllm_top_p=0.9,
    vllm_max_tokens=512,
)

captionGenerator = EvalImageGenerationGenerator(
    model,
    EvalImageGenerationPrompt(),
    process_vision_info,
)

storage = FileStorage(
    first_entry_file_name="./dataflow/example/test_text_to_image_eval/prompts.jsonl",
    cache_path="jsonl",
    media_key="images",
    media_type="image",
)

captionGenerator.run(
    storage=storage,
    output_key="caption",
)
```
