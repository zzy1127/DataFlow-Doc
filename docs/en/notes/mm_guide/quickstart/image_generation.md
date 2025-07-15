---
title: Text‑to‑Image Generation and Image Editing
createTime: 2025/07/15 22:39:14
permalink: /en/mm_guide/rzf2l7kq/
icon: basil:lightning-alt-outline
---

# Quick Start
To enable **DataFlow** to support image‑generation capabilities, we have implemented large‑scale image creation and editing using the latest diffusion‑based methods available in [diffusers](https://github.com/huggingface/diffusers). We then evaluate the quality of the generated images with the [Qwen‑VL](https://huggingface.co/Qwen/Qwen2.5-VL-72B-Instruct) model. A detailed explanation follows.

## Text‑to‑Image Generation
### Step 1 – Install the DataFlow environment
```shell
pip install open-dataflow
```

### Step 2 – Use a local model for image generation
```python
from dataflow.serving import LocalImageGenServing

self.serving = LocalImageGenServing(
    hf_model_name_or_path="black-forest-labs/FLUX.1-dev",
    hf_cache_dir="~/.cache/huggingface",
    hf_local_dir="./ckpt/models/",
    device="cuda"
)
```

### Step 3 – Prepare the text‑prompt data for generation
```jsonl
{"conversations": [{"content": "a fox darting between snow-covered pines at dusk", "role": "user"}], "images": [""]}
{"conversations": [{"content": "a kite surfer riding emerald waves under a cloudy sky", "role": "user"}], "images": [""]}
```

Specify the data path:
```python
from dataflow.utils.storage import FileStorage

self.storage = FileStorage(
    first_entry_file_name="your path",
    cache_path="./cache",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl",
    media_key="images",
    media_type="image"
)
```

### Step 4 – Generate images
```python
from dataflow.operators import Text2ImageGenerator

self.generator = Text2ImageGenerator(pipe=self.serving)

self.generator.run(
    storage=self.storage.step(),
    input_key="conversations",
    output_key="images"
)
```

## Image Editing
The workflow is almost identical to text‑to‑image generation; only minor tweaks are required.

### Call a local model
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

### Prepare the data
```jsonl
{"conversations": [{"content": "Change the woman's clothes to a white dress.", "role": "user"}], "images": ["./dataflow/example/test_image_editing/images/image1.png"], "edited_images": [""]}
{"conversations": [{"content": "Change the vase to red.", "role": "user"}], "images": ["./dataflow/example/test_image_editing/images/image2.png"], "edited_images": [""]}
```

### Run the editing pipeline
```python
from dataflow.operators import ImageEditor

self.generator = ImageEditor(pipe=self.serving)

self.generator.run(
    storage=self.storage.step(),
    input_key=["conversations", "images"],
    output_key="edited_images",
    save_interval=save_interval
)
```

## Image Quality Assessment
We use a multimodal large model to score and filter generated images.

### Data format
```jsonl
{"conversations": [{"content": "four cups were filled with hot coffee", "role": "user"}], "images": ["./dataflow/example/test_text_to_image_eval/images/four cups were filled with hot coffee_001005.png"]}
{"conversations": [{"content": "four balloons, one cup, four desks, two dogs and four microwaves", "role": "user"}], "images": ["./dataflow/example/test_text_to_image_eval/images/four balloons, one cup, four desks, two dogs and four microwaves_003032.png"]}
```

### Evaluation script
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
