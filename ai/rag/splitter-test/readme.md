# Splitter 理解

- loader 加载的大Document @langchain/community
    paf doc 不是一个类型
- RecursiveCharacterTextSplitter 
    Text
- splitter
    character 按这个切  符合语义
    ["。","？","!","，"]
    优先级 。最优先
    chunk_size 的靠近 递归的尝试，? !
    保持语义
    切断 overlap 牺牲一定的空间 (chunk_size 10%) 重复

    先character 切 再 chunkSize 最后 Overlap

- RAG 问题
    - 流程
    - loader
    - splitter 细节 三个参数
    - splitter 面向对象体系和关系
        父类 TextSplitter 切割的是文本，mp3,mp4 不合适
        一系列的子类 CharacterTextSpliter 按字符切割
        TokenTextSplitter 按token数量切割
        RecursiveTextSplitter 语义的完整性特别好
            MarkdownTextSplitter 为什么属于
            RecursiveTextSplitter 子类
            #  ## ### 递归

- CharacterTextSplitter
    直接按Character separator 切割
- RecursiveCharacterTextSplitter
    更人性化，更努力
    尝试其他符号时，语义就弱下来了，overlap 来弥补一下

四种 TextSplitter 子类的对比实验:

  CharacterTextSplitter — 按单个字符（或字符串）分隔符切割，最简单
  RecursiveCharacterTextSplitter — 按优先级 ["\n", "。", "？", "!", "，"] 递归切割，语义保持更好，通过 overlap 弥补切割痕迹
  TokenTextSplitter — 按 token 数量切割，使用 tiktoken 的 cl100k_base 编码，适合 LLM 上下文窗口限制
  通过 tiktoken 验证每个 chunk 的字符数与 token 数对应关系
  核心知识点：chunkSize 控制块大小、chunkOverlap 控制重叠、separators 控制语义切割优先级