---
title: Installation  
icon: material-symbols-light:download-rounded  
createTime: 2025/06/09 10:29:31  
permalink: /en/guide/install/  
---  
# Installation  
This section explains how to set up the dependency environment for DataFlow.  

The dependencies for DataFlow's text pipeline can be installed using the following commands (assuming conda is already installed on the system):  

```shell  
conda create -n dataflow python=3.10  
conda activate dataflow  

git clone https://github.com/Open-DataFlow/DataFlow  
cd DataFlow  
pip install -e .  
```  

The versions of dependencies such as torch and vllm can be adjusted based on the CUDA version.  

To quickly get started with DataFlow's text pipeline, please refer to the Quick Start section.