---
title: Text Pipeline
icon: mdi:file-text
createTime: 2025/06/16 13:08:42  
permalink: /en/guide/textpipeline/  
---

# Text Pipeline

## 1. Overview

The text pipeline aims to process text information in various formats, including pretraining text and SFT formatted text. Based on functionality, it can be divided into four types:

1. **Pretraining Data Filtering Pipeline**: Perform deduplication, rewriting, and filtering operations on raw pretraining text to obtain high-quality pretraining text data.
2. **Phi-4 Style Pretraining Data Synthesis Pipeline**: Based on **Pipeline 1**, use QA dialogue format to paraphrase pretraining documents, synthesize dialogue-style pretraining data, and apply quality filtering to obtain high-quality phi-4-style pretraining data.
3. **SFT Data Filtering Pipeline**: Filter raw SFT-format data to obtain high-quality SFT data.
4. **SFT Data Synthesis Pipeline**: Based on original pretraining text input and **Pipeline 1**, use high-quality pretraining text to synthesize SFT-format data, then apply **Pipeline 3** quality filtering to obtain high-quality synthesized SFT data.

---

## 2. One-Click Execution

Pipeline 1: **Pretraining Data Filtering**
```bash
python test/test_pt_filter.py
```
Pipeline 2: **Phi-4 Style Pretraining Data Synthesis**
```bash
python test/test_pt_synthetic.py
```
Pipeline 3: **SFT Data Filtering**
```bash
python test/test_sft_filter.py
```
Pipeline 4: **SFT Data Synthesis**
```bash
python test/test_sft_synthetic.py
```


> These four scripts define four general data processing pipelines respectively.

---

## 3. Data Format

### 3.1 Input Data

- **Supported Formats**: `json`, `jsonl`, `parquet`
- **Field Detection Settings**:  
  Set the fields in the `keys` parameter. For pretraining data, set to the field to be processed, such as `'raw_content'`. For SFT data, it is recommended to set to `['instruction', 'input', 'output']`.
- **Optional Fields**: Other fields will be ignored, but it is recommended to only keep necessary fields to avoid conflicts with subsequent processing.
- **Demo Datasets**:  
  - Pretraining data: `text_pipeline/data/pt_input.jsonl`  
  - SFT data: `text_pipeline/data/sft_input.jsonl`

These input data can be stored in specified files (such as ` json `, ` json `) and managed and read through the ` FileStorage ` object. In the example, the default data path will be loaded (`dataflow/example/GeneralTextPipeline`). In actual usage scenarios, the path can be modified according to requirements to load custom data and cache paths:

```python
self.storage = FileStorage(
    first_entry_file_name="./dataflow/example/GeneralTextPipeline/pt_input.jsonl",
    cache_path="./cache",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl",
)
```

### 3.2 Output Data

- **Format**: `jsonl` (each step will generate one file)
- **Field Description**:
  - Deduplication and filtering operators do not change field structure, only remove data.
  - Rewriting operators do not change field names, only modify data.
  - The result of the phi-4-style pretraining synthesis operator is added to the `generated_content` field.
  - The SFT synthesis operator result is saved in `instruction`, `output`, and `raw_content` fields, representing the instruction, output, and original document content respectively.

---

## 4. Process & Operators

### 4.1 Pretraining Data Filtering Pipeline

1. **LanguageFilter**  
   -  Keep only English text (or specified language)  

2. **RemoveExtraSpacesRefiner**  
   -  Remove extra spaces  

3. **RemoveEmojiRefiner**  
   -  Remove emojis  

4. **HtmlUrlRemoverRefiner**  
   -  Remove HTML tags, such as \<tag\>
 
5. **MinHashDeduplicator**  
   -  Deduplicate data based on MinHash algorithm  
  
6. **BlocklistFilter**  
   -  Filter text containing too many blocked words, blocklist refers to [List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words)    
  
7. **WordNumberFilter**  
   -  Filter by word count in [20, 100000] (adjustable)
 
8. **ColonEndFilter**  
   -  Filter text ending with a colon  
   
9. **SentenceNumberFilter**  
   -  Filter by abnormal sentence count, keep documents which sentence count in [3, 7500] (adjustable)
  
10. **LineEndWithEllipsisFilter**  
    -  Filter text with ellipsis ending sentence ratio greater than 0.3 (adjustable)
   
11. **ContentNullFilter**  
    -  Filter empty text  
 
12. **MeanWordLengthFilter**  
    -  Filter by average word length in [3, 10] (adjustable)
   
13. **SymbolWordRatioFilter**  
    -  Filter text with symbol(such as #)-to-word ratio > 0.4

14. **HtmlEntityFilter**  
    -  Filter text with excessive HTML entities, such as nbsp, lt, gt... 
 
15. **IDCardFilter**  
    -  Privacy protection. Filter text containing ID card information, such as ”身份证“，”ID NO.“.

16. **NoPuncFilter**  
    -  Filter text without punctuation  

17. **SpecialCharacterFilter**  
    -  Filter text with any special characters (such as r"u200e")
 
18. **WatermarkFilter**  
    -  Filter text containing watermarks, such as“Watermark”, 

19. **CurlyBracketFilter**  
    -  Filter text with curly bracket ratio greater than 0.025. (adjustable)

20. **CapitalWordsFilter**  
    -  Filter text with uppercase letter ratio greater than 0.2. (adjustable)

21. **LoremIpsumFilter**  
    -  Filter text containing "lorem ipsum". The text. Lorem Ipsum is a random pseudotext commonly used in typesetting design.

22. **UniqueWordsFilter**  
    -  Filter text with unique words ratio < 0.1 (adjustable)

23. **CharNumberFilter**  
    -  Filter text with characters less than 100 (adjustable)

24. **LineStartWithBulletpointFilter**  
    -  Filter text starting with bullet points ratio greater than 0.9 (adjustable) 

25. **LineWithJavascriptFilter**  
    -  Filter text containing JavaScript numbers > 3 (adjustable)

26. **PairQualFilter**  
    -  Score text quality with a quality scorer, which is based on the bge model and supports both Chinese and English. It is trained using GPT to compare and score texts in pairs. [Model](https://huggingface.co/zks2856/PairQual-Scorer-en)


### 4.2 Phi-4 Style Pretraining Data Synthesis Pipeline

Based on **Pipeline 1**, add the following operators:

1. **PretrainGenerator**  
   - Use llm to synthesize phi-4-style QA pair data from seed documents  
   - Prompt can be found in 'dataflow/prompts/generat_text.py', which can be modified

2. **QuratingFilter**  
   -  Score and filter synthesized text across writing_style, required_expertise, facts_and_trivia, educational_value dimensions. [Model](https://github.com/princeton-nlp/QuRating)

### 4.3 SFT Data Filtering Pipeline

1. **WordNumberFilter**  
   -  Filter by output length, keep between 20–1000 words (adjustable)

2. **SuperfilteringFilter**  
   -  Filter by instruction IFD score. [Model](https://github.com/tianyi-lab/Superfiltering)

3. **DeitaQualityFilter**  
   -  Filter by instruction quality score. [Model](https://huggingface.co/hkust-nlp/deita-quality-scorer)

4. **InstagFilter**  
   -  Filter by number of instruction tags  [Model](https://github.com/OFA-Sys/InsTag)


### 4.4 SFT Data Synthesis Pipeline

Based on **Pipeline 1** and **Pipeline 3**, add the following operator:

1. **SupervisedFinetuneGenerator**  
   - Use llm to synthesize SFT-format data from seed documents  
   - Prompt can be found in 'dataflow/prompts/generat_text.py', which can be modified
