---
title: new_algo
createTime: 2025/06/12 12:00:00
permalink: /zh/article/01bvnqb1/
---

## New Algorithm

DataFlow算子在具体实现上分为两种
1. 有统一基类的算子，位于``dataflow/Eval``或``dataflow/process``下，这些算子需要实现基类所需的固定方法（如``__init__()``, ``evaluate_batch()``, ``filter_func()``等）

2. 没有统一基类的算子，位于``dataflow/generator/algorithm``文件夹，这些算子必须实现``__init__``和``run()``方法。

如果想要在DataFlow中添加新算子，在实现算子及其所包含的方法后需要进行如下操作：

1. 在算子所在文件夹下添加包含算子类的文件

2. 在该文件中导入Registry实例，并用``register()``方法修饰

3. 在算子所在文件夹下的__init__.py文件中，向``_import_structure``变量添加算子指向的相对路径。

如果有必要添加新的算子文件夹，需要在``dataflow/utils/registry.py``中进行相应修改。
