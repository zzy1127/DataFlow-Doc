---
title: 纯文本流水线
icon: mdi:file-text
createTime: 2025/06/16 13:08:42  
permalink: /zh/guide/textpipeline/  
---

# 纯文本流水线

## 1. 概述

纯文本流水线旨在处理不同格式的文本信息，包括预训练文本和指令微调格式文本。根据功能，可以划分为四个类型：

1. 预训练数据过滤流水线：对原始预训练文本进行去重、改写和过滤操作，得到高质量预训练文本数据。

2. 预训练类phi-4数据合成流水线：在**流水线1**基础上，使用QA对话形式复述预训练文档，合成对话形式预训练数据，并对合成后的数据进行质量过滤，得到高质量的类phi-4格式预训练数据。

3. SFT数据过滤流水线：对原始SFT格式数据进行质量过滤，得到高质量SFT数据。

4. SFT数据合成流水线：根据原始预训练文本输入，在**流水线1**基础上，使用高质量预训练文本合成SFT格式数据，并对合成后的数据进行**流水线3**质量过滤，得到合成后的高质量SFT数据。

---

## 2. 一键运行

流水线1: **预训练数据过滤**
```bash
python test/test_pt_filter.py
```
流水线2: **预训练类phi-4数据合成**
```bash
python test/test_pt_synthetic.py
```

流水线3: **SFT数据过滤**
```bash
python test/test_sft_filter.py
```
流水线4: **SFT数据合成**
```bash
python test/test_sft_synthetic.py
```

> 这四个脚本中分别定义了四条通用数据处理流水线。

---

## 3. 数据格式

### 3.1 输入数据

- **支持格式**：`json`、`jsonl`、`parquet`
- **字段检测设置**：  
  在`keys`参数中设置字段，预训练数据设置为待处理的字段，如`'raw_content'`，SFT数据建议设置为`'[instruction, input, output]'`
- **可选字段**：其它字段会被忽略，但建议只保留必要字段，避免与后续处理冲突。  
- **演示数据集**：  
  - 预训练数据`text_pipeline/data/pt_input.jsonl`  
  - SFT数据`text_pipeline/data/sft_input.jsonl`

这些输入数据可以存储在指定的文件（如`json`、`jsonl`）中，并通过`FileStorage`对象进行管理和读取。示例中会载入默认的数据路径（`dataflow/example/GeneralTextPipeline`），实际使用场景下可以根据需求修改路径以载入自定义的数据和缓存路径：

```python
self.storage = FileStorage(
    first_entry_file_name="./dataflow/example/GeneralTextPipeline/pt_input.jsonl",
    cache_path="./cache",
    file_name_prefix="dataflow_cache_step",
    cache_type="jsonl",
)
```

### 3.2 输出数据

- **格式**：`jsonl`（每个步骤都会生成一个文件）  
- **字段说明**：
  - 去重、过滤算子不改变字段格式，仅删除数据
  - 改写算子不改变字段格式，仅改写数据
  - 类phi-4预训练数据合成算子结果添加在`generated_content`字段中
  - SFT数据合成算子结果保存为`instruction, output, raw_content`字段，分别表示指令、输出和原文档内容。
---

## 4. 流程与算子

### 4.1 预训练数据过滤流水线

1. **语言过滤 (LanguageFilter)**  
   - 仅保留英文文本（或指定特定语言）  


2. **删除多余空格 (RemoveExtraSpacesRefiner)**  
   - 删除多余空格  

3. **删除表情符号 (RemoveEmojiRefiner)**  
   - 删除表情符号，如

4. **删除 HTML 标签 (HtmlUrlRemoverRefiner)**  
   - 删除 HTML 标签，如\<tag\>

5. **MinHash 数据去重 (MinHashDeduplicator)**  
   - 基于 MinHash 算法进行数据去重  

6. **敏感词过滤 (BlocklistFilter)**  
   - 过滤含屏蔽词较多的文本，屏蔽词列表见[List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words) 


7. **单词数量过滤 (WordNumberFilter)**  
   - 文本单词数量过滤，保留单词数据在[20, 100000]中的文本（可调）

8. **冒号结尾过滤 (ColonEndFilter)**  
   - 过滤以冒号结尾的文本


9. **语句数量过滤 (SentenceNumberFilter)**  
   - 过滤句子数量异常的文本，保留句子数量范围为[3, 7500]（可调）

10. **省略号结尾过滤 (LineEndWithEllipsisFilter)**  
    - 过滤省略号结尾句子比例大于0.3的文本（可调）

11. **空文本过滤 (ContentNullFilter)**  
    - 过滤空文本  

12. **平均单词长度过滤 (MeanWordLengthFilter)**  
    - 文本平均单词长度过滤, 保留平均单词长度在[3, 10]的文本（可调）

13. **符号/单词比例过滤 (SymbolWordRatioFilter)**  
    - 过滤符号（如#）/单词比例大于0.4的文本（可调）

14. **HTML 标签过滤 (HtmlEntityFilter)**  
    - 过滤含HTML标签的文本，如nbsp, lt, gt等

15. **ID Card 过滤 (IDCardFilter)**  
    - 隐私保护，过滤含 ID Card 相关信息多的文本，如：”身份证“，”ID NO.“等

16. **无标点符号过滤 (NoPuncFilter)**  
    - 过滤无标点符号的文本  

17. **特殊符号过滤 (SpecialCharacterFilter)**  
    - 过滤含有特殊符号（如r"u200e"）的文本

18. **水印过滤 (WatermarkFilter)**  
    - 过滤含水印的文本，如“Watermark”, "Copyright"等。

19. **括号比例过滤 (CurlyBracketFilter)**  
    - 过滤括号比例高(大于0.025)的文本（可调）

20. **大写字母比例过滤 (CapitalWordsFilter)**  
    - 过滤大写字母比例高（大于0.2）的文本（可调）

21. **Lorem Ipsum 过滤 (LoremIpsumFilter)**  
    - 过滤含 lorem ipsum 的文本。lorem ipsum为常用于排版设计的随机假文。

22. **Unique 单词过滤 (UniqueWordsFilter)**  
    - 过滤独立单词比例小于0.1的文本（可调）

23. **字符数量过滤 (CharNumberFilter)**  
    - 过滤字符数少于100的文本（可调）

24. **项目符号开头过滤 (LineStartWithBulletpointFilter)**  
    - 过滤以项目符号开头比例大于0.9的文本（可调）  

25. **含 Javascript 过滤 (LineWithJavascriptFilter)**  
    - 过滤含 Javascript 数量大于3的文本（可调）

26. **文本质量打分器 (PairQualFilter)**  
    - 使用质量打分器进行文本质量打分。该质量打分器基于bge模型，支持中英双语，使用gpt对文本成对比较打分后训练而成。[模型地址](https://huggingface.co/zks2856/PairQual-Scorer-zh)

---

### 4.2 预训练类phi-4数据合成流水线

在**流水线1**的基础上，添加如下算子：

1. **预训练数据合成 (PretrainGenerator)**  
- 使用llm根据种子文档合成类 Phi-4 风格QA问答对数据
- prompt见`dataflow/prompts/general_text.py`，可更改

2. **Qurating质量打分过滤 (QuratingFilter)**
- 从 writing_style、required_expertise、facts_and_trivia、educational_value 四个维度打分并过滤合成后的文本。[模型地址](https://github.com/princeton-nlp/QuRating)


### 4.3 SFT数据过滤流水线

1. **输出长度过滤 (WordNumberFilter)**  
   - 按照 output 长度过滤数据，保留长度为20-1000之间（可调）

2. **指令 IFD 分数过滤 (SuperfilteringFilter)**  
   - 按照指令 IFD 分数过滤数据。[模型地址](https://github.com/tianyi-lab/Superfiltering)

3. **指令质量得分过滤 (DeitaQualityFilter)**  
   - 按照指令质量得分过滤数据。[模型地址](https://huggingface.co/hkust-nlp/deita-quality-scorer)


4. **Instruction 标签数过滤 (InstagFilter)**  
   - 按照 instruction 标签数过滤数据。[模型地址](https://github.com/OFA-Sys/InsTag)

### 4.4 SFT数据合成流水线

在**流水线1**和**流水线3**的基础上添加如下算子：

1. **SFT数据合成 (SupervisedFinetuneGenerator)**  
- 使用llm根据种子文档合成SFT格式数据
- prompt见`dataflow/prompts/general_text.py`，可更改
