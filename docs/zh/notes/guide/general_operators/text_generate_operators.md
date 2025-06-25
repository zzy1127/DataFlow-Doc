---
title: 通用文本数据合成算子
createTime: 2025/06/24 21:49:55
permalink: /zh/guide/lo3cyadt/
---

# 文本数据合成

目前Dataflow集成了两种基础文本数据合成器，分别涉及预训练文档数据和SFT格式数据。

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
      <td class="tg-0pky">SupervisedFinetuneGenerator</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">根据种子文档合成SFT格式QA数据对，并返回原文信息</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>
