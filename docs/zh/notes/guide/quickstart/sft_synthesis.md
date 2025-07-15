---
title: 案例2. 从0开始合成SFT数据
createTime: 2025/7/15 14:19:16
permalink: /zh/guide/quickstart/sft_synthesis
icon: basil:lightning-alt-outline
---

# 从0开始合成SFT数据

## 第一步:安装dataflow环境
```shell
pip install open-dataflow
```
## 第二步:创建新的dataflow工作文件夹
```shell
mkdir run_dataflow
cd run_dataflow
```
## 第三步:初始化Dataflow
```shell
dataflow init
```
这时你会看见
```shell
run_dataflow/playground/text_sft_synthesis_pipeline.py  
```
## 第四步:填入你的api key以及api_url
对于Linux和Mac OS
```shell
export DF_API_KEY="sk-xxxxx"
```

对于Windows
```powershell
$env:DF_API_KEY = "sk-xxxxx"
```
`text_sft_synthesis_pipeline.py`中的api_url填写方式如下：
```python
self.llm_serving = APILLMServing_request(
        api_url="https://api.openai.com/v1/chat/completions",
        model_name="gpt-4o",
        max_workers=100
)
```

## 第五步:一键运行
```bash
python playground/text_sft_synthesis_pipeline.py  
```

运行时，该流水线会先后调用`CondorGenerator`, `CondorRefiner`和`AlpagasusFilter`，分别进行SFT数据合成、数据改写和数据质量过滤，最终数据会保存在`run_dataflow/cache`中。（可通过`self.num_generated_samples`参数改变合成数据数量，由于该流水线基于内置种子进行数据合成，为了数据多样性，建议设置合成数量小于5000，否则可在`dataflow.prompts.general_text.CondorPrompt`类中自行增加种子）

## 合成数据示例
```json
{
    "difficulty":"Easy",
    "instruction":"Religious policies can shape societies in numerous ways. One example is where policies for religious freedom allow diverse religions to coexist peacefully within a nation. Considering a country that recently implemented laws to ensure religious freedom for all its citizens, discuss some potential positive impacts these policies may have on social harmony and economic growth.",
    "output":"Implementing laws that ensure religious freedom can have several positive impacts on a country's social harmony and economic growth. However, it's important to also consider potential challenges and the steps necessary for realizing these benefits sustainably:\n\n1. **Social Harmony:**\n   - **Increased Tolerance and Understanding:** Religious freedom allows individuals to express their beliefs openly without fear of persecution. This can lead to greater tolerance and understanding among different religious communities, fostering social cohesion.\n   - **Reduction of Religious Conflicts:** By guaranteeing religious freedom, a country can reduce the likelihood of religious conflicts and tensions, promoting peace and stability within society. However, managing cultural differences requires ongoing dialogue and education to prevent deeply rooted prejudices from hindering social harmony.\n   - **Cultural Diversity and Enrichment:** The coexistence of diverse religious groups can enrich the cultural landscape of a nation, encouraging exchanges of ideas, traditions, and values that can enhance mutual respect and appreciation. Community engagement initiatives and educational programs can support this enrichment and ensure equitable treatment across all religious groups.\n\n2. **Economic Growth:**\n   - **Attracting Talent and Investment:** Religious freedom can make a country more attractive to international talent and investors who seek a stable and open environment to live and conduct business. This can lead to increased foreign direct investment and enhance the country's global economic standing. Governments and communities must actively promote inclusivity to maintain this attractiveness.\n   - **Boosting Tourism:** A reputation for religious inclusivity can boost tourism, as travelers often prefer destinations where diverse religious practices are respected. Religious festivals and sites can attract visitors, benefiting local economies. Policies ensuring safety and respect for all types of visitors are crucial for sustained tourism growth.\n   - **Encouraging Innovation and Entrepreneurship:** When individuals feel safe to express their beliefs and live according to their values, they are more likely to contribute positively to society. A diverse population can lead to a greater exchange of ideas, fostering innovation and creativity in business ventures and community projects. Long-term educational and community support systems are necessary to encourage continued innovation.\n\nTo provide a more comprehensive view, examining case studies of countries like Canada, which has successfully implemented religious freedom policies leading to vibrant multiculturalism and economic development, can offer valuable insights into strategies for sustaining these positive impacts.\n\nOverall, while laws promoting religious freedom can contribute to building a harmonious society and driving economic growth, acknowledging challenges and implementing supportive measures are essential for achieving and maintaining these benefits over time.",
    "AlpagasusScore":4.0
}
```