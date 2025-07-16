---
title: 通用文本数据合成算子
createTime: 2025/06/24 21:49:55
permalink: /zh/guide/lo3cyadt/
---

# 文本数据合成

目前Dataflow集成了五种基础文本数据合成器，涉及预训练文档数据、SFT格式数据、多轮对话等不同格式。

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">名称</th>
      <th class="tg-0pky">适用类型</th>
      <th class="tg-0pky">简介</th>
      <th class="tg-0pky">官方仓库或论文</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">PretrainGenerator</td>
      <td class="tg-0pky">预训练</td>
      <td class="tg-0pky">使用预训练文档数据合成类phi-4问答数据对，使用QA格式复述文档</td>
      <td class="tg-0pky"><a href="https://arxiv.org/pdf/2401.16380">Paper</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">SFTGeneratorSeed</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">根据种子文档合成SFT格式QA数据对，并返回原文信息</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">CondorGenerator</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">根据预置知识树标签，两阶段从0合成SFT格式数据（合成数量大于5000时建议增加标签数量）</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2501.12273">paper</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">PromptedGenerator</td>
      <td class="tg-0pky">-</td>
      <td class="tg-0pky">根据用户自定义prompt进行数据生成</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">ConsistentChatGenerator</td>
      <td class="tg-0pky">多轮对话</td>
      <td class="tg-0pky">根据预置主题和人类意图，两阶段从0合成多轮对话格式数据（合成数量大于9000时建议增加标签数量）</td>
      <td class="tg-0pky"><a href="https://arxiv.org/pdf/2506.03558">paper</a></td>
    </tr>
  </tbody>
</table>
