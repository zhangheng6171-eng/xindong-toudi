# 心动投递 - 核心匹配算法 V2.0

> 基于心理学研究的科学匹配系统设计
> 版本：2.0 | 创建日期：2026-03-18

---

## 目录

1. [算法概述](#算法概述)
2. [分层匹配策略](#分层匹配策略)
3. [动态权重计算规则](#动态权重计算规则)
4. [相似性与互补性判定矩阵](#相似性与互补性判定矩阵)
5. [长期关系预测模型](#长期关系预测模型)
6. [匹配解释生成系统](#匹配解释生成系统)
7. [伪代码实现](#伪代码实现)
8. [心理学研究依据](#心理学研究依据)

---

## 算法概述

### 核心理念

**"不是找最相似的，而是找最合适的"**

传统匹配算法过于依赖相似度计算，忽视了：
- 关系中的**互补性价值**
- **动态匹配**需求（不同人有不同偏好权重）
- **长期关系稳定性**的预测因子
- 匹配原因的**可解释性**

### 算法框架

```
输入：用户A资料，候选池 {B1, B2, ..., Bn}
     ↓
┌─────────────────────────────────────┐
│  第一层：硬过滤（底线冲突排除）      │
│  → 过滤率：约60-70%                 │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│  第二层：核心维度匹配               │
│  → 价值观 + 人格特质                │
│  → 权重：动态计算                   │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│  第三层：兼容性评分                 │
│  → 生活方式 + 兴趣爱好              │
│  → 相似性 + 互补性综合评估          │
└─────────────────────────────────────┘
     ↓
┌─────────────────────────────────────┐
│  第四层：互补性分析                 │
│  → 特定维度互补加分                 │
│  → 长期关系稳定性预测               │
└─────────────────────────────────────┘
     ↓
输出：匹配分数 + 匹配解释 + 潜在挑战提示
```

---

## 分层匹配策略

### 第一层：硬过滤（Hard Filtering）

**目的**：排除存在根本性冲突的候选人，避免浪费算力和用户时间。

#### 1.1 硬性排除规则

| 维度 | 规则 | 心理学依据 |
|------|------|------------|
| **婚姻意愿** | 双方婚姻意愿不一致 | Finkel et al. (2014): 目标不一致是关系失败的首要原因 |
| **生育观念** | 一方想要孩子，一方不想要 | Myers (2005): 生育决策冲突是婚姻破裂的主要因素之一 |
| **宗教信仰** | 双方对跨宗教婚姻的接受度不匹配 | Hurd (2017): 宗教差异需要双方都有开放态度 |
| **地理位置** | 不接受异地 + 无迁居计划 | Karney et al. (1995): 异地恋成功率显著低于同地恋 |
| **年龄差距** | 超出双方可接受范围 | Daly & Wilson (1983): 年龄偏好具有进化心理学基础 |
| **吸烟/饮酒** | 一方强烈介意烟酒习惯 | 研究显示生活习惯差异显著影响关系满意度 |

#### 1.2 软性警告规则

某些维度不直接排除，但会标记为"潜在挑战"：

- 学历差距较大（>2个层级）
- 收入差距较大（>3倍）
- 父母态度差异（一方父母反对）
- 既往婚史差异（一方离异，一方未婚）

#### 1.3 过滤逻辑伪代码

```python
def hard_filter(user_a, candidate_pool):
    """第一层：硬过滤"""
    filtered = []
    
    for candidate in candidate_pool:
        # 检查硬性排除规则
        if not marriage_intention_match(user_a, candidate):
            continue  # 婚姻意愿不匹配
        
        if not child_intention_match(user_a, candidate):
            continue  # 生育意愿不匹配
        
        if not religion_compatible(user_a, candidate):
            continue  # 宗教不兼容
        
        if not location_compatible(user_a, candidate):
            continue  # 地理位置不兼容
        
        if not age_preference_match(user_a, candidate):
            continue  # 年龄偏好不匹配
        
        if not lifestyle_compatible(user_a, candidate):
            continue  # 生活方式不兼容
        
        # 检查软性警告
        warnings = check_soft_warnings(user_a, candidate)
        
        filtered.append({
            'candidate': candidate,
            'warnings': warnings
        })
    
    return filtered
```

---

### 第二层：核心维度匹配

**目的**：评估价值观和人格特质的核心匹配度，这是长期关系成功的基石。

#### 2.1 价值观匹配（权重：40%）

基于 Shalom Schwartz 的价值观理论，评估以下维度：

| 价值观维度 | 评估内容 | 匹配策略 |
|------------|----------|----------|
| **家庭价值观** | 家庭重要性、家庭责任观念 | 高相似性要求 |
| **事业追求** | 工作重要性、职业抱负 | 相似性为主，可适度互补 |
| **金钱观念** | 消费观、储蓄观、财务目标 | 高相似性要求 |
| **道德观** | 诚信、责任、正义感 | 高相似性要求 |
| **人生目标** | 短期/长期人生规划 | 高相似性要求 |

**价值观相似度计算**：

```python
def calculate_value_similarity(user_a, user_b, weights):
    """
    计算价值观相似度
    使用加权欧氏距离的补数
    """
    values = ['family', 'career', 'money', 'moral', 'life_goal']
    
    weighted_distance = 0
    total_weight = 0
    
    for value in values:
        # 获取该价值观的重要性权重
        weight = weights[value]
        total_weight += weight
        
        # 计算该维度的差异（0-1 scale）
        diff = abs(user_a.values[value] - user_b.values[value])
        weighted_distance += weight * diff
    
    # 归一化
    normalized_distance = weighted_distance / total_weight
    
    # 转换为相似度（0-100）
    similarity = (1 - normalized_distance) * 100
    
    return similarity
```

#### 2.2 人格特质匹配（权重：60%）

基于大五人格理论（Big Five），这是心理学界最广泛认可的人格模型：

| 人格维度 | 特征描述 | 匹配策略 |
|----------|----------|----------|
| **宜人性 (Agreeableness)** | 信任、利他、合作、谦虚 | 高相似性或双方都高 |
| **尽责性 (Conscientiousness)** | 自律、负责、有条理 | 相似性为主 |
| **外向性 (Extraversion)** | 社交性、活跃度、能量来源 | 可互补（外向-内向） |
| **开放性 (Openness)** | 好奇心、创新性、审美敏感 | 相似性为主 |
| **神经质 (Neuroticism)** | 情绪稳定性、焦虑倾向 | 双方都低为佳 |

**人格匹配规则**：

```python
def calculate_personality_match(user_a, user_b):
    """
    计算人格匹配度
    应用相似性/互补性规则
    """
    match_scores = {}
    
    # 宜人性：双方都高 = 最佳
    if user_a.agreeableness > 70 and user_b.agreeableness > 70:
        match_scores['agreeableness'] = 100
    elif abs(user_a.agreeableness - user_b.agreeableness) <= 20:
        match_scores['agreeableness'] = 85
    else:
        match_scores['agreeableness'] = 50
    
    # 尽责性：相似性重要
    conscientiousness_diff = abs(user_a.conscientiousness - user_b.conscientiousness)
    match_scores['conscientiousness'] = 100 - conscientiousness_diff
    
    # 外向性：可以互补（外向+内向 = 平衡）
    extraversion_diff = abs(user_a.extraversion - user_b.extraversion)
    if extraversion_diff > 40:  # 差异大
        # 一方高外向，一方低外向 = 互补加分
        if (user_a.extraversion > 65 and user_b.extraversion < 35) or \
           (user_a.extraversion < 35 and user_b.extraversion > 65):
            match_scores['extraversion'] = 80  # 互补优势
        else:
            match_scores['extraversion'] = 60
    else:
        match_scores['extraversion'] = 90  # 相似也好
    
    # 开放性：相似性重要
    openness_diff = abs(user_a.openness - user_b.openness)
    match_scores['openness'] = 100 - openness_diff
    
    # 神经质：双方都低 = 最佳
    if user_a.neuroticism < 30 and user_b.neuroticism < 30:
        match_scores['neuroticism'] = 100
    elif user_a.neuroticism > 70 or user_b.neuroticism > 70:
        # 一方高神经质，需要另一方高宜人性来平衡
        if (user_a.neuroticism > 70 and user_b.agreeableness > 70) or \
           (user_b.neuroticism > 70 and user_a.agreeableness > 70):
            match_scores['neuroticism'] = 75
        else:
            match_scores['neuroticism'] = 40  # 风险较高
    else:
        match_scores['neuroticism'] = 80
    
    # 加权平均
    weights = {
        'agreeableness': 1.5,      # 加权，宜人性最重要
        'conscientiousness': 1.0,
        'extraversion': 0.8,
        'openness': 1.0,
        'neuroticism': 1.5         # 神经质也很重要
    }
    
    total_score = sum(match_scores[k] * weights[k] for k in match_scores)
    total_weight = sum(weights.values())
    
    return total_score / total_weight
```

---

### 第三层：兼容性评分

**目的**：评估生活方式和兴趣爱好的兼容性，影响日常相处质量。

#### 3.1 生活方式匹配

| 维度 | 评估内容 | 匹配策略 |
|------|----------|----------|
| **作息时间** | 早起型/夜猫型 | 相似性要求较高 |
| **社交频率** | 社交需求强度 | 可互补 |
| **家务观念** | 家务分配态度 | 相似性要求 |
| **娱乐方式** | 休闲偏好 | 部分重叠即可 |
| **饮食偏好** | 饮食习惯 | 部分兼容即可 |

#### 3.2 兴趣爱好匹配

使用 **Jaccard 相似度** + **兴趣权重** 的混合计算：

```python
def calculate_interest_compatibility(user_a, user_b):
    """
    计算兴趣兼容度
    使用改进的 Jaccard 相似度
    """
    # 用户标注的兴趣重要性（核心兴趣 vs 次要兴趣）
    a_interests = user_a.interests  # {interest_name: importance(1-5)}
    b_interests = user_b.interests
    
    # 找出共同兴趣
    common_interests = set(a_interests.keys()) & set(b_interests.keys())
    
    # 计算加权重叠
    common_weight = 0
    for interest in common_interests:
        # 双方都重视这个兴趣 = 高匹配
        avg_importance = (a_interests[interest] + b_interests[interest]) / 2
        common_weight += avg_importance
    
    # 计算总可能权重
    all_interests = set(a_interests.keys()) | set(b_interests.keys())
    total_weight = 0
    for interest in all_interests:
        weight = max(a_interests.get(interest, 0), b_interests.get(interest, 0))
        total_weight += weight
    
    # 兼容度
    if total_weight == 0:
        return 50  # 默认中等兼容
    
    compatibility = (common_weight / total_weight) * 100
    
    # 补充规则：如果双方都兴趣广泛，兼容度加成
    if len(a_interests) >= 5 and len(b_interests) >= 5:
        compatibility = min(100, compatibility * 1.1)
    
    return compatibility
```

#### 3.3 综合兼容度计算

```python
def calculate_compatibility_score(user_a, user_b):
    """
    第三层：综合兼容度评分
    """
    # 生活方式匹配
    lifestyle_score = calculate_lifestyle_match(user_a, user_b)
    
    # 兴趣爱好匹配
    interest_score = calculate_interest_compatibility(user_a, user_b)
    
    # 沟通风格匹配
    communication_score = calculate_communication_match(user_a, user_b)
    
    # 冲突处理风格匹配
    conflict_style_score = calculate_conflict_style_match(user_a, user_b)
    
    # 加权平均
    weights = {
        'lifestyle': 0.30,
        'interest': 0.25,
        'communication': 0.25,
        'conflict_style': 0.20
    }
    
    total_score = (
        lifestyle_score * weights['lifestyle'] +
        interest_score * weights['interest'] +
        communication_score * weights['communication'] +
        conflict_style_score * weights['conflict_style']
    )
    
    return total_score
```

---

### 第四层：互补性分析与长期关系预测

#### 4.1 互补性维度矩阵

根据心理学研究，某些维度的差异反而是优势：

| 维度A | 维度B | 互补逻辑 | 加分规则 |
|-------|-------|----------|----------|
| 高外向性 | 低外向性 | 社交能量互补，外向者带动，内向者提供稳定 | +5-10分 |
| 高理性 | 高感性 | 决策风格互补，理性者提供逻辑，感性者提供共情 | +5-8分 |
| 高开放性 | 高尽责性 | 创新与执行互补，开放者提出想法，尽责者落实 | +5-8分 |
| 高焦虑 | 高宜人性 | 情绪互补，焦虑者需要宜人性伴侣的支持 | +3-5分 |
| 高冒险性 | 高谨慎性 | 风险态度互补，平衡探索与安全 | +5-10分 |

#### 4.2 关系风险因子评估

基于纵向研究识别的风险因子：

```python
def assess_relationship_risks(user_a, user_b):
    """
    评估关系风险因子
    基于心理学研究证据
    """
    risks = []
    risk_level = 'low'  # low, medium, high
    
    # 风险因子1：双方都高神经质
    if user_a.neuroticism > 65 and user_b.neuroticism > 65:
        risks.append({
            'factor': '双高神经质',
            'description': '双方情绪都较不稳定，容易产生冲突和误解',
            'severity': 'high',
            'evidence': 'Karney & Bradbury (1995): 双方高神经质是婚姻不稳定的最强预测因子'
        })
        risk_level = 'high'
    
    # 风险因子2：双方都低宜人性
    if user_a.agreeableness < 35 and user_b.agreeableness < 35:
        risks.append({
            'factor': '双低宜人性',
            'description': '双方都较自我中心，冲突时缺乏合作意愿',
            'severity': 'high',
            'evidence': 'Robins et al. (2000): 低宜人性与关系满意度负相关'
        })
        risk_level = max(risk_level, 'high')
    
    # 风险因子3：依恋风格不匹配
    if has_attachment_mismatch(user_a, user_b):
        risks.append({
            'factor': '依恋风格不匹配',
            'description': '一方焦虑型依恋，一方回避型依恋，形成"追逐-逃避"循环',
            'severity': 'medium',
            'evidence': 'Hazan & Shaver (1987): 依恋风格不匹配影响关系稳定性'
        })
        risk_level = max(risk_level, 'medium')
    
    # 风险因子4：价值观核心冲突
    if has_core_value_conflict(user_a, user_b):
        risks.append({
            'factor': '价值观核心冲突',
            'description': '核心价值观存在根本分歧',
            'severity': 'medium',
            'evidence': 'Luo & Klohnen (2005): 价值观相似性预测关系质量'
        })
        risk_level = max(risk_level, 'medium')
    
    # 风险因子5：沟通风格差异大
    if abs(user_a.communication_style - user_b.communication_style) > 50:
        risks.append({
            'factor': '沟通风格差异大',
            'description': '一方偏好直接表达，一方偏好含蓄表达',
            'severity': 'low',
            'evidence': 'Gottman (1994): 沟通风格差异需要双方有意识调适'
        })
        risk_level = max(risk_level, 'low')
    
    return {
        'risks': risks,
        'overall_risk_level': risk_level
    }
```

#### 4.3 关系优势因子评估

```python
def assess_relationship_strengths(user_a, user_b):
    """
    评估关系优势因子
    基于心理学研究证据
    """
    strengths = []
    
    # 优势因子1：双方都高宜人性
    if user_a.agreeableness > 70 and user_b.agreeableness > 70:
        strengths.append({
            'factor': '双高宜人性',
            'description': '双方都乐于合作和妥协，冲突容易化解',
            'impact': 'high',
            'evidence': 'Robins et al. (2000): 高宜人性是最重要的关系保护因子'
        })
    
    # 优势因子2：双方都低神经质
    if user_a.neuroticism < 30 and user_b.neuroticism < 30:
        strengths.append({
            'factor': '双低神经质',
            'description': '双方情绪都较稳定，关系更和谐',
            'impact': 'high',
            'evidence': 'Karney & Bradbury (1995): 情绪稳定性是关系满意度的关键预测因子'
        })
    
    # 优势因子3：价值观高度一致
    if calculate_value_similarity(user_a, user_b) > 85:
        strengths.append({
            'factor': '价值观高度一致',
            'description': '核心价值观相似，减少重大决策冲突',
            'impact': 'high',
            'evidence': 'Luo & Klohnen (2005): 价值观相似性是最强的关系预测因子之一'
        })
    
    # 优势因子4：安全型依恋配对
    if user_a.attachment_style == 'secure' and user_b.attachment_style == 'secure':
        strengths.append({
            'factor': '安全型依恋配对',
            'description': '双方都有安全感，信任和亲密关系更容易建立',
            'impact': 'high',
            'evidence': 'Hazan & Shaver (1987): 安全型依恋配对的关系最稳定'
        })
    
    # 优势因子5：互补性优势
    if has_complementary_strength(user_a, user_b):
        strengths.append({
            'factor': '人格互补优势',
            'description': '人格特质形成互补，相互支持',
            'impact': 'medium',
            'evidence': 'Humbad et al. (2010): 适度的人格差异可能带来关系满意度'
        })
    
    return strengths
```

#### 4.4 长期关系稳定性预测模型

综合风险评估和优势评估，预测长期关系稳定性：

```python
def predict_relationship_stability(user_a, user_b):
    """
    预测长期关系稳定性
    综合多层因子
    """
    # 基础匹配分数
    value_match = calculate_value_similarity(user_a, user_b)
    personality_match = calculate_personality_match(user_a, user_b)
    compatibility_score = calculate_compatibility_score(user_a, user_b)
    
    # 风险评估
    risk_assessment = assess_relationship_risks(user_a, user_b)
    
    # 优势评估
    strength_assessment = assess_relationship_strengths(user_a, user_b)
    
    # 稳定性计算
    base_stability = (
        value_match * 0.35 +
        personality_match * 0.40 +
        compatibility_score * 0.25
    )
    
    # 风险扣分
    risk_penalty = 0
    for risk in risk_assessment['risks']:
        if risk['severity'] == 'high':
            risk_penalty += 15
        elif risk['severity'] == 'medium':
            risk_penalty += 8
        else:
            risk_penalty += 3
    
    # 优势加分
    strength_bonus = 0
    for strength in strength_assessment['strengths']:
        if strength['impact'] == 'high':
            strength_bonus += 10
        else:
            strength_bonus += 5
    
    # 最终稳定性分数
    final_stability = base_stability - risk_penalty + strength_bonus
    final_stability = max(0, min(100, final_stability))
    
    # 预测分类
    if final_stability >= 75:
        prediction = '高稳定性'
        confidence = 0.85
    elif final_stability >= 55:
        prediction = '中等稳定性'
        confidence = 0.70
    else:
        prediction = '低稳定性'
        confidence = 0.60
    
    return {
        'stability_score': final_stability,
        'prediction': prediction,
        'confidence': confidence,
        'risks': risk_assessment,
        'strengths': strength_assessment
    }
```

---

## 动态权重计算规则

### 核心理念

**"不同的人，需要不同的匹配策略"**

固定的权重无法满足多样化需求。动态权重根据用户特征调整匹配重点。

### 权重调整因子

#### 1. 基于用户优先级的权重

```python
def calculate_dynamic_weights(user):
    """
    根据用户特征计算动态权重
    """
    base_weights = {
        'values': 0.35,
        'personality': 0.40,
        'lifestyle': 0.15,
        'interests': 0.10
    }
    
    adjustments = {}
    
    # 调整因子1：家庭观念强度
    if user.family_importance > 80:
        adjustments['values'] = base_weights['values'] * 1.2
        adjustments['lifestyle'] = base_weights['lifestyle'] * 0.9
    elif user.family_importance < 40:
        adjustments['values'] = base_weights['values'] * 0.9
        adjustments['interests'] = base_weights['interests'] * 1.2
    
    # 调整因子2：年龄阶段
    age = user.age
    if age < 28:
        # 年轻用户更看重兴趣和生活方式
        adjustments['interests'] = base_weights['interests'] * 1.3
        adjustments['lifestyle'] = base_weights['lifestyle'] * 1.2
        adjustments['values'] = base_weights['values'] * 0.9
    elif age > 35:
        # 成熟用户更看重价值观和人格
        adjustments['values'] = base_weights['values'] * 1.2
        adjustments['personality'] = base_weights['personality'] * 1.1
        adjustments['interests'] = base_weights['interests'] * 0.8
    elif age > 40:
        # 大龄用户价值观权重进一步提升
        adjustments['values'] = base_weights['values'] * 1.3
        adjustments['personality'] = base_weights['personality'] * 1.15
        adjustments['interests'] = base_weights['interests'] * 0.7
    
    # 调整因子3：性格特征
    if user.neuroticism > 65:
        # 高神经质用户需要高宜人性伴侣
        adjustments['personality_agreeableness'] = 1.5
    
    if user.extraversion < 35:
        # 内向用户可能需要外向伴侣带动
        adjustments['personality_extraversion'] = 1.2
        adjustments['extraversion_complement'] = True
    
    # 调整因子4：既往关系经历
    if user.divorced:
        # 离异用户更看重沟通和冲突处理
        adjustments['communication_style'] = 1.3
        adjustments['conflict_resolution'] = 1.3
    
    # 调整因子5：用户自设偏好
    if user.preferences:
        for pref in user.preferences:
            if pref == 'prioritize_career':
                adjustments['values_career'] = 1.4
            elif pref == 'prioritize_family':
                adjustments['values_family'] = 1.4
            elif pref == 'prioritize_interests':
                adjustments['interests'] = 1.3
    
    # 合并基础权重和调整
    final_weights = base_weights.copy()
    for key, adjustment in adjustments.items():
        if key in final_weights:
            final_weights[key] = adjustment
    
    # 归一化
    total = sum(final_weights.values())
    for key in final_weights:
        final_weights[key] = final_weights[key] / total
    
    return final_weights
```

#### 2. 年龄段权重策略表

| 年龄段 | 价值观 | 人格 | 生活方式 | 兴趣 | 特殊权重 |
|--------|--------|------|----------|------|----------|
| 20-25岁 | 0.25 | 0.30 | 0.25 | 0.20 | 兴趣+20% |
| 26-30岁 | 0.30 | 0.35 | 0.20 | 0.15 | 平衡 |
| 31-35岁 | 0.35 | 0.40 | 0.15 | 0.10 | 价值观+10% |
| 36-40岁 | 0.38 | 0.42 | 0.12 | 0.08 | 人格+5% |
| 41岁以上 | 0.40 | 0.45 | 0.10 | 0.05 | 价值观+15% |

#### 3. 用户优先级权重表

| 用户特征 | 权重调整 |
|----------|----------|
| 家庭观念 > 80分 | 价值观权重 × 1.2 |
| 家庭观念 < 40分 | 兴趣权重 × 1.2 |
| 事业心 > 80分 | 事业价值观权重 × 1.3 |
| 社交需求 > 80分 | 外向性权重 × 1.2 |
| 神经质 > 65分 | 宜人性权重 × 1.5 |
| 开放性 > 80分 | 开放性权重 × 1.2 |
| 离异经历 | 沟通风格权重 × 1.3 |

---

## 相似性与互补性判定矩阵

### 核心原则

**"该相似的要相似，可互补的可互补"**

基于心理学研究，不同维度有不同的匹配策略。

### 判定矩阵

| 维度 | 匹配策略 | 相似性要求 | 互补性可能 | 研究依据 |
|------|----------|------------|------------|----------|
| **价值观** | 相似性优先 | ★★★★★ | ★☆☆☆☆ | Luo & Klohnen (2005): 价值观相似性是最强预测因子 |
| **人生目标** | 高相似性要求 | ★★★★★ | ☆☆☆☆☆ | Finkel et al. (2014): 目标一致是关系成功基础 |
| **宜人性** | 双高最优 | ★★★★☆ | ★★☆☆☆ | 双方都高宜人性最佳，但高-中也可 |
| **尽责性** | 相似性优先 | ★★★★☆ | ★☆☆☆☆ | 相似更有利于家庭责任分担 |
| **外向性** | 相似或互补 | ★★★☆☆ | ★★★★☆ | 可互补：外向带动，内向稳定 |
| **开放性** | 相似性优先 | ★★★★☆ | ★★☆☆☆ | 相似更有利于共同兴趣 |
| **神经质** | 双低最优 | ★★★☆☆ | ★★★☆☆ | 双低最佳，但高神经质需要高宜人性伴侣 |
| **依恋风格** | 安全型配对最优 | ★★★★☆ | ★★☆☆☆ | 安全-安全最佳，焦虑-回避最差 |
| **沟通风格** | 相似性优先 | ★★★★☆ | ★★☆☆☆ | 相似减少误解 |
| **冲突处理** | 相似或互补 | ★★★☆☆ | ★★★☆☆ | 合作型最佳，但可互补 |
| **社交频率** | 相似或互补 | ★★★☆☆ | ★★★★☆ | 可互补，但需要尊重差异 |
| **兴趣爱好** | 部分重叠即可 | ★★★☆☆ | ★★★☆☆ | 有共同兴趣即可，不必全部相同 |

### 相似性评分规则

```python
def calculate_similarity_score(user_a, user_b, dimension):
    """
    计算特定维度的相似性评分
    """
    # 获取该维度的判定规则
    rule = SIMILARITY_MATRIX[dimension]
    
    if rule['strategy'] == 'strict_similarity':
        # 严格相似性要求
        diff = abs(user_a[dimension] - user_b[dimension])
        similarity = 100 - diff
        return similarity
    
    elif rule['strategy'] == 'both_high':
        # 双高最优
        if user_a[dimension] > 70 and user_b[dimension] > 70:
            return 100
        else:
            diff = abs(user_a[dimension] - user_b[dimension])
            similarity = 100 - diff * 0.8
            return similarity
    
    elif rule['strategy'] == 'both_low':
        # 双低最优
        if user_a[dimension] < 30 and user_b[dimension] < 30:
            return 100
        else:
            diff = abs(user_a[dimension] - user_b[dimension])
            similarity = 100 - diff * 0.8
            return similarity
    
    elif rule['strategy'] == 'flexible':
        # 灵活匹配：相似或互补都可
        diff = abs(user_a[dimension] - user_b[dimension])
        
        # 相似
        similarity_score = 100 - diff
        
        # 互补
        complementarity_score = calculate_complementarity_score(user_a, user_b, dimension)
        
        # 取较高分
        return max(similarity_score, complementarity_score)
```

### 互补性评分规则

```python
def calculate_complementarity_score(user_a, user_b, dimension):
    """
    计算特定维度的互补性评分
    """
    # 外向性互补
    if dimension == 'extraversion':
        diff = abs(user_a.extraversion - user_b.extraversion)
        if diff > 40:  # 差异大
            # 一方高外向，一方低外向 = 互补
            if (user_a.extraversion > 65 and user_b.extraversion < 35) or \
               (user_a.extraversion < 35 and user_b.extraversion > 65):
                return 80  # 互补优势
        return 50
    
    # 神经质互补
    elif dimension == 'neuroticism':
        # 高神经质需要高宜人性伴侣
        if user_a.neuroticism > 65 and user_b.agreeableness > 70:
            return 75
        elif user_b.neuroticism > 65 and user_a.agreeableness > 70:
            return 75
        return 50
    
    # 开放性-尽责性互补
    elif dimension == 'openness_conscientiousness':
        if user_a.openness > 70 and user_b.conscientiousness > 70:
            return 80  # 创新+执行
        elif user_b.openness > 70 and user_a.conscientiousness > 70:
            return 80
        return 50
    
    return 50  # 默认
```

---

## 长期关系预测模型

### 理论基础

基于以下心理学研究成果：

1. **Karney & Bradbury (1995)**: 婚姻稳定性的纵向研究
2. **Gottman (1994)**: 关系成功/失败的预测因子
3. **Hazan & Shaver (1987)**: 成人依恋理论
4. **Robins et al. (2000)**: 人格特质与关系质量
5. **Luo & Klohnen (2005)**: 相似性与关系满意度

### 预测模型架构

```
长期关系稳定性 = f(
    价值观匹配度,
    人格匹配度,
    生活方式兼容度,
    风险因子惩罚,
    优势因子加成
)
```

### 关键预测因子

#### 1. 核心预测因子（权重最高）

| 因子 | 权重 | 预测力 |
|------|------|--------|
| 双方都高神经质 | -20分 | 最强负向预测因子 |
| 双方都高宜人性 | +15分 | 最强正向预测因子 |
| 价值观高度一致 | +12分 | 强正向预测因子 |
| 安全型依恋配对 | +10分 | 强正向预测因子 |
| 焦虑-回避依恋配对 | -10分 | 强负向预测因子 |

#### 2. 次要预测因子

| 因子 | 权重 | 预测力 |
|------|------|--------|
| 双方都低宜人性 | -15分 | 中等负向预测因子 |
| 高冲突倾向 | -8分 | 中等负向预测因子 |
| 沟通风格相似 | +5分 | 中等正向预测因子 |
| 兴趣部分重叠 | +3分 | 弱正向预测因子 |

### 预测模型实现

```python
class RelationshipStabilityPredictor:
    """
    长期关系稳定性预测模型
    基于心理学研究证据
    """
    
    def __init__(self):
        # 核心预测因子权重
        self.core_factors = {
            'both_high_neuroticism': -20,
            'both_high_agreeableness': +15,
            'high_value_similarity': +12,
            'secure_attachment_pair': +10,
            'anxious_avoidant_pair': -10
        }
        
        # 次要预测因子权重
        self.secondary_factors = {
            'both_low_agreeableness': -15,
            'high_conflict_tendency': -8,
            'similar_communication': +5,
            'overlapping_interests': +3,
            'complementary_extraversion': +5,
            'both_low_neuroticism': +10
        }
    
    def predict(self, user_a, user_b):
        """
        预测长期关系稳定性
        """
        # 基础匹配分数
        base_score = self.calculate_base_match_score(user_a, user_b)
        
        # 核心因子调整
        core_adjustment = 0
        core_factors_present = []
        
        # 检查核心因子
        if self.both_high_neuroticism(user_a, user_b):
            core_adjustment += self.core_factors['both_high_neuroticism']
            core_factors_present.append('both_high_neuroticism')
        
        if self.both_high_agreeableness(user_a, user_b):
            core_adjustment += self.core_factors['both_high_agreeableness']
            core_factors_present.append('both_high_agreeableness')
        
        if self.high_value_similarity(user_a, user_b):
            core_adjustment += self.core_factors['high_value_similarity']
            core_factors_present.append('high_value_similarity')
        
        if self.secure_attachment_pair(user_a, user_b):
            core_adjustment += self.core_factors['secure_attachment_pair']
            core_factors_present.append('secure_attachment_pair')
        
        if self.anxious_avoidant_pair(user_a, user_b):
            core_adjustment += self.core_factors['anxious_avoidant_pair']
            core_factors_present.append('anxious_avoidant_pair')
        
        # 次要因子调整
        secondary_adjustment = 0
        secondary_factors_present = []
        
        if self.both_low_agreeableness(user_a, user_b):
            secondary_adjustment += self.secondary_factors['both_low_agreeableness']
            secondary_factors_present.append('both_low_agreeableness')
        
        if self.both_low_neuroticism(user_a, user_b):
            secondary_adjustment += self.secondary_factors['both_low_neuroticism']
            secondary_factors_present.append('both_low_neuroticism')
        
        if self.complementary_extraversion(user_a, user_b):
            secondary_adjustment += self.secondary_factors['complementary_extraversion']
            secondary_factors_present.append('complementary_extraversion')
        
        # 最终稳定性分数
        final_score = base_score + core_adjustment + secondary_adjustment
        final_score = max(0, min(100, final_score))
        
        # 预测结果
        if final_score >= 75:
            prediction = 'high_stability'
            description = '高稳定性：基于双方特质，长期关系成功的可能性很高'
        elif final_score >= 55:
            prediction = 'medium_stability'
            description = '中等稳定性：关系有一定挑战，但可以克服'
        else:
            prediction = 'low_stability'
            description = '低稳定性：存在较多风险因子，需要双方有意识努力'
        
        return {
            'stability_score': final_score,
            'prediction': prediction,
            'description': description,
            'core_factors': core_factors_present,
            'secondary_factors': secondary_factors_present,
            'base_score': base_score,
            'core_adjustment': core_adjustment,
            'secondary_adjustment': secondary_adjustment
        }
    
    def calculate_base_match_score(self, user_a, user_b):
        """
        计算基础匹配分数
        """
        value_match = calculate_value_similarity(user_a, user_b)
        personality_match = calculate_personality_match(user_a, user_b)
        compatibility = calculate_compatibility_score(user_a, user_b)
        
        base_score = (
            value_match * 0.35 +
            personality_match * 0.40 +
            compatibility * 0.25
        )
        
        return base_score
    
    # 因子检测方法
    def both_high_neuroticism(self, user_a, user_b):
        return user_a.neuroticism > 65 and user_b.neuroticism > 65
    
    def both_high_agreeableness(self, user_a, user_b):
        return user_a.agreeableness > 70 and user_b.agreeableness > 70
    
    def high_value_similarity(self, user_a, user_b):
        return calculate_value_similarity(user_a, user_b) > 85
    
    def secure_attachment_pair(self, user_a, user_b):
        return user_a.attachment_style == 'secure' and user_b.attachment_style == 'secure'
    
    def anxious_avoidant_pair(self, user_a, user_b):
        return (
            (user_a.attachment_style == 'anxious' and user_b.attachment_style == 'avoidant') or
            (user_a.attachment_style == 'avoidant' and user_b.attachment_style == 'anxious')
        )
    
    def both_low_agreeableness(self, user_a, user_b):
        return user_a.agreeableness < 35 and user_b.agreeableness < 35
    
    def both_low_neuroticism(self, user_a, user_b):
        return user_a.neuroticism < 30 and user_b.neuroticism < 30
    
    def complementary_extraversion(self, user_a, user_b):
        diff = abs(user_a.extraversion - user_b.extraversion)
        if diff > 40:
            return (user_a.extraversion > 65 and user_b.extraversion < 35) or \
                   (user_a.extraversion < 35 and user_b.extraversion > 65)
        return False
```

---

## 匹配解释生成系统

### 核心理念

**"不只是给分数，要告诉用户为什么"**

可解释性是信任建立的关键。用户需要了解：
1. 为什么这个人适合我？
2. 我们有哪些共同点？
3. 可能面临什么挑战？
4. 如何克服这些挑战？

### 解释生成框架

```python
class MatchExplanationGenerator:
    """
    匹配解释生成系统
    生成个性化、有深度的匹配理由
    """
    
    def generate_explanation(self, user_a, user_b, match_result):
        """
        生成完整的匹配解释
        """
        explanation = {
            'summary': self.generate_summary(user_a, user_b, match_result),
            'strengths': self.generate_strength_explanation(user_a, user_b, match_result),
            'complementarities': self.generate_complementarity_explanation(user_a, user_b),
            'challenges': self.generate_challenge_explanation(user_a, user_b, match_result),
            'suggestions': self.generate_suggestions(user_a, user_b, match_result)
        }
        
        return explanation
    
    def generate_summary(self, user_a, user_b, match_result):
        """
        生成匹配摘要
        """
        score = match_result['total_score']
        
        if score >= 80:
            level = '高度匹配'
            emoji = '🌟'
        elif score >= 65:
            level = '较好匹配'
            emoji = '✨'
        elif score >= 50:
            level = '中等匹配'
            emoji = '💫'
        else:
            level = '一般匹配'
            emoji = '⭐'
        
        # 生成核心匹配点
        core_points = self.identify_core_matches(user_a, user_b)
        
        summary = f"{emoji} **{level}**（综合评分：{score:.0f}分）\n\n"
        summary += f"你们在以下方面特别契合：\n"
        for point in core_points[:3]:
            summary += f"- {point}\n"
        
        return summary
    
    def generate_strength_explanation(self, user_a, user_b, match_result):
        """
        生成优势解释
        """
        strengths = match_result.get('strengths', [])
        explanations = []
        
        for strength in strengths:
            if strength['factor'] == '双高宜人性':
                explanations.append({
                    'title': '🤝 性格互补',
                    'description': f"你们都拥有高宜人性特质，这意味着你们都善于合作、乐于助人、愿意为对方着想。这是关系和谐的重要基础。"
                })
            
            elif strength['factor'] == '双低神经质':
                explanations.append({
                    'title': '😌 情绪稳定',
                    'description': f"你们都拥有较强的情绪稳定性，不易焦虑或情绪波动。这为关系的长期稳定奠定了良好基础。"
                })
            
            elif strength['factor'] == '价值观高度一致':
                explanations.append({
                    'title': '🎯 价值观契合',
                    'description': f"你们在家庭、事业、金钱等核心价值观上高度一致。这减少了未来重大决策时的潜在冲突。"
                })
            
            elif strength['factor'] == '安全型依恋配对':
                explanations.append({
                    'title': '💕 安全感充沛',
                    'description': f"你们都拥有安全型依恋风格，这意味着你们都能给对方足够的安全感和信任，是关系稳定的基石。"
                })
        
        return explanations
    
    def generate_complementarity_explanation(self, user_a, user_b):
        """
        生成互补性解释
        """
        explanations = []
        
        # 外向性互补
        if self.has_extraversion_complement(user_a, user_b):
            extravert = user_a if user_a.extraversion > user_b.extraversion else user_b
            introvert = user_b if user_a.extraversion > user_b.extraversion else user_a
            
            explanations.append({
                'title': '🎭 性格互补',
                'description': f"一方偏外向，一方偏内向，这种组合可以形成很好的平衡：外向的一方可以带动社交活动，内向的一方可以提供稳定的内在支持。",
                'complement_type': 'extraversion'
            })
        
        # 开放性-尽责性互补
        if self.has_openness_conscientiousness_complement(user_a, user_b):
            explanations.append({
                'title': '💡 创新与执行',
                'description': f"一方富有创意和开放性，另一方善于规划和执行。这种组合可以让你们的家庭生活既有新鲜感又有条理。",
                'complement_type': 'openness_conscientiousness'
            })
        
        # 理性-感性互补
        if self.has_thinking_feeling_complement(user_a, user_b):
            explanations.append({
                'title': '🧠 心与脑',
                'description': f"一方偏理性思考，一方偏感性直觉。在决策时可以相互补充，既考虑逻辑合理性，也顾及情感感受。",
                'complement_type': 'thinking_feeling'
            })
        
        return explanations
    
    def generate_challenge_explanation(self, user_a, user_b, match_result):
        """
        生成潜在挑战提示
        """
        challenges = []
        
        risks = match_result.get('risks', [])
        for risk in risks:
            challenge = {
                'title': self.get_challenge_title(risk['factor']),
                'description': risk['description'],
                'severity': risk['severity'],
                'suggestion': self.get_challenge_suggestion(risk['factor'])
            }
            challenges.append(challenge)
        
        # 检查其他潜在挑战
        if not self.has_overlapping_interests(user_a, user_b):
            challenges.append({
                'title': '🎨 兴趣差异',
                'description': '你们的兴趣爱好重叠度不高，可能需要花时间培养共同爱好。',
                'severity': 'low',
                'suggestion': '建议尝试一起探索新的活动，找到共同的兴趣点。'
            })
        
        return challenges
    
    def generate_suggestions(self, user_a, user_b, match_result):
        """
        生成关系发展建议
        """
        suggestions = []
        
        # 基于挑战生成建议
        challenges = match_result.get('risks', [])
        for risk in challenges:
            suggestion = self.get_development_suggestion(risk['factor'])
            if suggestion:
                suggestions.append(suggestion)
        
        # 基于优势生成建议
        strengths = match_result.get('strengths', [])
        if any(s['factor'] == '价值观高度一致' for s in strengths):
            suggestions.append({
                'title': '深化价值观认同',
                'description': '你们的价值观高度一致，建议多讨论未来的人生规划，进一步加深理解。'
            })
        
        # 通用建议
        if not suggestions:
            suggestions.append({
                'title': '持续沟通',
                'description': '建议保持开放、诚实的沟通，及时分享想法和感受。'
            })
        
        return suggestions
    
    # 辅助方法
    def identify_core_matches(self, user_a, user_b):
        """
        识别核心匹配点
        """
        matches = []
        
        # 价值观匹配
        value_similarity = calculate_value_similarity(user_a, user_b)
        if value_similarity > 80:
            matches.append("核心价值观高度一致")
        
        # 人格匹配
        personality_match = calculate_personality_match(user_a, user_b)
        if personality_match > 75:
            matches.append("性格特质高度契合")
        
        # 生活方式
        lifestyle_match = calculate_lifestyle_match(user_a, user_b)
        if lifestyle_match > 70:
            matches.append("生活方式相似")
        
        # 兴趣重叠
        interest_overlap = calculate_interest_compatibility(user_a, user_b)
        if interest_overlap > 60:
            matches.append("有共同兴趣爱好")
        
        # 互补性
        if self.has_complementary_strength(user_a, user_b):
            matches.append("人格特质形成互补")
        
        return matches
    
    def has_extraversion_complement(self, user_a, user_b):
        diff = abs(user_a.extraversion - user_b.extraversion)
        if diff > 40:
            return (user_a.extraversion > 65 and user_b.extraversion < 35) or \
                   (user_a.extraversion < 35 and user_b.extraversion > 65)
        return False
    
    def has_openness_conscientiousness_complement(self, user_a, user_b):
        return (user_a.openness > 70 and user_b.conscientiousness > 70) or \
               (user_b.openness > 70 and user_a.conscientiousness > 70)
    
    def has_thinking_feeling_complement(self, user_a, user_b):
        # 假设有理性-感性维度
        if hasattr(user_a, 'thinking_feeling') and hasattr(user_b, 'thinking_feeling'):
            diff = abs(user_a.thinking_feeling - user_b.thinking_feeling)
            return diff > 40
        return False
    
    def has_overlapping_interests(self, user_a, user_b):
        overlap = calculate_interest_compatibility(user_a, user_b)
        return overlap > 40
    
    def has_complementary_strength(self, user_a, user_b):
        return (self.has_extraversion_complement(user_a, user_b) or
                self.has_openness_conscientiousness_complement(user_a, user_b))
    
    def get_challenge_title(self, factor):
        """
        获取挑战标题
        """
        titles = {
            '双高神经质': '😰 情绪波动',
            '双低宜人性': '😤 冲突风险',
            '依恋风格不匹配': '🔗 亲密感差异',
            '价值观核心冲突': '⚖️ 价值观差异',
            '沟通风格差异大': '💬 沟通方式差异'
        }
        return titles.get(factor, '⚠️ 潜在挑战')
    
    def get_challenge_suggestion(self, factor):
        """
        获取挑战应对建议
        """
        suggestions = {
            '双高神经质': '建议双方都学习情绪管理技巧，培养正念和自我安抚能力。',
            '双低宜人性': '建议双方有意识地培养合作精神，学会换位思考和妥协。',
            '依恋风格不匹配': '建议了解彼此的依恋风格，有意识地打破"追逐-逃避"循环。',
            '价值观核心冲突': '建议深入讨论差异，寻找可能的共同点或接受差异。',
            '沟通风格差异大': '建议学习彼此的沟通方式，找到中间地带。'
        }
        return suggestions.get(factor, '建议双方坦诚沟通，共同寻找解决方案。')
    
    def get_development_suggestion(self, factor):
        """
        获取关系发展建议
        """
        suggestions = {
            '双高神经质': {
                'title': '情绪管理',
                'description': '建议一起学习情绪调节技巧，如正念冥想、情绪日记等，帮助双方更好地管理情绪。'
            },
            '双低宜人性': {
                'title': '培养合作意识',
                'description': '建议有意识地练习换位思考，在冲突时主动寻找共同利益，而非争输赢。'
            },
            '依恋风格不匹配': {
                'title': '理解依恋模式',
                'description': '建议阅读关于依恋理论的书籍，理解彼此的依恋模式如何影响关系，并学习如何提供对方需要的安全感。'
            }
        }
        return suggestions.get(factor)
```

### 解释示例输出

```json
{
  "summary": "🌟 **高度匹配**（综合评分：82分）\n\n你们在以下方面特别契合：\n- 核心价值观高度一致\n- 性格特质高度契合\n- 人格特质形成互补",
  
  "strengths": [
    {
      "title": "🤝 性格互补",
      "description": "你们都拥有高宜人性特质，这意味着你们都善于合作、乐于助人、愿意为对方着想。这是关系和谐的重要基础。"
    },
    {
      "title": "😌 情绪稳定",
      "description": "你们都拥有较强的情绪稳定性，不易焦虑或情绪波动。这为关系的长期稳定奠定了良好基础。"
    },
    {
      "title": "🎯 价值观契合",
      "description": "你们在家庭、事业、金钱等核心价值观上高度一致。这减少了未来重大决策时的潜在冲突。"
    }
  ],
  
  "complementarities": [
    {
      "title": "🎭 性格互补",
      "description": "一方偏外向，一方偏内向，这种组合可以形成很好的平衡：外向的一方可以带动社交活动，内向的一方可以提供稳定的内在支持。",
      "complement_type": "extraversion"
    }
  ],
  
  "challenges": [
    {
      "title": "🎨 兴趣差异",
      "description": "你们的兴趣爱好重叠度不高，可能需要花时间培养共同爱好。",
      "severity": "low",
      "suggestion": "建议尝试一起探索新的活动，找到共同的兴趣点。"
    }
  ],
  
  "suggestions": [
    {
      "title": "深化价值观认同",
      "description": "你们的价值观高度一致，建议多讨论未来的人生规划，进一步加深理解。"
    }
  ]
}
```

---

## 伪代码实现

### 完整匹配流程

```python
class MatchingAlgorithmV2:
    """
    心动投递核心匹配算法 V2.0
    分层匹配 + 动态权重 + 互补性分析 + 长期关系预测
    """
    
    def __init__(self):
        self.hard_filter = HardFilter()
        self.core_matcher = CoreDimensionMatcher()
        self.compatibility_scorer = CompatibilityScorer()
        self.complementarity_analyzer = ComplementarityAnalyzer()
        self.stability_predictor = RelationshipStabilityPredictor()
        self.explanation_generator = MatchExplanationGenerator()
    
    def match(self, user, candidate_pool, top_n=10):
        """
        完整匹配流程
        """
        # 第一层：硬过滤
        filtered_pool = self.hard_filter.filter(user, candidate_pool)
        
        # 计算动态权重
        dynamic_weights = self.calculate_dynamic_weights(user)
        
        # 对每个候选人进行完整评估
        match_results = []
        
        for candidate in filtered_pool:
            # 第二层：核心维度匹配
            core_match = self.core_matcher.match(
                user, 
                candidate, 
                weights=dynamic_weights
            )
            
            # 第三层：兼容性评分
            compatibility = self.compatibility_scorer.score(user, candidate)
            
            # 第四层：互补性分析
            complementarity = self.complementarity_analyzer.analyze(user, candidate)
            
            # 长期关系预测
            stability_prediction = self.stability_predictor.predict(user, candidate)
            
            # 综合评分
            total_score = self.calculate_total_score(
                core_match,
                compatibility,
                complementarity,
                stability_prediction,
                dynamic_weights
            )
            
            # 生成匹配解释
            explanation = self.explanation_generator.generate_explanation(
                user, 
                candidate, 
                {
                    'core_match': core_match,
                    'compatibility': compatibility,
                    'complementarity': complementarity,
                    'stability_prediction': stability_prediction,
                    'total_score': total_score
                }
            )
            
            match_results.append({
                'candidate': candidate,
                'total_score': total_score,
                'core_match': core_match,
                'compatibility': compatibility,
                'complementarity': complementarity,
                'stability_prediction': stability_prediction,
                'explanation': explanation
            })
        
        # 排序并返回Top N
        match_results.sort(key=lambda x: x['total_score'], reverse=True)
        
        return match_results[:top_n]
    
    def calculate_dynamic_weights(self, user):
        """
        计算动态权重
        """
        weights = DynamicWeightCalculator().calculate(user)
        return weights
    
    def calculate_total_score(self, core_match, compatibility, complementarity, 
                              stability_prediction, weights):
        """
        计算综合评分
        """
        total = (
            core_match['score'] * weights['core'] +
            compatibility['score'] * weights['compatibility'] +
            complementarity['bonus'] +
            stability_prediction['stability_score'] * weights['stability']
        )
        
        # 应用稳定性调整
        if stability_prediction['prediction'] == 'low_stability':
            total *= 0.85  # 低稳定性惩罚
        
        return min(100, max(0, total))
```

### 硬过滤器实现

```python
class HardFilter:
    """
    第一层：硬过滤器
    排除存在根本性冲突的候选人
    """
    
    def __init__(self):
        self.rules = [
            MarriageIntentionRule(),
            ChildIntentionRule(),
            ReligionRule(),
            LocationRule(),
            AgePreferenceRule(),
            LifestyleRule()
        ]
    
    def filter(self, user, candidate_pool):
        """
        应用所有硬过滤规则
        """
        filtered = []
        
        for candidate in candidate_pool:
            # 检查所有硬过滤规则
            passed = True
            warnings = []
            
            for rule in self.rules:
                result = rule.check(user, candidate)
                
                if not result['passed']:
                    passed = False
                    break
                
                if result.get('warning'):
                    warnings.append(result['warning'])
            
            if passed:
                filtered.append({
                    'candidate': candidate,
                    'warnings': warnings
                })
        
        return filtered
```

### 核心维度匹配器实现

```python
class CoreDimensionMatcher:
    """
    第二层：核心维度匹配器
    评估价值观和人格特质的核心匹配度
    """
    
    def match(self, user, candidate, weights=None):
        """
        执行核心维度匹配
        """
        if weights is None:
            weights = {
                'values': 0.35,
                'personality': 0.40,
                'family': 0.15,
                'life_goal': 0.10
            }
        
        # 价值观匹配
        value_match = self.calculate_value_match(user, candidate)
        
        # 人格匹配
        personality_match = self.calculate_personality_match(user, candidate)
        
        # 家庭观念匹配
        family_match = self.calculate_family_match(user, candidate)
        
        # 人生目标匹配
        life_goal_match = self.calculate_life_goal_match(user, candidate)
        
        # 加权平均
        total_score = (
            value_match * weights['values'] +
            personality_match * weights['personality'] +
            family_match * weights['family'] +
            life_goal_match * weights['life_goal']
        )
        
        return {
            'score': total_score,
            'value_match': value_match,
            'personality_match': personality_match,
            'family_match': family_match,
            'life_goal_match': life_goal_match,
            'details': {
                'values': self.get_value_match_details(user, candidate),
                'personality': self.get_personality_match_details(user, candidate)
            }
        }
    
    def calculate_value_match(self, user, candidate):
        """
        计算价值观匹配度
        """
        # 实现价值观匹配逻辑
        # ...
        pass
    
    def calculate_personality_match(self, user, candidate):
        """
        计算人格匹配度
        基于大五人格理论
        """
        # 实现人格匹配逻辑
        # ...
        pass
```

### 兼容性评分器实现

```python
class CompatibilityScorer:
    """
    第三层：兼容性评分器
    评估生活方式和兴趣爱好的兼容性
    """
    
    def score(self, user, candidate):
        """
        计算兼容性评分
        """
        # 生活方式匹配
        lifestyle_score = self.calculate_lifestyle_match(user, candidate)
        
        # 兴趣爱好匹配
        interest_score = self.calculate_interest_match(user, candidate)
        
        # 沟通风格匹配
        communication_score = self.calculate_communication_match(user, candidate)
        
        # 冲突处理风格匹配
        conflict_style_score = self.calculate_conflict_style_match(user, candidate)
        
        # 加权平均
        total_score = (
            lifestyle_score * 0.30 +
            interest_score * 0.25 +
            communication_score * 0.25 +
            conflict_style_score * 0.20
        )
        
        return {
            'score': total_score,
            'lifestyle_score': lifestyle_score,
            'interest_score': interest_score,
            'communication_score': communication_score,
            'conflict_style_score': conflict_style_score
        }
```

### 互补性分析器实现

```python
class ComplementarityAnalyzer:
    """
    第四层：互补性分析器
    分析特定维度的互补性价值
    """
    
    def analyze(self, user, candidate):
        """
        分析互补性
        """
        bonus = 0
        complementarities = []
        
        # 外向性互补
        extraversion_comp = self.analyze_extraversion_complement(user, candidate)
        if extraversion_comp['is_complementary']:
            bonus += extraversion_comp['bonus']
            complementarities.append(extraversion_comp)
        
        # 开放性-尽责性互补
        oc_comp = self.analyze_openness_conscientiousness_complement(user, candidate)
        if oc_comp['is_complementary']:
            bonus += oc_comp['bonus']
            complementarities.append(oc_comp)
        
        # 理性-感性互补
        tf_comp = self.analyze_thinking_feeling_complement(user, candidate)
        if tf_comp['is_complementary']:
            bonus += tf_comp['bonus']
            complementarities.append(tf_comp)
        
        # 高神经质-高宜人性互补
        na_comp = self.analyze_neuroticism_agreeableness_complement(user, candidate)
        if na_comp['is_complementary']:
            bonus += na_comp['bonus']
            complementarities.append(na_comp)
        
        return {
            'bonus': bonus,
            'complementarities': complementarities,
            'total_complementary_dimensions': len(complementarities)
        }
```

---

## 心理学研究依据

### 核心参考文献

#### 1. 人格特质与关系质量

- **Robins, R. W., Caspi, A., & Moffitt, T. E. (2000)**. Two personalities, one relationship: Disagreement between partners matters. *Journal of Personality and Social Psychology*, 79(3), 477-492.
  - **关键发现**: 宜人性是最重要的关系保护因子，低宜人性与关系满意度负相关

- **Karney, B. R., & Bradbury, T. N. (1995)**. The longitudinal course of marital quality and stability: A review of theory, method, and research. *Psychological Bulletin*, 118(1), 3-34.
  - **关键发现**: 双方高神经质是婚姻不稳定的最强预测因子

#### 2. 相似性与关系成功

- **Luo, S., & Klohnen, E. C. (2005)**. Assortative mating and marital quality: A dyadic approach. *Journal of Personality and Social Psychology*, 88(2), 304-316.
  - **关键发现**: 价值观相似性是最强的关系预测因子之一

- **Humbad, M. N., Donnellan, M. B., Iacono, W. G., McGue, M., & Burt, S. A. (2010)**. Is spousal similarity for personality a matter of convergence or selection? *Journal of Personality and Social Psychology*, 99(4), 686-698.
  - **关键发现**: 适度的人格差异可能带来关系满意度

#### 3. 依恋理论

- **Hazan, C., & Shaver, P. (1987)**. Romantic love conceptualized as an attachment process. *Journal of Personality and Social Psychology*, 52(3), 511-524.
  - **关键发现**: 安全型依恋配对的关系最稳定

- **Mikulincer, M., & Shaver, P. R. (2007)**. *Attachment in adulthood: Structure, dynamics, and change*. Guilford Press.
  - **关键发现**: 焦虑-回避型依恋配对容易形成"追逐-逃避"循环

#### 4. 关系预测模型

- **Gottman, J. M. (1994)**. *What predicts divorce? The relationship between marital processes and marital outcomes*. Lawrence Erlbaum Associates.
  - **关键发现**: 沟通风格和冲突处理方式是关系成功的关键预测因子

- **Finkel, E. J., Hui, C. M., Carswell, K. L., & Larson, G. M. (2014)**. The suffocation of marriage: Climbing Mount Maslow without enough oxygen. *Psychological Inquiry*, 25(1), 1-41.
  - **关键发现**: 目标一致是关系成功的基础

#### 5. 价值观与关系

- **Schwartz, S. H. (1992)**. Universals in the content and structure of values: Theoretical advances and empirical tests in 20 countries. *Advances in Experimental Social Psychology*, 25, 1-65.
  - **关键发现**: 价值观包含家庭、事业、金钱等多个维度

- **Gaunt, R. (2006)**. Couple similarity and marital satisfaction: Are similar spouses happier? *Journal of Personality*, 74(5), 1401-1420.
  - **关键发现**: 价值观相似性比兴趣相似性更重要

#### 6. 冲突与关系稳定性

- **Gottman, J. M., & Levenson, R. W. (1992)**. Marital processes predictive of later dissolution: Behavior, physiology, and health. *Journal of Personality and Social Psychology*, 63(2), 221-233.
  - **关键发现**: 冲突处理风格预测关系稳定性

---

## 总结

### 算法优势

1. **科学性**: 基于心理学研究，避免主观臆断
2. **分层过滤**: 提高效率，避免无效匹配
3. **动态权重**: 个性化匹配策略
4. **互补性**: 不仅看相似，也看互补
5. **可解释**: 告诉用户为什么匹配
6. **预测性**: 预测长期关系稳定性

### 实施建议

1. **数据收集**: 确保用户资料完整，特别是人格测试结果
2. **迭代优化**: 根据实际匹配效果反馈，调整权重和规则
3. **A/B测试**: 对比新旧算法，验证改进效果
4. **用户反馈**: 收集用户对匹配结果的满意度反馈

### 未来优化方向

1. **机器学习**: 引入机器学习模型，从历史数据中学习最优权重
2. **行为数据**: 考虑用户的行为数据（如聊天记录），优化匹配
3. **时间维度**: 考虑关系发展阶段，动态调整匹配策略
4. **文化因素**: 考虑文化差异，调整匹配规则

---

**文档版本**: 2.0  
**创建日期**: 2026-03-18  
**作者**: AI推荐系统专家  
**状态**: 完成
