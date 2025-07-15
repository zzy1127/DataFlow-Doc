---
title: Case 2. Synthesizing SFT Data from Scratch
createTime: 2025/7/15 14:19:16
permalink: /zh/guide/quickstart/sft_synthesis
icon: basil:lightning-alt-outline
---

# Synthesizing SFT Data from Scratch

## Step 1: Install the Dataflow environment
```shell
pip install open-dataflow
```

## Step 2: Create a new Dataflow working directory
```shell
mkdir run_dataflow
cd run_dataflow
```

## Step 3: Initialize Dataflow
```shell
dataflow init
```
At this point, you'll see:
```shell
run_dataflow/playground/text_sft_synthesis_pipeline.py
```

## Step 4: Enter your API key and API URL
For Linux and Mac OS:
```shell
export DF_API_KEY="sk-xxxxx"
```

For Windows:
```powershell
$env:DF_API_KEY = "sk-xxxxx"
```

Set the `api_url` in `text_sft_synthesis_pipeline.py` as follows:
```python
self.llm_serving = APILLMServing_request(
    api_url="https://api.openai.com/v1/chat/completions",
    model_name="gpt-4o",
    max_workers=100
)
```

## Step 5: One-click execution
```bash
python playground/text_sft_synthesis_pipeline.py
```

During execution, the pipeline will sequentially invoke `CondorGenerator`, `CondorRefiner`, and `AlpagasusFilter` for SFT data synthesis, refine, and quality filtering respectively. The final data will be saved in `run_dataflow/cache`. (You can change the number of synthesized samples with the `self.num_generated_samples` parameter. Since the pipeline generates data based on built-in seeds, for data diversity it's recommended to keep the number below 5000. Otherwise, you can manually add seeds in the `dataflow.prompts.general_text.CondorPrompt` class.)

## Example of synthesized data
```json
{
    "difficulty":"Easy",
    "instruction":"Religious policies can shape societies in numerous ways. One example is where policies for religious freedom allow diverse religions to coexist peacefully within a nation. Considering a country that recently implemented laws to ensure religious freedom for all its citizens, discuss some potential positive impacts these policies may have on social harmony and economic growth.",
    "output":"Implementing laws that ensure religious freedom can have several positive impacts on a country's social harmony and economic growth. However, it's important to also consider potential challenges and the steps necessary for realizing these benefits sustainably:\n\n1. **Social Harmony:**\n   - **Increased Tolerance and Understanding:** Religious freedom allows individuals to express their beliefs openly without fear of persecution. This can lead to greater tolerance and understanding among different religious communities, fostering social cohesion.\n   - **Reduction of Religious Conflicts:** By guaranteeing religious freedom, a country can reduce the likelihood of religious conflicts and tensions, promoting peace and stability within society. However, managing cultural differences requires ongoing dialogue and education to prevent deeply rooted prejudices from hindering social harmony.\n   - **Cultural Diversity and Enrichment:** The coexistence of diverse religious groups can enrich the cultural landscape of a nation, encouraging exchanges of ideas, traditions, and values that can enhance mutual respect and appreciation. Community engagement initiatives and educational programs can support this enrichment and ensure equitable treatment across all religious groups.\n\n2. **Economic Growth:**\n   - **Attracting Talent and Investment:** Religious freedom can make a country more attractive to international talent and investors who seek a stable and open environment to live and conduct business. This can lead to increased foreign direct investment and enhance the country's global economic standing. Governments and communities must actively promote inclusivity to maintain this attractiveness.\n   - **Boosting Tourism:** A reputation for religious inclusivity can boost tourism, as travelers often prefer destinations where diverse religious practices are respected. Religious festivals and sites can attract visitors, benefiting local economies. Policies ensuring safety and respect for all types of visitors are crucial for sustained tourism growth.\n   - **Encouraging Innovation and Entrepreneurship:** When individuals feel safe to express their beliefs and live according to their values, they are more likely to contribute positively to society. A diverse population can lead to a greater exchange of ideas, fostering innovation and creativity in business ventures and community projects. Long-term educational and community support systems are necessary to encourage continued innovation.\n\nTo provide a more comprehensive view, examining case studies of countries like Canada, which has successfully implemented religious freedom policies leading to vibrant multiculturalism and economic development, can offer valuable insights into strategies for sustaining these positive impacts.\n\nOverall, while laws promoting religious freedom can contribute to building a harmonious society and driving economic growth, acknowledging challenges and implementing supportive measures are essential for achieving and maintaining these benefits over time.",
    "AlpagasusScore":4.0
}
```