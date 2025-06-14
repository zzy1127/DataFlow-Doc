---
title: Pull Request规范
createTime: 2025/06/13 10:42:46
permalink: /zh/dev_guide/pull_request/
---
# Pull Request 规范

开发者在准备开发前，请fork本仓库到自己的账号下，并git clone 到本地。

完成clone操作后，设置上游仓库为本仓库

```
git remote add upstream <DataFlow URL>
```

在提交修改前，请将仓库与上游仓库同步：

```
git pull upstream main
```
同步后进行提交：
```
git push origin main
```

在提交修改到自己账户的fork仓库后，发起pull request，发起之前，请**确保没有修改无关部分** 并 **仔细检查修改部分的正确性**。发起时请在comment部分对修改进行描述。