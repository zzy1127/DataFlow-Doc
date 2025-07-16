---
title: Case 2. SFT Data Synthesis
createTime: 2025/7/15 14:19:16
permalink: /en/guide/sft_synthesis/
icon: basil:lightning-alt-outline
---

# SFT Data Synthesis

## Generate from Scratch

### Step 1: Install the dataflow environment
```shell
pip install open-dataflow
```

### Step 2: Create a new dataflow workspace
```shell
mkdir run_dataflow
cd run_dataflow
```

### Step 3: Initialize Dataflow
```shell
dataflow init
```
You will then see:
```shell
run_dataflow/playground/text_sft_synthesis_from_scratch.py  
```

### Step 4: Enter your API key and API URL
For Linux and Mac OS:
```shell
export DF_API_KEY="sk-xxxxx"
```

For Windows:
```powershell
$env:DF_API_KEY = "sk-xxxxx"
```

In `text_sft_synthesis_from_scratch.py`, fill in the API URL as follows:
```python
self.llm_serving = APILLMServing_request(
        api_url="https://api.openai.com/v1/chat/completions",
        model_name="gpt-4o",
        max_workers=100
)
```

### Step 5: One-click Execution
```bash
python playground/text_sft_synthesis_from_scratch.py  
```

During execution, this pipeline will sequentially call `CondorGenerator`, `CondorRefiner`, and `AlpagasusFilter` for SFT data generation, rewriting, and quality filtering. The final data will be saved in `run_dataflow/cache`. (You can change the number of generated samples using `self.num_generated_samples`. Since the pipeline uses built-in seeds for generation, it’s recommended to keep the number below 5000 for diversity. You can add more seeds in `dataflow.prompts.general_text.CondorPrompt` if needed.)

### Example of Generated Data
```json
{
    "difficulty":"Easy",
    "instruction":"Religious policies can shape societies in numerous ways. One example is where policies for religious freedom allow diverse religions to coexist peacefully within a nation. Considering a country that recently implemented laws to ensure religious freedom for all its citizens, discuss some potential positive impacts these policies may have on social harmony and economic growth.",
    "output":"Implementing laws that ensure religious freedom can have several positive impacts on a country's social harmony and economic growth. However, it's important to also consider potential challenges and the steps necessary for realizing these benefits sustainably:\n\n1. **Social Harmony:**\n   - **Increased Tolerance and Understanding:** Religious freedom allows individuals to express their beliefs openly without fear of persecution. This can lead to greater tolerance and understanding among different religious communities, fostering social cohesion.\n   - **Reduction of Religious Conflicts:** By guaranteeing religious freedom, a country can reduce the likelihood of religious conflicts and tensions, promoting peace and stability within society. However, managing cultural differences requires ongoing dialogue and education to prevent deeply rooted prejudices from hindering social harmony.\n   - **Cultural Diversity and Enrichment:** The coexistence of diverse religious groups can enrich the cultural landscape of a nation, encouraging exchanges of ideas, traditions, and values that can enhance mutual respect and appreciation. Community engagement initiatives and educational programs can support this enrichment and ensure equitable treatment across all religious groups.\n\n2. **Economic Growth:**\n   - **Attracting Talent and Investment:** Religious freedom can make a country more attractive to international talent and investors who seek a stable and open environment to live and conduct business. This can lead to increased foreign direct investment and enhance the country's global economic standing. Governments and communities must actively promote inclusivity to maintain this attractiveness.\n   - **Boosting Tourism:** A reputation for religious inclusivity can boost tourism, as travelers often prefer destinations where diverse religious practices are respected. Religious festivals and sites can attract visitors, benefiting local economies. Policies ensuring safety and respect for all types of visitors are crucial for sustained tourism growth.\n   - **Encouraging Innovation and Entrepreneurship:** When individuals feel safe to express their beliefs and live according to their values, they are more likely to contribute positively to society. A diverse population can lead to a greater exchange of ideas, fostering innovation and creativity in business ventures and community projects. Long-term educational and community support systems are necessary to encourage continued innovation.\n\nTo provide a more comprehensive view, examining case studies of countries like Canada, which has successfully implemented religious freedom policies leading to vibrant multiculturalism and economic development, can offer valuable insights into strategies for sustaining these positive impacts.\n\nOverall, while laws promoting religious freedom can contribute to building a harmonious society and driving economic growth, acknowledging challenges and implementing supportive measures are essential for achieving and maintaining these benefits over time.",
    "AlpagasusScore":4.0
}
```

## Generate from User Input

In your working directory, you'll find:
```shell
run_dataflow/playground/text_sft_synthesis_from_seed.py  
```

Set the seed data path in `first_entry_file_name`:
```python
self.storage = FileStorage(
        first_entry_file_name="./example_data/GeneralTextPipeline/pt_input.jsonl",
        cache_path="./cache",
        file_name_prefix="dataflow_cache_step",
        cache_type="jsonl",
    )
```

Users can customize synthesis requirements in `custom_prompt`:
```python
self.generator = SFTGeneratorSeed(llm_serving=llm_serving, custom_prompt="Try to make the question suitable for middle school students.")
```

### One-click Execution
```bash
python playground/text_sft_synthesis_from_seed.py  
```

### Example of Generated Data
```json
{
    "instruction":"What historical significance does the Banc Texas Allen Parkway, completed in 1983, hold, and how might a middle school student find more information about its architectural design using the resources from Rice University's Woodson Research Center?",
    "output":"The Banc Texas Allen Parkway, completed in 1983, is a notable piece of architecture with its designs archived in the Arthur E. Jones Architectural Records. The Woodson Research Center at Rice University holds these records, allowing students to explore its architectural significance by accessing the physical archives or visiting their webpage for online resources. Middle school students can learn more by searching for documents related to Banc Texas Allen Parkway in Box 6, Folder 4 at http://archives.library.rice.edu/repositories/2/archival_objects/79290.",
    "raw_content":"Banc Texas Allen Parkway, completed 1983
Banc Texas Allen Parkway, completed 1983, Box: 6, Folder: 4. Arthur E. Jones Architectural Records, MS 535. Woodson Research Center, Rice University, Houston, Texas. http://archives.library.rice.edu/repositories/2/archival_objects/79290 Accessed January 26, 2023."
}
```
