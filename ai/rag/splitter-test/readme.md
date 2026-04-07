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