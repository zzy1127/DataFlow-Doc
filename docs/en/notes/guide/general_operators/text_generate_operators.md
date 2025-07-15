---
title: General Generate Operators
createTime: 2025/06/24 21:49:55
permalink: /en/guide/text_generate_operators/
---

# Text Data Generation
Currently, Dataflow integrates four fundamental text data generators, covering pre-training document data, SFT-format data, and multi-turn dialogues.

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
      <td class="tg-0pky">SFTGeneratorSeed</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">Synthesize SFT format QA data pairs based on seed documents and return original information</td>
      <td class="tg-0pky">-</td>
    </tr>
    <tr>
      <td class="tg-0pky">CondorGenerator</td>
      <td class="tg-0pky">SFT</td>
      <td class="tg-0pky">Two-stage synthesis of SFT-format data from scratch based on preset knowledge tree labels (recommend increasing label variety if generating more than 5000 samples)</td>
      <td class="tg-0pky"><a href="https://arxiv.org/abs/2501.12273">paper</a></td>
    </tr>
    <tr>
          <td class="tg-0pky">ConsistentChatGenerator</td>
          <td class="tg-0pky">Multi-turn Dialogue</td>
          <td class="tg-0pky">Two-stage synthesis of multi-turn dialogue data from scratch based on preset topics and human intents (recommend increasing label variety if generating more than 9000 samples)</td>
          <td class="tg-0pky"><a href="https://arxiv.org/pdf/2506.03558">paper</a></td>
    </tr>


  </tbody>
</table>
