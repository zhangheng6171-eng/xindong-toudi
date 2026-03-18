# 心动投递 - 高级特征工程方案 v2.0

> **版本:** 2.0  
> **更新日期:** 2026-03-18  
> **作者:** 特征工程专家组  
> **目标:** 构建深度用户画像，提升匹配精度至90%+

---

## 目录

1. [概述](#概述)
2. [特征工程架构](#特征工程架构)
3. [特征类型详解](#特征类型详解)
   - 3.1 [问卷答案深度挖掘](#31-问卷答案深度挖掘)
   - 3.2 [行为特征提取](#32-行为特征提取)
   - 3.3 [交叉特征设计](#33-交叉特征设计)
   - 3.4 [隐含特征推断](#34-隐含特征推断)
4. [特征重要性分析](#特征重要性分析)
5. [伪代码实现](#伪代码实现)
6. [异常检测规则](#异常检测规则)
7. [实施路线图](#实施路线图)

---

## 概述

### 问题定义

现有系统的特征提取存在以下问题：

1. **特征稀疏性**：仅使用单一答案，未挖掘答案组合模式
2. **行为信息缺失**：忽略答题时间、修改频率等行为特征
3. **交叉特征不足**：特征间关联未充分利用
4. **深层特质缺失**：无法识别矛盾答案、认知失调等隐含信息

### 优化目标

- **召回率提升**：从当前75%提升至90%+
- **特征维度**：从50维扩展至200+维
- **特征质量**：降低噪音，提高区分度
- **实时性**：特征提取延迟<100ms

---

## 特征工程架构

```
┌─────────────────────────────────────────────────────────────┐
│                      原始数据层                              │
├─────────────────────────────────────────────────────────────┤
│  问卷答案  │  答题行为日志  │  用户交互记录  │  时间戳数据  │
└─────┬──────┴───────┬───────┴────────┬───────┴──────┬───────┘
      │              │                │              │
      ▼              ▼                ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                     特征提取层                               │
├─────────────────────────────────────────────────────────────┤
│  答案特征  │  行为特征  │  交叉特征  │  隐含特征  │  时序特征│
│  (80维)   │  (40维)   │  (50维)   │  (30维)   │  (20维)  │
└─────┬──────┴─────┬─────┴─────┬──────┴─────┬──────┴─────┬───┘
      │            │           │            │            │
      ▼            ▼           ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                   特征融合层                                 │
├─────────────────────────────────────────────────────────────┤
│  特征标准化  │  特征选择  │  降维处理  │  异常检测  │  质量评分│
└─────┬──────────┴─────┬──────┴─────┬──────┴─────┬──────┴─────┘
      │                │            │            │
      ▼                ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                   特征输出层                                 │
├─────────────────────────────────────────────────────────────┤
│    用户画像向量 (220维)    │    匹配度预测  │   异常标记    │
└─────────────────────────────────────────────────────────────┘
```

---

## 特征类型详解

### 3.1 问卷答案深度挖掘

#### 3.1.1 答案组合模式分析

**理论基础：** 心理学研究表明，人格特质是跨情境一致性的行为模式，需要通过多题交叉验证。

##### A. 大五人格维度提取（15维）

使用标准化量表（BFI-44或NEO-PI-R简化版）：

| 维度 | 题目数 | 关键特征 | 可能组合模式 |
|------|--------|----------|--------------|
| **开放性 (O)** | 8-10 | 想象力、审美、好奇心 | O高+A高：创新型人才<br>O高+A低：艺术家型<br>O低+C高：实务型 |
| **尽责性 (C)** | 8-10 | 自律、有序、目标导向 | C高+N高：焦虑完美主义<br>C高+N低：稳定高效型<br>C低+N高：混乱型 |
| **外向性 (E)** | 8-10 | 社交性、活跃度、自信 | E高+A高：魅力领袖型<br>E高+A低：竞争型<br>E低+A高：温和支持型 |
| **宜人性 (A)** | 8-10 | 信任、利他、合作 | A高+N高：敏感关怀型<br>A高+N低：稳定支持型<br>A低+E高：支配型 |
| **神经质 (N)** | 8-10 | 情绪稳定性、焦虑 | N高+C高：内化压力型<br>N高+C低：情绪失控型<br>N低+C高：稳定高效型 |

##### B. 价值观维度（20维）

基于Schwartz价值观理论：

```
价值观维度 = {
  自我导向: [独立思考, 自主决策, 自由探索],
  刺激追求: [冒险精神, 新奇体验, 生活激情],
  享乐主义: [即时满足, 享乐优先, 快乐追求],
  成就导向: [目标达成, 竞争成功, 能力认可],
  权力导向: [社会地位, 资源控制, 影响他人],
  安全导向: [稳定需求, 风险规避, 秩序需求],
  从众导向: [社会规范, 传统遵循, 归属需求],
  传统导向: [文化传承, 家庭价值, 宗教信仰],
  慈善导向: [利他主义, 社会贡献, 帮助他人],
  普遍主义: [公平正义, 环境保护, 世界和平]
}
```

##### C. 恋爱观维度（15维）

```
恋爱观维度 = {
  依恋类型: {
    安全型: "信任他人, 安心亲密",
    焦虑型: "渴望亲密, 担心被弃",
    回避型: "保持距离, 独立优先",
    恐惧型: "渴望亲密但害怕受伤"
  },
  
  亲密需求: [高度亲密, 适度亲密, 低度亲密],
  
  承诺意愿: {
    高承诺: "长期关系优先, 愿意牺牲",
    中承诺: "平衡独立与亲密",
    低承诺: "自由优先, 避免束缚"
  },
  
  沟通风格: {
    直接型: "坦诚表达, 及时沟通",
    间接型: "含蓄表达, 等待理解",
    回避型: "逃避冲突, 沉默应对"
  },
  
  冲突处理: {
    合作型: "寻求双赢, 深度沟通",
    妥协型: "各退一步, 维持和谐",
    竞争型: "坚持己见, 赢得争论",
    退让型: "放弃己见, 维护关系",
    回避型: "逃避冲突, 拖延处理"
  }
}
```

#### 3.1.2 矛盾答案检测

##### A. 矛盾类型分类

| 矛盾类型 | 定义 | 检测方法 | 可信度惩罚 |
|---------|------|----------|-----------|
| **自我认知矛盾** | 自评与行为选择不一致 | 比较自评题与情境题答案 | -0.15 |
| **价值观矛盾** | 不同题目反映相反价值观 | 价值观维度内部一致性检验 | -0.20 |
| **逻辑矛盾** | 答案组合在逻辑上不可能 | 业务规则验证 | -0.30 |
| **社会期许矛盾** | 过度符合社会期望 | 社会期许量表交叉验证 | -0.10 |

##### B. 具体检测规则

```javascript
// 矛盾答案检测示例
const CONTRADICTION_RULES = [
  {
    type: "自我认知矛盾",
    conditions: {
      self_claim: "外向型性格",
      behavior_pattern: [
        "周末通常独自在家",
        "大型聚会感到疲惫",
        "不主动发起社交"
      ],
      contradiction_threshold: 0.6  // 60%的行为模式不符
    },
    impact: "降低外向性得分权重，标记为'可能误解自己'"
  },
  
  {
    type: "价值观矛盾",
    conditions: {
      stated_value: "钱不重要，追求精神富足",
      actual_choices: {
        "消费偏好": "高档品牌",
        "择偶标准": "经济条件优先",
        "生活目标": "财务自由"
      },
      contradiction_score: 0.75
    },
    impact: "标记'认知失调'，可能存在自我欺骗"
  },
  
  {
    type: "逻辑矛盾",
    conditions: {
      relationship_status: "从未恋爱",
      answers: {
        "理想的恋爱经历": "丰富的经验",
        "处理感情问题": "非常擅长"
      }
    },
    impact: "标记为'不诚实答题'，整体可信度降低"
  }
];
```

#### 3.1.3 潜在特征提取（因子分析）

##### A. 因子分析方法

使用探索性因子分析(EFA)和验证性因子分析(CFA)：

```
步骤1: 数据准备
- 收集至少10,000份完整问卷
- 标准化处理（z-score）
- 缺失值插补（多重插补法）

步骤2: EFA（探索性因子分析）
- Kaiser-Meyer-Olkin检验（KMO > 0.7）
- Bartlett球形检验（p < 0.001）
- 提取方法：主轴因子法
- 旋转方法：斜交旋转（Promax）

步骤3: 因子数量确定
- 特征值>1准则
- 碎石检验（Scree Test）
- 平行分析（Parallel Analysis）
- 解释方差比例>60%

步骤4: CFA（验证性因子分析）
- 拟合指标：CFI>0.95, TLI>0.95, RMSEA<0.06
- 因子载荷>0.5
- 组合信度>0.7
```

##### B. 已识别的潜在因子

基于心理学研究和前期数据分析，预期识别以下潜在因子：

| 潜在因子 | 组成题目 | 心理学含义 | 匹配价值 |
|---------|---------|-----------|---------|
| **情感深度** | 情感体验题 + 共情能力题 | 对情感的感知深度 | 高 |
| **关系成熟度** | 冲突处理 + 承诺意愿 + 自我认知 | 处理亲密关系的能力 | 极高 |
| **生活稳定性** | 日常习惯 + 风险偏好 + 财务态度 | 生活的可预测性 | 中 |
| **社交能量** | 社交频率 + 能量恢复方式 + 群体偏好 | 社交需求强度 | 高 |
| **认知灵活性** | 观点开放度 + 决策风格 + 学习态度 | 适应变化的能力 | 中 |

---

### 3.2 行为特征提取

#### 3.2.1 答题时间模式（15维）

##### A. 时间特征定义

```javascript
const TIME_FEATURES = {
  // 基础时间特征
  avg_response_time: "平均答题时间",
  median_response_time: "中位答题时间",
  response_time_std: "答题时间标准差",
  
  // 时间分布特征
  time_skewness: "时间分布偏度（快速vs缓慢）",
  time_kurtosis: "时间分布峰度（集中vs分散）",
  
  // 分题型时间
  simple_question_time: "简单题平均时间",
  complex_question_time: "复杂题平均时间",
  time_ratio: "复杂题/简单题时间比",
  
  // 时间变化趋势
  fatigue_index: "疲劳度指数（后期答题变慢程度）",
  engagement_trend: "参与度趋势（时间稳定性）",
  
  // 异常时间检测
  rapid_guess_ratio: "快速猜测比例（<2秒）",
  long_pause_ratio: "长时间停顿比例（>30秒）",
  inconsistent_time_pattern: "时间模式不一致性",
  
  // 批次时间
  session_duration: "总答题时长",
  break_count: "中断次数"
};
```

##### B. 时间模式解读

| 时间模式 | 特征表现 | 心理学解释 | 匹配建议 |
|---------|---------|-----------|---------|
| **深思熟虑型** | 时间>均值+1σ，分布均匀 | 认真思考，真实性高 | 可信度高，正常匹配 |
| **快速直觉型** | 时间<均值-1σ，分布均匀 | 直觉决策，可能准确 | 验证一致性后匹配 |
| **前紧后松型** | 前半部分快，后半部分慢 | 疲劳或兴趣下降 | 考虑给予休息提醒 |
| **波动型** | 时间方差大，无规律 | 注意力不集中 | 可信度降低，建议重做 |
| **卡顿型** | 个别题目时间异常长 | 触及敏感话题或困惑 | 标记敏感题，重点关注 |

#### 3.2.2 修改答案模式（10维）

##### A. 修改特征定义

```javascript
const MODIFICATION_FEATURES = {
  // 基础修改特征
  total_modifications: "总修改次数",
  modification_rate: "修改率（修改次数/总题数）",
  
  // 修改方向
  scale_direction: "量表题修改方向（数值增大/减小）",
  choice_direction: "选择题修改方向（选项变化程度）",
  
  // 修改时机
  immediate_modification: "即时修改（答题后立即改）",
  review_modification: "复查修改（提交前检查时改）",
  
  // 修改模式
  oscillation_count: "摇摆次数（A→B→A）",
  modification_depth: "修改深度（选项距离）",
  
  // 修改内容
  key_question_modification: "关键题修改次数",
  value_question_modification: "价值观题修改次数"
};
```

##### B. 修改模式解读

| 修改模式 | 特征表现 | 心理学解释 | 数据处理 |
|---------|---------|-----------|---------|
| **犹豫型** | 修改率高，多次摇摆 | 不确定性强，可能不够了解自己 | 降低确定性特征权重 |
| **澄清型** | 即时修改，方向明确 | 思考后纠正误解 | 使用最终答案 |
| **印象管理型** | 复查时修改关键题 | 可能在美化答案 | 比较初答和终答差异 |
| **稳定型** | 几乎不修改 | 自我认知清晰或随意作答 | 结合其他特征判断 |

#### 3.2.3 跳题模式（8维）

##### A. 跳题特征定义

```javascript
const SKIP_FEATURES = {
  // 基础跳题特征
  skip_count: "跳过题目总数",
  skip_rate: "跳题率",
  
  // 跳题类型
  required_skip_count: "必答题跳过次数",
  optional_skip_count: "选答题跳过次数",
  
  // 跳题位置
  early_skip_ratio: "前期跳题比例",
  late_skip_ratio: "后期跳题比例",
  
  // 跳题内容
  sensitive_skip_count: "敏感话题跳过次数",
  difficult_skip_count: "困难题目跳过次数",
  
  // 跳题模式
  consecutive_skip: "连续跳题次数"
};
```

##### B. 跳题模式解读

| 跳题模式 | 特征表现 | 心理学解释 | 后续处理 |
|---------|---------|-----------|---------|
| **回避型** | 敏感题跳过率高 | 可能有隐私顾虑 | 温和引导，允许跳过 |
| **随意型** | 随机跳题，无规律 | 参与度低，可能不认真 | 可信度降低 |
| **疲劳型** | 后期跳题增多 | 注意力耗尽 | 建议分批完成 |
| **策略型** | 只跳非必答题 | 合理使用权限 | 正常处理 |

#### 3.2.4 极端回答倾向（7维）

##### A. 极端回答特征

```javascript
const EXTREME_RESPONSE_FEATURES = {
  // 极端选择比例
  extreme_option_rate: "选择极端选项比例（1或5）",
  middle_option_rate: "选择中间选项比例（3）",
  
  // 极端模式
  extreme_consistency: "极端选择的一致性",
  extreme_distribution: "极端选择分布（偏向正向/负向）",
  
  // 反向题表现
  reverse_question_accuracy: "反向题回答准确性",
  response_style: "回答风格（极端/温和）",
  
  // 极端倾向检测
  ers_score: "极端回答风格分数（ERS）"
};
```

##### B. 极端倾向解读

| 极端倾向 | 特征表现 | 可能原因 | 处理建议 |
|---------|---------|---------|---------|
| **真实极端型** | 特定领域极端，其他适中 | 有明确立场 | 正常处理，保留真实表达 |
| **一贯极端型** | 所有题目都极端 | 激进人格或快速作答 | 检查答题时间辅助判断 |
| **中立倾向型** | 避免极端选项 | 回避冲突或不确定 | 可能掩盖真实想法 |
| **随机极端型** | 极端选择无规律 | 随意作答 | 可信度极低 |

---

### 3.3 交叉特征设计

#### 3.3.1 价值观×性格交叉特征（20维）

##### A. 核心交叉矩阵

```
价值观维度 × 大五人格维度 = 交叉特征

示例：
传统价值观(高) × 开放性(低) = 传统稳重型
传统价值观(低) × 开放性(高) = 现代创新型
传统价值观(高) × 开放性(高) = 文化融合型
传统价值观(低) × 开放性(低) = 现代务实型

每种组合都有独特的匹配特征：
- 传统稳重型：适合同样重视传统、稳定的伴侣
- 现代创新型：适合开放、追求新奇体验的伴侣
- 文化融合型：适合能够平衡传统与现代的伴侣
- 现代务实型：适合务实、目标导向的伴侣
```

##### B. 详细交叉特征表

| 交叉特征 | 计算方法 | 匹配含义 | 权重 |
|---------|---------|---------|------|
| **事业心×尽责性** | 成就导向×C维度得分 | 工作-生活平衡预测 | 0.15 |
| **家庭观×宜人性** | 家庭价值×A维度得分 | 家庭关系和谐度 | 0.18 |
| **冒险精神×外向性** | 刺激追求×E维度得分 | 生活方式兼容性 | 0.12 |
| **金钱观×尽责性** | 物质态度×C维度得分 | 财务管理匹配度 | 0.14 |
| **社交需求×外向性** | 社交价值×E维度得分 | 社交生活匹配度 | 0.16 |
| **情感表达×神经质** | 情感价值×N维度得分 | 情感沟通风格 | 0.13 |
| **自我成长×开放性** | 成长导向×O维度得分 | 共同成长潜力 | 0.12 |

#### 3.3.2 恋爱观×家庭观交叉特征（15维）

##### A. 核心交叉特征

```javascript
const LOVE_FAMILY_CROSS_FEATURES = {
  // 恋爱观×家庭观交叉
  "独立依赖平衡": {
    formula: "恋爱独立需求 × 家庭依赖程度",
    meaning: "在亲密关系中的自主性",
    matching: "相似度匹配，差异过大易冲突"
  },
  
  "亲密距离偏好": {
    formula: "恋爱亲密需求 × 家庭边界意识",
    meaning: "理想的亲密距离",
    matching: "互补匹配，过度亲密vs适度空间"
  },
  
  "传统现代平衡": {
    formula: "恋爱观开放度 × 家庭观传统度",
    meaning: "价值观念融合程度",
    matching: "相似度匹配，核心观念一致"
  },
  
  "长期短期倾向": {
    formula: "恋爱承诺意愿 × 家庭规划清晰度",
    meaning: "关系时间取向",
    matching: "必须一致，核心冲突点"
  },
  
  "冲突处理一致性": {
    formula: "恋爱冲突风格 × 家庭矛盾处理",
    meaning: "冲突应对模式",
    matching: "相似或互补，避免双重标准"
  }
};
```

#### 3.3.3 情境特征（15维）

##### A. 情境差异检测

```javascript
const SITUATIONAL_FEATURES = {
  // 工作日vs周末
  "工作日周末偏好差异": {
    questions: ["工作日理想安排", "周末理想安排"],
    feature: "生活节奏一致性",
    threshold: 0.3  // 差异超过30%则标记
  },
  
  // 独处vs社交
  "独处社交偏好差异": {
    questions: ["独处时活动", "社交时活动"],
    feature: "能量来源方式",
    threshold: 0.25
  },
  
  // 压力vs放松
  "压力放松表现差异": {
    questions: ["压力时应对", "放松时状态"],
    feature: "情绪调节模式",
    threshold: 0.35
  },
  
  // 计划vs即兴
  "计划即兴偏好差异": {
    questions: ["日常计划性", "旅行安排偏好"],
    feature: "生活风格灵活性",
    threshold: 0.3
  }
};
```

##### B. 情境特征解读

| 情境差异模式 | 特征表现 | 匹配影响 | 建议处理 |
|------------|---------|---------|---------|
| **高度一致型** | 各情境行为相似 | 性格稳定，易预测 | 正常匹配 |
| **情境适应型** | 不同情境有差异 | 灵活性强，适应性好 | 匹配时考虑双方灵活性 |
| **矛盾型** | 情境间存在冲突 | 可能存在认知失调 | 进一步探索原因 |
| **极端转换型** | 情境间差异极大 | 可能情绪不稳定 | 降低可信度，建议复查 |

---

### 3.4 隐含特征推断

#### 3.4.1 认知失调检测

##### A. 认知失调类型

```javascript
const COGNITIVE_DISSONANCE_TYPES = {
  // 类型1: 自我认知失调
  "价值观行为失调": {
    detection: {
      stated_value: "声称的价值观",
      behavior_choices: "行为选择题答案",
      conflict_threshold: 0.6
    },
    example: {
      claim: "物质不重要",
      behaviors: ["择偶看重经济条件", "追求奢侈品牌", "财务自由为主要目标"],
      dissonance_score: 0.85
    },
    interpretation: "可能存在自我欺骗或社会期许偏差",
    action: "降低价值观权重，增加行为特征权重"
  },
  
  // 类型2: 理想现实失调
  "理想现实失调": {
    detection: {
      ideal_self: "理想自我描述",
      actual_choices: "现实选择题答案",
      gap_threshold: 0.7
    },
    example: {
      ideal: "理想是冒险家",
      reality: ["选择稳定工作", "回避风险决策", "偏好熟悉环境"],
      gap_score: 0.75
    },
    interpretation: "理想与现实的差距，可能导致不满足感",
    action: "识别真实需求，而非理想化自我"
  },
  
  // 类型3: 时间不一致失调
  "时间不一致失调": {
    detection: {
      past_description: "对过去的描述",
      future_plans: "未来规划",
      current_behavior: "当前行为",
      consistency_threshold: 0.5
    },
    example: {
      past: "曾经很外向",
      future: "计划更社交",
      current: "当前几乎不社交",
      inconsistency: 0.8
    },
    interpretation: "可能处于转变期或存在认知冲突",
    action: "标记为需要深入了解的用户"
  }
};
```

#### 3.4.2 隐性特质推断模型

##### A. 推断逻辑

```javascript
const IMPLICIT_TRAIT_INFERENCE = {
  // 从显性答案推断隐性特质
  "情感深度": {
    explicit_signals: [
      "情感体验题的回答深度",
      "对细节的描述丰富度",
      "共情题的准确度"
    ],
    implicit_inference: "如果显性信号一致指向高情感深度，则推断为情感丰富型",
    confidence_level: 0.8
  },
  
  "关系成熟度": {
    explicit_signals: [
      "冲突处理方式选择",
      "对伴侣缺点的接纳度",
      "自我反思深度"
    ],
    implicit_inference: "综合信号推断关系处理能力",
    confidence_level: 0.75
  },
  
  "真实社交需求": {
    explicit_signals: [
      "声称的社交偏好",
      "实际社交频率",
      "社交后的能量状态"
    ],
    cross_validation: "如果声称外向但社交后疲惫，推断为'社交表演型'",
    confidence_level: 0.7
  }
};
```

##### B. 多题交叉验证

```javascript
// 多题交叉验证示例：判断真实性格类型
function inferTruePersonality(answers) {
  const signals = {
    // 自我认知信号
    self_claim: answers["自我评价题"],
    
    // 行为模式信号
    weekend_preference: answers["周末偏好"],
    energy_recovery: answers["能量恢复方式"],
    social_initiative: answers["主动社交频率"],
    
    // 情境反应信号
    party_feeling: answers["聚会感受"],
    alone_feeling: answers["独处感受"],
    group_vs_one: answers["群体vs一对一偏好"]
  };
  
  // 交叉验证逻辑
  const validation_result = {
    consistent_count: 0,
    inconsistent_pairs: [],
    
    // 检查一致性
    check_consistency: function() {
      // 外向性验证
      if (this.self_claim === "外向") {
        if (this.weekend_preference.includes("社交")) this.consistent_count++;
        else this.inconsistent_pairs.push(["自我评价", "周末偏好"]);
        
        if (this.energy_recovery === "通过社交") this.consistent_count++;
        else this.inconsistent_pairs.push(["自我评价", "能量恢复"]);
        
        if (this.party_feeling === "精力充沛") this.consistent_count++;
        else this.inconsistent_pairs.push(["自我评价", "聚会感受"]);
      }
      
      return {
        consistency_ratio: this.consistent_count / 3,
        inconsistencies: this.inconsistent_pairs,
        recommendation: this.consistent_count >= 2 ? 
          "使用自我评价" : 
          "使用行为模式推断真实性格"
      };
    }
  };
  
  return validation_result.check_consistency();
}
```

---

## 特征重要性分析

### 4.1 基于心理学研究的特征重要性

#### 4.1.1 核心匹配特征权重表

| 特征类别 | 特征名称 | 心理学依据 | 匹配重要性 | 权重 |
|---------|---------|-----------|-----------|------|
| **人格特质** | 大五人格匹配度 | 人格心理学，长期关系预测因子 | 极高 | 0.20 |
| **价值观** | 核心价值观一致性 | 社会心理学，关系满意度关键 | 极高 | 0.18 |
| **依恋类型** | 依恋风格兼容性 | 依恋理论，亲密关系质量预测 | 极高 | 0.15 |
| **沟通风格** | 冲突处理模式 | 关系心理学，关系稳定性 | 高 | 0.12 |
| **生活目标** | 人生方向一致性 | 动机心理学，长期匹配度 | 高 | 0.10 |
| **社交需求** | 社交能量匹配 | 性格心理学，日常和谐度 | 中 | 0.08 |
| **情感需求** | 亲密需求匹配 | 亲密关系研究，关系满足感 | 中 | 0.07 |
| **家庭观念** | 家庭观一致性 | 家庭心理学，长期冲突预测 | 中 | 0.06 |
| **金钱观** | 财务态度匹配 | 经济心理学，日常冲突点 | 中 | 0.04 |
| **习惯偏好** | 生活习惯兼容性 | 行为心理学，日常和谐度 | 低 | 0.03 |

#### 4.1.2 动态权重调整机制

```javascript
class DynamicFeatureWeighting {
  constructor() {
    this.base_weights = {
      personality: 0.20,
      values: 0.18,
      attachment: 0.15,
      communication: 0.12,
      life_goals: 0.10,
      social_needs: 0.08,
      emotional_needs: 0.07,
      family_views: 0.06,
      money_views: 0.04,
      habits: 0.03
    };
    
    this.adjustment_factors = {
      data_quality: 1.0,      // 数据质量因子
      user_feedback: 1.0,     // 用户反馈因子
      relationship_stage: 1.0, // 关系阶段因子
      cultural_context: 1.0    // 文化背景因子
    };
  }
  
  // 根据数据质量调整权重
  adjustByDataQuality(user_data) {
    const quality_score = this.calculateDataQuality(user_data);
    
    // 数据质量低时，降低复杂特征权重
    if (quality_score < 0.6) {
      this.adjustment_factors.data_quality = 0.8;
      // 提高基础特征权重
      this.base_weights.personality *= 1.2;
      this.base_weights.habits *= 1.5;
    }
    
    return this.getAdjustedWeights();
  }
  
  // 根据用户反馈调整权重
  adjustByUserFeedback(feedback_data) {
    // 分析匹配成功案例
    const success_patterns = this.analyzeSuccessfulMatches(feedback_data);
    
    // 成功匹配中重要的特征，提高其权重
    for (let feature in success_patterns.importance) {
      this.base_weights[feature] *= (1 + success_patterns.importance[feature] * 0.1);
    }
    
    // 归一化权重
    this.normalizeWeights();
    
    return this.getAdjustedWeights();
  }
  
  // 根据关系阶段调整权重
  adjustByRelationshipStage(stage) {
    // 短期关系：外貌、趣味相投更重要
    if (stage === "short_term") {
      this.base_weights.habits *= 1.5;
      this.base_weights.life_goals *= 0.5;
    }
    // 长期关系：价值观、人生目标更重要
    else if (stage === "long_term") {
      this.base_weights.values *= 1.3;
      this.base_weights.life_goals *= 1.5;
      this.base_weights.habits *= 0.8;
    }
    // 婚姻导向：家庭观、金钱观更重要
    else if (stage === "marriage") {
      this.base_weights.family_views *= 2.0;
      this.base_weights.money_views *= 1.5;
      this.base_weights.values *= 1.2;
    }
    
    this.normalizeWeights();
    return this.getAdjustedWeights();
  }
  
  // 计算数据质量
  calculateDataQuality(user_data) {
    const factors = {
      completeness: this.checkCompleteness(user_data),
      consistency: this.checkConsistency(user_data),
      authenticity: this.checkAuthenticity(user_data),
      depth: this.checkDepth(user_data)
    };
    
    return (
      factors.completeness * 0.3 +
      factors.consistency * 0.3 +
      factors.authenticity * 0.25 +
      factors.depth * 0.15
    );
  }
  
  // 归一化权重
  normalizeWeights() {
    const total = Object.values(this.base_weights).reduce((a, b) => a + b, 0);
    for (let feature in this.base_weights) {
      this.base_weights[feature] /= total;
    }
  }
  
  getAdjustedWeights() {
    let adjusted = {};
    for (let feature in this.base_weights) {
      adjusted[feature] = this.base_weights[feature] * 
        Object.values(this.adjustment_factors).reduce((a, b) => a * b, 1);
    }
    return adjusted;
  }
}
```

#### 4.1.3 特征重要性动态调整流程

```
┌─────────────────────────────────────────────────────────┐
│                   初始权重（基于心理学研究）               │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  数据质量评估                             │
│  - 完整性检查                                            │
│  - 一致性检查                                            │
│  - 真实性评估                                            │
│  - 深度评估                                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  用户画像构建                             │
│  - 特征提取                                              │
│  - 特征融合                                              │
│  - 权重调整                                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  匹配生成                                 │
│  - 候选筛选                                              │
│  - 匹配度计算                                            │
│  - 排序推荐                                              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  用户反馈收集                             │
│  - 匹配接受率                                            │
│  - 沟通转化率                                            │
│  - 关系持续时间                                          │
│  - 满意度评分                                            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  权重优化                                 │
│  - 分析成功案例                                          │
│  - 识别关键特征                                          │
│  - 更新权重配置                                          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      └──────────────────┐
                                         │
            ┌────────────────────────────┘
            │
            ▼
    [持续迭代优化]
```

---

## 伪代码实现

### 5.1 完整特征提取流程

```python
class AdvancedFeatureEngineering:
    """心动投递高级特征工程系统"""
    
    def __init__(self):
        self.questionnaire_extractor = QuestionnaireFeatureExtractor()
        self.behavior_extractor = BehaviorFeatureExtractor()
        self.cross_feature_generator = CrossFeatureGenerator()
        self.implicit_inference_engine = ImplicitInferenceEngine()
        self.anomaly_detector = AnomalyDetector()
        self.weight_manager = DynamicFeatureWeighting()
    
    def extract_features(self, user_data):
        """主特征提取入口"""
        
        # 1. 问卷答案深度挖掘
        questionnaire_features = self.extract_questionnaire_features(
            user_data.answers,
            user_data.question_metadata
        )
        
        # 2. 行为特征提取
        behavior_features = self.extract_behavior_features(
            user_data.response_times,
            user_data.modifications,
            user_data.skips,
            user_data.extreme_responses
        )
        
        # 3. 交叉特征生成
        cross_features = self.generate_cross_features(
            questionnaire_features,
            behavior_features
        )
        
        # 4. 隐含特征推断
        implicit_features = self.infer_implicit_traits(
            questionnaire_features,
            behavior_features,
            cross_features
        )
        
        # 5. 异常检测
        anomaly_score = self.detect_anomaly(
            questionnaire_features,
            behavior_features,
            cross_features
        )
        
        # 6. 特征融合
        all_features = self.merge_features(
            questionnaire_features,
            behavior_features,
            cross_features,
            implicit_features
        )
        
        # 7. 特征质量评估
        quality_score = self.evaluate_feature_quality(all_features)
        
        # 8. 动态权重调整
        adjusted_weights = self.weight_manager.adjustByDataQuality(
            {'features': all_features, 'quality': quality_score}
        )
        
        return {
            'features': all_features,
            'feature_weights': adjusted_weights,
            'quality_score': quality_score,
            'anomaly_score': anomaly_score,
            'anomaly_flags': anomaly_score['flags'] if anomaly_score > 0.5 else []
        }
    
    def extract_questionnaire_features(self, answers, metadata):
        """问卷答案深度挖掘"""
        
        features = {}
        
        # 1. 大五人格提取
        features['personality'] = self.extract_big_five(answers, metadata)
        
        # 2. 价值观提取
        features['values'] = self.extract_values(answers, metadata)
        
        # 3. 恋爱观提取
        features['love_views'] = self.extract_love_views(answers, metadata)
        
        # 4. 矛盾答案检测
        features['contradictions'] = self.detect_contradictions(answers, metadata)
        
        # 5. 潜在特征提取（因子分析）
        features['latent_factors'] = self.extract_latent_factors(answers, metadata)
        
        # 6. 答案组合模式
        features['patterns'] = self.extract_answer_patterns(answers, metadata)
        
        return features
    
    def extract_big_five(self, answers, metadata):
        """大五人格维度提取"""
        
        personality = {
            'openness': 0,
            'conscientiousness': 0,
            'extraversion': 0,
            'agreeableness': 0,
            'neuroticism': 0,
            'confidence': 0,  # 置信度
            'consistency': 0  # 一致性
        }
        
        # 获取大五人格相关题目
        big_five_questions = metadata.get_questions_by_category('big_five')
        
        for dimension, questions in big_five_questions.items():
            scores = []
            reverse_scores = []
            
            for q in questions:
                answer = answers.get(q.id)
                if answer:
                    # 正向题
                    if q.direction == 'positive':
                        scores.append(answer.value)
                    # 反向题（需要反转）
                    else:
                        reverse_scores.append(6 - answer.value)  # 假设5点量表
            
            # 计算维度得分
            all_scores = scores + reverse_scores
            personality[dimension] = np.mean(all_scores) if all_scores else 3.0
            
            # 计算内部一致性（Cronbach's Alpha近似）
            if len(all_scores) > 1:
                personality['consistency'] = self.calculate_consistency(all_scores)
        
        # 计算整体置信度
        personality['confidence'] = np.mean([
            personality['consistency'],
            self.check_answer_completeness(answers, big_five_questions)
        ])
        
        return personality
    
    def detect_contradictions(self, answers, metadata):
        """矛盾答案检测"""
        
        contradictions = {
            'self_perception_contradictions': [],
            'value_contradictions': [],
            'logical_contradictions': [],
            'social_desirability_bias': 0,
            'overall_credibility': 1.0
        }
        
        # 1. 自我认知矛盾检测
        for rule in CONTRADICTION_RULES['self_perception']:
            contradiction = self.check_contradiction_rule(answers, rule)
            if contradiction:
                contradictions['self_perception_contradictions'].append(contradiction)
                contradictions['overall_credibility'] -= rule.penalty
        
        # 2. 价值观矛盾检测
        for rule in CONTRADICTION_RULES['values']:
            contradiction = self.check_contradiction_rule(answers, rule)
            if contradiction:
                contradictions['value_contradictions'].append(contradiction)
                contradictions['overall_credibility'] -= rule.penalty
        
        # 3. 逻辑矛盾检测
        for rule in CONTRADICTION_RULES['logical']:
            contradiction = self.check_contradiction_rule(answers, rule)
            if contradiction:
                contradictions['logical_contradictions'].append(contradiction)
                contradictions['overall_credibility'] -= rule.penalty
        
        # 4. 社会期许偏差检测
        contradictions['social_desirability_bias'] = self.detect_social_desirability(
            answers, 
            metadata
        )
        
        # 确保可信度在合理范围
        contradictions['overall_credibility'] = max(0.1, min(1.0, contradictions['overall_credibility']))
        
        return contradictions
    
    def extract_behavior_features(self, response_times, modifications, skips, extreme_responses):
        """行为特征提取"""
        
        features = {}
        
        # 1. 答题时间特征
        features['timing'] = self.extract_timing_features(response_times)
        
        # 2. 修改答案特征
        features['modifications'] = self.extract_modification_features(modifications)
        
        # 3. 跳题特征
        features['skips'] = self.extract_skip_features(skips)
        
        # 4. 极端回答特征
        features['extreme_responses'] = self.extract_extreme_features(extreme_responses)
        
        # 5. 综合行为模式
        features['behavior_pattern'] = self.classify_behavior_pattern(features)
        
        return features
    
    def extract_timing_features(self, response_times):
        """答题时间特征提取"""
        
        times = np.array([t.duration for t in response_times])
        
        features = {
            # 基础统计
            'mean': np.mean(times),
            'median': np.median(times),
            'std': np.std(times),
            
            # 分布特征
            'skewness': self.calculate_skewness(times),
            'kurtosis': self.calculate_kurtosis(times),
            
            # 分题型特征
            'simple_question_mean': np.mean([t.duration for t in response_times if t.complexity == 'simple']),
            'complex_question_mean': np.mean([t.duration for t in response_times if t.complexity == 'complex']),
            
            # 时间趋势
            'fatigue_index': self.calculate_fatigue_index(times),
            'engagement_trend': self.calculate_engagement_trend(times),
            
            # 异常检测
            'rapid_guess_ratio': np.sum(times < 2) / len(times),
            'long_pause_ratio': np.sum(times > 30) / len(times),
            
            # 模式识别
            'time_pattern': self.classify_time_pattern(times)
        }
        
        # 计算复杂题/简单题时间比
        if features['simple_question_mean'] > 0:
            features['time_ratio'] = features['complex_question_mean'] / features['simple_question_mean']
        
        return features
    
    def generate_cross_features(self, questionnaire_features, behavior_features):
        """交叉特征生成"""
        
        cross_features = {}
        
        # 1. 价值观×性格交叉
        cross_features['value_personality'] = self.cross_value_personality(
            questionnaire_features['values'],
            questionnaire_features['personality']
        )
        
        # 2. 恋爱观×家庭观交叉
        cross_features['love_family'] = self.cross_love_family(
            questionnaire_features['love_views'],
            questionnaire_features.get('family_views', {})
        )
        
        # 3. 情境特征
        cross_features['situational'] = self.extract_situational_features(
            questionnaire_features['patterns']
        )
        
        # 4. 行为-答案一致性
        cross_features['behavior_answer_consistency'] = self.calculate_behavior_answer_consistency(
            questionnaire_features,
            behavior_features
        )
        
        return cross_features
    
    def infer_implicit_traits(self, questionnaire_features, behavior_features, cross_features):
        """隐含特征推断"""
        
        implicit_features = {
            'cognitive_dissonance': {},
            'inferred_traits': {},
            'hidden_needs': {},
            'authenticity_score': 0
        }
        
        # 1. 认知失调检测
        implicit_features['cognitive_dissonance'] = self.detect_cognitive_dissonance(
            questionnaire_features,
            behavior_features,
            cross_features
        )
        
        # 2. 隐性特质推断
        implicit_features['inferred_traits'] = self.infer_traits_from_signals(
            questionnaire_features,
            behavior_features
        )
        
        # 3. 隐藏需求识别
        implicit_features['hidden_needs'] = self.identify_hidden_needs(
            questionnaire_features,
            cross_features
        )
        
        # 4. 真实性评分
        implicit_features['authenticity_score'] = self.calculate_authenticity(
            questionnaire_features,
            behavior_features,
            cross_features,
            implicit_features['cognitive_dissonance']
        )
        
        return implicit_features
    
    def detect_anomaly(self, questionnaire_features, behavior_features, cross_features):
        """异常检测"""
        
        anomaly_detector = self.anomaly_detector
        
        # 多维度异常检测
        anomaly_signals = {
            'response_pattern_anomaly': anomaly_detector.check_response_pattern(
                behavior_features['timing']
            ),
            'consistency_anomaly': anomaly_detector.check_consistency(
                questionnaire_features['contradictions']
            ),
            'behavior_anomaly': anomaly_detector.check_behavior(
                behavior_features
            ),
            'quality_anomaly': anomaly_detector.check_quality(
                questionnaire_features,
                behavior_features
            )
        }
        
        # 综合异常评分
        anomaly_score = self.calculate_anomaly_score(anomaly_signals)
        
        # 生成异常标记
        flags = self.generate_anomaly_flags(anomaly_signals)
        
        return {
            'score': anomaly_score,
            'flags': flags,
            'details': anomaly_signals
        }
```

### 5.2 特征提取辅助函数

```python
class FeatureExtractionHelpers:
    """特征提取辅助函数"""
    
    @staticmethod
    def calculate_consistency(scores):
        """计算内部一致性（Cronbach's Alpha简化版）"""
        if len(scores) < 2:
            return 0.5
        
        n = len(scores)
        variance_total = np.var(scores, ddof=1)
        variance_items = np.mean([np.var([s], ddof=1) for s in scores])
        
        if variance_total == 0:
            return 1.0
        
        alpha = (n / (n - 1)) * (1 - variance_items / variance_total)
        return max(0, min(1, alpha))
    
    @staticmethod
    def calculate_skewness(data):
        """计算偏度"""
        n = len(data)
        if n < 3:
            return 0
        
        mean = np.mean(data)
        std = np.std(data)
        
        if std == 0:
            return 0
        
        skew = np.sum((data - mean) ** 3) / (n * std ** 3)
        return skew
    
    @staticmethod
    def calculate_kurtosis(data):
        """计算峰度"""
        n = len(data)
        if n < 4:
            return 0
        
        mean = np.mean(data)
        std = np.std(data)
        
        if std == 0:
            return 0
        
        kurt = np.sum((data - mean) ** 4) / (n * std ** 4) - 3
        return kurt
    
    @staticmethod
    def calculate_fatigue_index(times):
        """计算疲劳度指数"""
        n = len(times)
        if n < 10:
            return 0
        
        # 将答题时间分成前、中、后三段
        third = n // 3
        early_mean = np.mean(times[:third])
        late_mean = np.mean(times[2*third:])
        
        # 疲劳指数 = 后期平均时间 / 前期平均时间 - 1
        if early_mean > 0:
            fatigue = late_mean / early_mean - 1
            return max(0, min(1, fatigue))
        return 0
    
    @staticmethod
    def classify_time_pattern(times):
        """分类时间模式"""
        features = {
            'mean': np.mean(times),
            'std': np.std(times),
            'skewness': FeatureExtractionHelpers.calculate_skewness(times),
            'fatigue': FeatureExtractionHelpers.calculate_fatigue_index(times)
        }
        
        # 分类逻辑
        if features['std'] < features['mean'] * 0.3:
            # 时间分布均匀
            if features['mean'] > np.median(times) * 1.5:
                return '深思熟虑型'
            else:
                return '快速直觉型'
        else:
            # 时间分布不均匀
            if features['fatigue'] > 0.3:
                return '前紧后松型'
            elif features['skewness'] > 1:
                return '卡顿型'
            else:
                return '波动型'
    
    @staticmethod
    def cross_value_personality(values, personality):
        """价值观×性格交叉特征"""
        
        cross_features = {}
        
        # 传统价值观 × 开放性
        if 'tradition' in values and 'openness' in personality:
            tradition = values['tradition']
            openness = personality['openness']
            
            # 分类用户类型
            if tradition > 3.5 and openness < 2.5:
                cross_features['type'] = '传统稳重型'
                cross_features['matching_preference'] = '重视传统、稳定'
            elif tradition < 2.5 and openness > 3.5:
                cross_features['type'] = '现代创新型'
                cross_features['matching_preference'] = '开放、追求新奇'
            elif tradition > 3.5 and openness > 3.5:
                cross_features['type'] = '文化融合型'
                cross_features['matching_preference'] = '平衡传统与现代'
            else:
                cross_features['type'] = '现代务实型'
                cross_features['matching_preference'] = '务实、目标导向'
            
            # 计算交叉分数
            cross_features['cross_score'] = {
                'tradition_openness': tradition * openness / 25,  # 归一化到[0,1]
                'stability_index': (5 - abs(tradition - openness)) / 5
            }
        
        # 成就导向 × 尽责性
        if 'achievement' in values and 'conscientiousness' in personality:
            achievement = values['achievement']
            conscientiousness = personality['conscientiousness']
            
            cross_features['career_drive'] = {
                'score': achievement * conscientiousness / 25,
                'type': '高事业心' if achievement * conscientiousness > 12 else '平衡型'
            }
        
        return cross_features
```

### 5.3 异常检测实现

```python
class AnomalyDetector:
    """异常检测系统"""
    
    def __init__(self):
        self.thresholds = ANOMALY_THRESHOLDS
    
    def check_response_pattern(self, timing_features):
        """检查回答模式异常"""
        
        signals = {}
        
        # 1. 快速猜测检测
        if timing_features['rapid_guess_ratio'] > self.thresholds['rapid_guess']:
            signals['rapid_guessing'] = {
                'detected': True,
                'ratio': timing_features['rapid_guess_ratio'],
                'threshold': self.thresholds['rapid_guess'],
                'severity': 'high' if timing_features['rapid_guess_ratio'] > 0.3 else 'medium'
            }
        
        # 2. 时间模式异常
        if timing_features['time_pattern'] == '波动型':
            signals['inconsistent_timing'] = {
                'detected': True,
                'pattern': timing_features['time_pattern'],
                'severity': 'medium'
            }
        
        # 3. 疲劳度异常
        if timing_features['fatigue_index'] > self.thresholds['fatigue']:
            signals['excessive_fatigue'] = {
                'detected': True,
                'index': timing_features['fatigue_index'],
                'threshold': self.thresholds['fatigue'],
                'severity': 'low'
            }
        
        return signals
    
    def check_consistency(self, contradictions):
        """检查一致性异常"""
        
        signals = {}
        
        # 1. 矛盾答案过多
        total_contradictions = (
            len(contradictions['self_perception_contradictions']) +
            len(contradictions['value_contradictions']) +
            len(contradictions['logical_contradictions'])
        )
        
        if total_contradictions > self.thresholds['contradiction_count']:
            signals['excessive_contradictions'] = {
                'detected': True,
                'count': total_contradictions,
                'threshold': self.thresholds['contradiction_count'],
                'severity': 'high'
            }
        
        # 2. 可信度过低
        if contradictions['overall_credibility'] < self.thresholds['credibility']:
            signals['low_credibility'] = {
                'detected': True,
                'score': contradictions['overall_credibility'],
                'threshold': self.thresholds['credibility'],
                'severity': 'high'
            }
        
        # 3. 社会期许偏差
        if contradictions['social_desirability_bias'] > self.thresholds['social_desirability']:
            signals['social_desirability_bias'] = {
                'detected': True,
                'bias': contradictions['social_desirability_bias'],
                'threshold': self.thresholds['social_desirability'],
                'severity': 'medium'
            }
        
        return signals
    
    def check_behavior(self, behavior_features):
        """检查行为异常"""
        
        signals = {}
        
        # 1. 修改模式异常
        mod_features = behavior_features['modifications']
        if mod_features['modification_rate'] > self.thresholds['modification_rate']:
            signals['excessive_modification'] = {
                'detected': True,
                'rate': mod_features['modification_rate'],
                'threshold': self.thresholds['modification_rate'],
                'severity': 'medium'
            }
        
        # 2. 跳题模式异常
        skip_features = behavior_features['skips']
        if skip_features['skip_rate'] > self.thresholds['skip_rate']:
            signals['excessive_skipping'] = {
                'detected': True,
                'rate': skip_features['skip_rate'],
                'threshold': self.thresholds['skip_rate'],
                'severity': 'high' if skip_features['skip_rate'] > 0.2 else 'medium'
            }
        
        # 3. 极端回答异常
        extreme_features = behavior_features['extreme_responses']
        if extreme_features['extreme_option_rate'] > self.thresholds['extreme_rate']:
            signals['extreme_response_pattern'] = {
                'detected': True,
                'rate': extreme_features['extreme_option_rate'],
                'threshold': self.thresholds['extreme_rate'],
                'severity': 'medium'
            }
        
        return signals
    
    def check_quality(self, questionnaire_features, behavior_features):
        """检查整体质量异常"""
        
        signals = {}
        
        # 1. 完整性检查
        completeness = self.calculate_completeness(questionnaire_features)
        if completeness < self.thresholds['completeness']:
            signals['incomplete_data'] = {
                'detected': True,
                'completeness': completeness,
                'threshold': self.thresholds['completeness'],
                'severity': 'high' if completeness < 0.5 else 'medium'
            }
        
        # 2. 深度检查
        depth = self.calculate_response_depth(questionnaire_features)
        if depth < self.thresholds['depth']:
            signals['shallow_responses'] = {
                'detected': True,
                'depth': depth,
                'threshold': self.thresholds['depth'],
                'severity': 'low'
            }
        
        return signals
    
    def calculate_anomaly_score(self, signals):
        """计算综合异常评分"""
        
        severity_weights = {
            'high': 1.0,
            'medium': 0.5,
            'low': 0.2
        }
        
        total_score = 0
        max_score = 0
        
        for category, category_signals in signals.items():
            for signal_name, signal_data in category_signals.items():
                if signal_data.get('detected', False):
                    severity = signal_data.get('severity', 'medium')
                    total_score += severity_weights[severity]
                max_score += 1.0  # 每个信号最大贡献1.0
        
        # 归一化到[0,1]
        return min(1.0, total_score / max(max_score, 1))
    
    def generate_anomaly_flags(self, signals):
        """生成异常标记"""
        
        flags = []
        
        for category, category_signals in signals.items():
            for signal_name, signal_data in category_signals.items():
                if signal_data.get('detected', False):
                    flag = {
                        'type': signal_name,
                        'category': category,
                        'severity': signal_data.get('severity', 'medium'),
                        'details': signal_data,
                        'recommendation': self.get_recommendation(signal_name)
                    }
                    flags.append(flag)
        
        return flags
    
    def get_recommendation(self, signal_type):
        """获取异常处理建议"""
        
        recommendations = {
            'rapid_guessing': '建议重新作答或人工审核',
            'inconsistent_timing': '可能注意力不集中，建议分批完成',
            'excessive_contradictions': '可能不诚实或自我认知不清，建议人工核实',
            'low_credibility': '可信度过低，建议重新评估或排除',
            'social_desirability_bias': '存在美化倾向，降低自我报告特征权重',
            'excessive_modification': '犹豫不决，降低确定性特征权重',
            'excessive_skipping': '参与度低，建议提供激励机制',
            'extreme_response_pattern': '回答风格极端，验证是否随意作答',
            'incomplete_data': '数据不完整，建议补充问卷',
            'shallow_responses': '回答深度不足，降低推断特征权重'
        }
        
        return recommendations.get(signal_type, '需要进一步审核')
```

---

## 异常检测规则

### 6.1 异常阈值配置

```javascript
const ANOMALY_THRESHOLDS = {
  // 时间相关阈值
  rapid_guess: 0.15,          // 快速猜测比例阈值（15%）
  fatigue: 0.5,               // 疲劳指数阈值
  
  // 一致性相关阈值
  contradiction_count: 3,     // 矛盾答案数量阈值
  credibility: 0.6,           // 可信度阈值
  social_desirability: 0.7,   // 社会期许偏差阈值
  
  // 行为相关阈值
  modification_rate: 0.2,     // 修改率阈值（20%）
  skip_rate: 0.1,             // 跳题率阈值（10%）
  extreme_rate: 0.4,          // 极端回答比例阈值（40%）
  
  // 质量相关阈值
  completeness: 0.8,          // 完整性阈值（80%）
  depth: 0.5                  // 深度阈值
};
```

### 6.2 不认真答题用户识别规则

```python
class InsincereResponseDetector:
    """不认真答题检测器"""
    
    def __init__(self):
        self.rules = self.load_detection_rules()
        self.classifier = self.train_classifier()
    
    def load_detection_rules(self):
        """加载检测规则"""
        
        return {
            # 规则1: 快速随意作答
            'rapid_random': {
                'conditions': {
                    'avg_response_time': ('<', 3),  # 平均答题时间<3秒
                    'rapid_guess_ratio': ('>', 0.3),  # 快速猜测>30%
                    'time_pattern': ('==', '快速直觉型')
                },
                'confidence': 0.9,
                'action': '建议重新作答'
            },
            
            # 规则2: 一致性模式（如：全部选C）
            'straightlining': {
                'conditions': {
                    'same_option_ratio': ('>', 0.6),  # 相同选项比例>60%
                    'pattern_detected': ('==', True)
                },
                'confidence': 0.95,
                'action': '标记为无效问卷'
            },
            
            # 规则3: 矛盾答案过多
            'contradictory': {
                'conditions': {
                    'contradiction_count': ('>', 5),
                    'credibility': ('<', 0.5)
                },
                'confidence': 0.85,
                'action': '人工审核或重新作答'
            },
            
            # 规则4: 中间选项偏好
            'middle_bias': {
                'conditions': {
                    'middle_option_rate': ('>', 0.5),  # 中间选项>50%
                    'extreme_option_rate': ('<', 0.1)
                },
                'confidence': 0.7,
                'action': '降低特征权重，提示认真作答'
            },
            
            # 规则5: 极端选项滥用
            'extreme_abuse': {
                'conditions': {
                    'extreme_option_rate': ('>', 0.6),
                    'ers_score': ('>', 0.7),
                    'consistency': ('<', 0.4)
                },
                'confidence': 0.8,
                'action': '验证是否随意作答'
            },
            
            # 规则6: 社会期许过度
            'social_desirability_overdose': {
                'conditions': {
                    'social_desirability_score': ('>', 0.85),
                    'negative_traits_denied': ('>', 0.9)  # 否定负面特质>90%
                },
                'confidence': 0.75,
                'action': '使用行为特征替代自我报告'
            },
            
            # 规则7: 跳题过多
            'excessive_skipping': {
                'conditions': {
                    'skip_rate': ('>', 0.25),
                    'required_skip_count': ('>', 3)
                },
                'confidence': 0.8,
                'action': '提示完成所有题目或标记为不完整'
            },
            
            # 规则8: 注意力检测失败
            'attention_check_failed': {
                'conditions': {
                    'attention_questions_failed': ('>', 0)  # 注意力检测题失败
                },
                'confidence': 0.95,
                'action': '标记为无效问卷'
            }
        }
    
    def detect(self, user_data):
        """执行异常检测"""
        
        results = {
            'is_insincere': False,
            'detected_rules': [],
            'confidence': 0,
            'overall_score': 0
        }
        
        for rule_name, rule in self.rules.items():
            if self.check_rule(user_data, rule['conditions']):
                results['detected_rules'].append({
                    'rule': rule_name,
                    'confidence': rule['confidence'],
                    'action': rule['action']
                })
        
        # 综合判断
        if results['detected_rules']:
            # 使用最高置信度的规则
            results['confidence'] = max(
                [r['confidence'] for r in results['detected_rules']]
            )
            
            # 计算综合评分
            results['overall_score'] = self.calculate_insincerity_score(
                results['detected_rules']
            )
            
            # 判定为不认真答题
            if results['confidence'] > 0.7 or results['overall_score'] > 0.6:
                results['is_insincere'] = True
        
        return results
    
    def check_rule(self, user_data, conditions):
        """检查单个规则"""
        
        for feature, (operator, threshold) in conditions.items():
            value = self.get_feature_value(user_data, feature)
            
            if not self.compare(value, operator, threshold):
                return False
        
        return True
    
    def calculate_insincerity_score(self, detected_rules):
        """计算不认真程度评分"""
        
        # 基于检测到的规则计算综合评分
        weights = {
            'rapid_random': 0.25,
            'straightlining': 0.30,
            'contradictory': 0.20,
            'middle_bias': 0.10,
            'extreme_abuse': 0.15,
            'social_desirability_overdose': 0.10,
            'excessive_skipping': 0.15,
            'attention_check_failed': 0.35
        }
        
        total_weight = sum(
            weights.get(r['rule'], 0.1) for r in detected_rules
        )
        
        return min(1.0, total_weight)
```

### 6.3 异常处理流程

```
┌─────────────────────────────────────────────────────────┐
│                   用户提交问卷                            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              实时异常检测（<100ms）                       │
│  - 快速猜测检测                                          │
│  - 一致性检测                                            │
│  - 注意力检测题验证                                      │
└─────────────────────┬───────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
   ┌─────────────┐        ┌─────────────┐
   │  通过检测   │        │  检测异常   │
   └──────┬──────┘        └──────┬──────┘
          │                      │
          ▼                      ▼
   ┌─────────────┐        ┌─────────────────────┐
   │ 正常处理    │        │ 根据异常类型处理     │
   │ 特征提取    │        ├─────────────────────┤
   └──────┬──────┘        │ 高置信度异常：       │
          │               │ → 标记无效问卷      │
          │               │ → 提示重新作答      │
          │               ├─────────────────────┤
          │               │ 中置信度异常：       │
          │               │ → 降低特征权重      │
          │               │ → 人工审核标记      │
          │               ├─────────────────────┤
          │               │ 低置信度异常：       │
          │               │ → 记录异常信息      │
          │               │ → 正常处理但标注    │
          │               └──────────┬──────────┘
          │                          │
          └──────────┬───────────────┘
                     │
                     ▼
          ┌─────────────────────┐
          │  后续审核队列       │
          │  （异常案例人工复核）│
          └─────────────────────┘
```

---

## 实施路线图

### 7.1 分阶段实施计划

#### 第一阶段：基础特征扩展（2周）

**目标：** 将特征维度从50维扩展至100维

- [ ] 实现大五人格完整提取
- [ ] 实现价值观维度提取
- [ ] 实现基础矛盾答案检测
- [ ] 实现答题时间特征提取
- [ ] 建立特征标准化流程

**交付物：**
- 特征提取模块v1
- 特征文档v1
- 单元测试覆盖率>80%

#### 第二阶段：行为特征与交叉特征（2周）

**目标：** 新增行为特征和交叉特征，特征维度达180维

- [ ] 实现修改答案特征提取
- [ ] 实现跳题特征提取
- [ ] 实现极端回答特征提取
- [ ] 实现价值观×性格交叉特征
- [ ] 实现恋爱观×家庭观交叉特征
- [ ] 实现情境特征提取

**交付物：**
- 特征提取模块v2
- 行为特征分析报告
- 交叉特征效果评估

#### 第三阶段：隐含特征与异常检测（2周）

**目标：** 新增隐含特征推断和异常检测系统

- [ ] 实现认知失调检测
- [ ] 实现隐性特质推断
- [ ] 实现不认真答题检测
- [ ] 建立异常处理流程
- [ ] 实现动态权重调整

**交付物：**
- 特征提取模块v3（完整版）
- 异常检测系统
- 特征质量评估报告

#### 第四阶段：优化与上线（2周）

**目标：** 系统优化、A/B测试、正式上线

- [ ] 性能优化（延迟<100ms）
- [ ] A/B测试设计与执行
- [ ] 匹配效果评估
- [ ] 文档完善
- [ ] 监控告警配置
- [ ] 正式上线

**交付物：**
- 上线报告
- 匹配效果提升报告
- 运维文档

### 7.2 效果评估指标

| 指标类别 | 指标名称 | 当前值 | 目标值 | 评估方法 |
|---------|---------|-------|-------|---------|
| **匹配质量** | 匹配准确率 | 75% | 90% | 用户反馈+人工标注 |
| | 匹配接受率 | 60% | 80% | 用户行为数据 |
| | 关系持续率 | 40% | 60% | 3个月留存数据 |
| **特征质量** | 特征区分度 | 0.65 | 0.85 | ROC-AUC |
| | 特征稳定性 | 0.7 | 0.9 | 重测信度 |
| | 特征覆盖率 | 80% | 95% | 数据完整性检查 |
| **系统性能** | 特征提取延迟 | 200ms | <100ms | 性能监控 |
| | 异常检测准确率 | - | 85% | 人工审核验证 |
| | 系统可用性 | 99% | 99.9% | 监控系统 |

### 7.3 风险与应对

| 风险类型 | 风险描述 | 概率 | 影响 | 应对措施 |
|---------|---------|------|------|---------|
| **数据质量风险** | 历史数据质量参差不齐 | 高 | 高 | 数据清洗+人工标注 |
| **性能风险** | 特征提取延迟超标 | 中 | 高 | 预计算+缓存优化 |
| **效果风险** | 匹配效果提升不达预期 | 中 | 高 | A/B测试+快速迭代 |
| **用户接受风险** | 问卷复杂度增加影响体验 | 中 | 中 | 渐进式引导+激励机制 |
| **技术风险** | 因子分析等统计方法不稳定 | 低 | 中 | 增加数据量+算法鲁棒性 |

---

## 附录

### A. 心理学理论基础

1. **大五人格理论** (Big Five Personality Traits)
   - 来源：Costa & McCrae (1992)
   - 应用：长期关系预测、人格匹配

2. **依恋理论** (Attachment Theory)
   - 来源：Bowlby (1969), Hazan & Shaver (1987)
   - 应用：亲密关系质量预测

3. **价值观理论** (Schwartz Value Theory)
   - 来源：Schwartz (1992)
   - 应用：核心价值观匹配

4. **社会心理学** (Social Psychology)
   - 来源：Aronson et al.
   - 应用：社会期许偏差检测

### B. 特征工程最佳实践

1. **特征命名规范**
   ```
   {类别}_{子类别}_{具体特征}
   例：personality_big_five_openness
       behavior_timing_mean_response_time
   ```

2. **特征存储格式**
   ```json
   {
     "user_id": "xxx",
     "features": {
       "personality_big_five_openness": 4.2,
       "behavior_timing_mean_response_time": 8.5
     },
     "metadata": {
       "extracted_at": "2026-03-18T15:30:00Z",
       "version": "2.0",
       "quality_score": 0.85
     }
   }
   ```

3. **特征版本管理**
   - 每次特征更新都保留版本号
   - 支持特征回滚
   - 记录特征变更日志

### C. 参考资料

1. **心理学量表**
   - BFI-44: 大五人格量表
   - ECR-R: 成人依恋量表
   - PVQ: 价值观肖像问卷

2. **机器学习资源**
   - Feature Engineering for Machine Learning (Zheng & Casari, 2018)
   - Hands-On Feature Engineering (Kuhn & Johnson)

3. **在线课程**
   - Coursera: Machine Learning Feature Engineering
   - Udacity: Feature Engineering for ML

---

**文档版本历史**

| 版本 | 日期 | 作者 | 变更说明 |
|-----|------|------|---------|
| 1.0 | 2026-03-15 | 特征工程组 | 初始版本 |
| 2.0 | 2026-03-18 | 特征工程组 | 完整版本，新增异常检测 |

---

**联系方式**

如有问题或建议，请联系特征工程团队。

---

_本文档是心动投递项目的核心技术文档之一，请妥善保管并及时更新。_
