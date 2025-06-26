---
title: General Generate Operators
createTime: 2025/06/24 21:49:55
permalink: /en/guide/text_generate_operators/
---

# Text Data Synthesis
Currently, Dataflow integrates two basic text data synthesizers, which involve pre-trained document data and SFT format data.

<table class="tg">
  <thead>
    <tr>
      <th class="tg-0pky">Name</th>
      <th class="tg-0pky">Applicable Type</th>
      <th class="tg-0pky">Description</th>
      <th class="tg-0pky">Repository or Paper</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="tg-0pky">PretrainGenerator</td>
      <td class="tg-0pky">Pretrain</td>
      <td class="tg-0pky">Synthesize phi-4 question and answer data pairs using pre trained document data, and retell the document in QA format</td>
      <td class="tg-0pky"><a href="https://arxiv.org/pdf/2401.16380">Paper</a></td>
    </tr>
    <tr>
      <td class="tg-0pky">SupervisedFinetuneGenerator</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">Synthesize SFT format QA data pairs based on seed documents and return original information</td>
      <td class="tg-0pky">-</td>
    </tr>
  </tbody>
</table>
