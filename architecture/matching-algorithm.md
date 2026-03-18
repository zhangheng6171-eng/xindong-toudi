# 心动投递 - 匹配算法设计

## 概述

本文档描述"心动投递"平台的核心匹配算法设计，包括价值观匹配、兴趣匹配、行为分析三个维度，以及每周定时匹配任务的调度逻辑。

---

## 一、匹配维度与权重

### 1.1 三大核心维度

| 维度 | 权重 | 说明 |
|------|------|------|
| 价值观匹配 | 40% | 核心价值观、人生观、婚恋观 |
| 兴趣匹配 | 30% | 兴趣爱好、生活方式、娱乐偏好 |
| 性格匹配 | 30% | 性格特质、沟通方式、情感表达 |

### 1.2 问题分类映射

```typescript
const questionCategories = {
  values: [
    '婚姻观', '家庭观', '事业观', '金钱观', '宗教信仰'
  ],
  interests: [
    '兴趣爱好', '旅行偏好', '美食偏好', '娱乐方式', '运动习惯'
  ],
  personality: [
    '性格特质', '社交风格', '情绪表达', '沟通方式', '决策风格'
  ]
};
```

---

## 二、价值观匹配算法

### 2.1 核心思路

价值观匹配采用**相似度计算 + 互补性加权**的方式：
- 核心价值观（如婚姻观）强调**相似性**
- 次要价值观（如生活节奏）允许**互补性**

### 2.2 相似度计算（余弦相似度）

```python
def calculate_similarity(user_a_answers: dict, user_b_answers: dict) -> float:
    """
    计算两个用户答案的相似度
    使用余弦相似度或加权欧氏距离
    """
    common_questions = set(user_a_answers.keys()) & set(user_b_answers.keys())
    
    if not common_questions:
        return 0.0
    
    # 构建答案向量
    vector_a = []
    vector_b = []
    
    for question_id in common_questions:
        # 将答案转换为数值向量
        vec_a = answer_to_vector(user_a_answers[question_id])
        vec_b = answer_to_vector(user_b_answers[question_id])
        vector_a.extend(vec_a)
        vector_b.extend(vec_b)
    
    # 计算余弦相似度
    similarity = cosine_similarity(vector_a, vector_b)
    return similarity

def cosine_similarity(a: list, b: list) -> float:
    """余弦相似度计算"""
    import numpy as np
    a = np.array(a)
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

### 2.3 单选题匹配（加权匹配）

```python
def match_single_choice(answer_a: str, answer_b: str, weight: float, is_core: bool) -> float:
    """
    单选题匹配
    - is_core: 是否为核心问题（核心问题要求完全匹配）
    """
    if answer_a == answer_b:
        return weight  # 完全匹配，得满分
    
    if is_core:
        return 0  # 核心价值观问题，不匹配则得0分
    
    # 非核心问题，根据答案相似度给部分分
    similarity = get_answer_similarity(answer_a, answer_b)
    return weight * similarity * 0.5

def get_answer_similarity(answer_a: str, answer_b: str) -> float:
    """
    根据预设的答案相似度矩阵计算
    例如："早睡早起" vs "晚睡晚起" = 0.3
    """
    similarity_matrix = {
        ('早睡早起', '晚睡晚起'): 0.3,
        ('早睡早起', '作息不规律'): 0.2,
        # ... 更多预设规则
    }
    return similarity_matrix.get((answer_a, answer_b), 
                                  similarity_matrix.get((answer_b, answer_a), 0.5))
```

### 2.4 多选题匹配（Jaccard 相似度）

```python
def match_multiple_choice(choices_a: list, choices_b: list, weight: float) -> float:
    """
    多选题匹配，使用 Jaccard 相似度
    J(A,B) = |A ∩ B| / |A ∪ B|
    """
    set_a = set(choices_a)
    set_b = set(choices_b)
    
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    
    if union == 0:
        return 0
    
    jaccard = intersection / union
    return jaccard * weight
```

### 2.5 量表题匹配（距离归一化）

```python
def match_scale(value_a: int, value_b: int, scale_range: tuple = (1, 10), weight: float = 1.0) -> float:
    """
    量表题匹配
    1-10 量表，距离越小相似度越高
    """
    min_val, max_val = scale_range
    range_val = max_val - min_val
    
    distance = abs(value_a - value_b)
    similarity = 1 - (distance / range_val)
    
    return similarity * weight
```

### 2.6 价值观总分计算

```python
def calculate_values_score(user_a: User, user_b: User, questions: list) -> float:
    """
    计算价值观维度总匹配分
    """
    total_score = 0
    total_weight = 0
    
    for question in questions:
        if question.category != 'values':
            continue
        
        answer_a = get_answer(user_a.id, question.id)
        answer_b = get_answer(user_b.id, question.id)
        
        if not answer_a or not answer_b:
            continue
        
        # 根据题型选择匹配方法
        match_score = 0
        if question.type == 'single_choice':
            match_score = match_single_choice(
                answer_a['choice'], 
                answer_b['choice'],
                question.weight,
                question.is_core
            )
        elif question.type == 'multiple_choice':
            match_score = match_multiple_choice(
                answer_a['choices'],
                answer_b['choices'],
                question.weight
            )
        elif question.type == 'scale':
            match_score = match_scale(
                answer_a['value'],
                answer_b['value'],
                weight=question.weight
            )
        
        total_score += match_score
        total_weight += question.weight
    
    # 归一化到 0-100
    if total_weight == 0:
        return 0
    
    return (total_score / total_weight) * 100
```

---

## 三、兴趣匹配算法

### 3.1 基于标签的兴趣匹配

```python
def calculate_interests_score(user_a: User, user_b: User) -> float:
    """
    兴趣匹配：基于标签的匹配度计算
    """
    # 从问卷中提取兴趣标签
    tags_a = extract_interest_tags(user_a)
    tags_b = extract_interest_tags(user_b)
    
    # 计算共同标签比例
    common_tags = tags_a & tags_b
    all_tags = tags_a | tags_b
    
    if not all_tags:
        return 50  # 无标签数据，返回中等分数
    
    jaccard = len(common_tags) / len(all_tags)
    
    # 转换为 0-100 分
    return jaccard * 100

def extract_interest_tags(user: User) -> set:
    """
    从用户问卷答案中提取兴趣标签
    """
    tags = set()
    
    # 从多选题答案中提取
    interests_questions = get_questions_by_category('interests')
    
    for question in interests_questions:
        answer = get_answer(user.id, question.id)
        if not answer:
            continue
        
        if question.type == 'multiple_choice':
            tags.update(answer.get('choices', []))
        elif question.type == 'single_choice':
            tags.add(answer.get('choice'))
    
    # 从开放文本中提取（NLP）
    for text_answer in get_text_answers(user.id, 'interests'):
        extracted = nlp_extract_tags(text_answer)
        tags.update(extracted)
    
    return tags
```

### 3.2 兴趣强度加权

```python
def calculate_weighted_interests(user_a: User, user_b: User) -> float:
    """
    考虑兴趣强度的匹配
    例如：都喜欢旅行，但一个是"狂热"，一个是"一般"
    """
    interest_weights = {
        '喜欢': 1.0,
        '非常喜欢': 1.5,
        '一般': 0.5,
        '不喜欢': -0.5
    }
    
    # 兴趣-强度字典
    interests_a = get_interest_intensity(user_a)
    interests_b = get_interest_intensity(user_b)
    
    common_interests = set(interests_a.keys()) & set(interests_b.keys())
    
    total_score = 0
    max_score = 0
    
    for interest in common_interests:
        intensity_a = interest_weights.get(interests_a[interest], 1.0)
        intensity_b = interest_weights.get(interests_b[interest], 1.0)
        
        # 强度相乘，双向喜欢的加分更多
        score = intensity_a * intensity_b
        total_score += score
    
    # 归一化
    max_possible = len(common_interests) * 2.25  # 1.5 * 1.5
    return (total_score / max_possible * 100) if max_possible > 0 else 0
```

---

## 四、性格匹配算法

### 4.1 基于 MBTI 的性格匹配

```python
def calculate_mbti_compatibility(user_a: User, user_b: User) -> float:
    """
    基于 MBTI 的性格匹配度
    参考 MBTI 官方兼容性表
    """
    mbti_a = calculate_mbti(user_a)
    mbti_b = calculate_mbti(user_b)
    
    # MBTI 兼容性矩阵（示例）
    compatibility_matrix = {
        ('INTJ', 'ENFP'): 95,  # 完美搭配
        ('INTJ', 'INFP'): 85,
        ('INTJ', 'INTJ'): 70,  # 同类型，可能缺乏互补
        # ... 完整矩阵
    }
    
    score = compatibility_matrix.get((mbti_a, mbti_b),
            compatibility_matrix.get((mbti_b, mbti_a), 50))
    
    return score

def calculate_mbti(user: User) -> str:
    """
    从问卷答案推断 MBTI 类型
    """
    # E/I 维度
    ei = 'E' if is_extroverted(user) else 'I'
    # S/N 维度
    sn = 'S' if is_sensing(user) else 'N'
    # T/F 维度
    tf = 'T' if is_thinking(user) else 'F'
    # J/P 维度
    jp = 'J' if is_judging(user) else 'P'
    
    return ei + sn + tf + jp
```

### 4.2 性格特质向量匹配

```python
def calculate_personality_vector(user: User) -> dict:
    """
    计算用户性格特质向量
    基于大五人格模型（OCEAN）
    """
    return {
        'openness': score_openness(user),          # 开放性
        'conscientiousness': score_conscientiousness(user),  # 尽责性
        'extraversion': score_extraversion(user),  # 外向性
        'agreeableness': score_agreeableness(user), # 宜人性
        'neuroticism': score_neuroticism(user)     # 神经质
    }

def match_personality_vectors(user_a: User, user_b: User) -> float:
    """
    基于性格向量的匹配
    """
    vec_a = calculate_personality_vector(user_a)
    vec_b = calculate_personality_vector(user_b)
    
    # 转换为数值向量
    a = [vec_a[k] for k in sorted(vec_a.keys())]
    b = [vec_b[k] for k in sorted(vec_b.keys())]
    
    # 使用 Pearson 相关系数
    correlation = pearson_correlation(a, b)
    
    # 外向-内向偏好互补
    if (vec_a['extraversion'] > 60 and vec_b['extraversion'] < 40) or \
       (vec_a['extraversion'] < 40 and vec_b['extraversion'] > 60):
        # 性格互补，加分
        correlation += 0.1
    
    # 归一化到 0-100
    return max(0, min(100, (correlation + 1) * 50))
```

### 4.3 沟通风格匹配

```python
def match_communication_style(user_a: User, user_b: User) -> float:
    """
    沟通风格匹配
    """
    style_a = get_communication_style(user_a)
    style_a = get_communication_style(user_b)
    
    # 沟通风格：直接/间接、理性/感性、主动/被动
    compatibility = {
        ('直接', '直接'): 70,
        ('直接', '间接'): 80,  # 互补可能更好
        ('间接', '间接'): 75,
        ('理性', '理性'): 65,
        ('理性', '感性'): 85,  # 互补
        ('感性', '感性'): 70,
    }
    
    score = 0
    for dimension in ['表达方式', '情感表达', '冲突处理']:
        style_a_val = style_a[dimension]
        style_b_val = style_a[dimension]
        score += compatibility.get((style_a_val, style_b_val), 
                compatibility.get((style_b_val, style_a_val), 70))
    
    return score / 3
```

---

## 五、综合匹配算法

### 5.1 总分计算

```python
def calculate_total_match_score(user_a: User, user_b: User) -> MatchResult:
    """
    计算综合匹配分数
    """
    # 1. 价值观匹配
    values_score = calculate_values_score(user_a, user_b)
    
    # 2. 兴趣匹配
    interests_score = calculate_weighted_interests(user_a, user_b)
    
    # 3. 性格匹配
    personality_score = match_personality_vectors(user_a, user_b)
    
    # 4. 获取用户偏好权重
    weights = get_user_match_weights(user_a)
    # 默认权重：values=0.4, interests=0.3, personality=0.3
    
    # 5. 计算加权总分
    total_score = (
        values_score * weights['values'] +
        interests_score * weights['interests'] +
        personality_score * weights['personality']
    )
    
    # 6. 生成匹配理由
    match_reasons = generate_match_reasons(user_a, user_b, {
        'values': values_score,
        'interests': interests_score,
        'personality': personality_score
    })
    
    return MatchResult(
        total_score=total_score,
        values_score=values_score,
        interests_score=interests_score,
        personality_score=personality_score,
        match_reasons=match_reasons
    )
```

### 5.2 匹配理由生成

```python
def generate_match_reasons(user_a: User, user_b: User, scores: dict) -> list:
    """
    自动生成匹配理由文案
    """
    reasons = []
    
    # 价值观相似
    if scores['values'] >= 80:
        common_values = find_common_values(user_a, user_b)
        reasons.append(f"价值观相似：{', '.join(common_values[:2])}")
    
    # 共同兴趣
    common_interests = find_common_interests(user_a, user_b)
    if common_interests:
        reasons.append(f"都喜欢：{', '.join(common_interests[:3])}")
    
    # 性格互补
    if is_complementary_personality(user_a, user_b):
        reasons.append("性格互补，相处融洽")
    
    # 生活习惯接近
    if has_similar_lifestyle(user_a, user_b):
        reasons.append("生活习惯接近")
    
    # 默认理由
    if not reasons:
        reasons.append("综合匹配度高")
    
    return reasons[:5]  # 最多返回5条理由
```

---

## 六、过滤与优先级

### 6.1 硬过滤条件

```python
def apply_hard_filters(user: User, candidates: list) -> list:
    """
    应用硬性过滤条件
    """
    filtered = []
    
    for candidate in candidates:
        # 1. 性别偏好
        if not gender_match(user, candidate):
            continue
        
        # 2. 年龄范围
        if not age_in_range(user, candidate):
            continue
        
        # 3. 城市偏好
        if not city_match(user, candidate):
            continue
        
        # 4. 已匹配过
        if already_matched(user, candidate):
            continue
        
        # 5. 已拉黑
        if is_blocked(user, candidate):
            continue
        
        # 6. 用户状态
        if candidate.status != 'active':
            continue
        
        filtered.append(candidate)
    
    return filtered
```

### 6.2 软过滤条件（降权）

```python
def apply_soft_filters(user: User, candidates: list) -> list:
    """
    应用软性过滤条件（降低权重，不完全排除）
    """
    for candidate in candidates:
        penalty = 0
        
        # 距离较远
        distance = calculate_distance(user.city, candidate.city)
        if distance > 100:  # km
            penalty += (distance - 100) / 10
        
        # 活跃度低
        days_inactive = get_days_since_active(candidate)
        if days_inactive > 7:
            penalty += days_inactive
        
        # 资料完整度低
        completeness = calculate_profile_completeness(candidate)
        if completeness < 0.7:
            penalty += (1 - completeness) * 20
        
        candidate.match_score = max(0, candidate.match_score - penalty)
    
    return sorted(candidates, key=lambda x: x.match_score, reverse=True)
```

---

## 七、每周匹配任务调度

### 7.1 定时任务流程

```python
async def weekly_matching_task():
    """
    每周匹配定时任务
    执行时间：每周一凌晨 2:00
    """
    # 1. 获取分布式锁
    lock = await acquire_lock('weekly_matching', ttl=3600)
    if not lock:
        return "任务已在执行中"
    
    try:
        # 2. 获取活跃用户列表
        active_users = get_active_users()
        
        # 3. 批量计算匹配
        week_start = get_week_start()
        
        for user in active_users:
            # 3.1 获取候选人
            candidates = get_candidates(user, active_users)
            
            # 3.2 应用过滤
            candidates = apply_hard_filters(user, candidates)
            
            # 3.3 计算匹配分数
            for candidate in candidates:
                result = calculate_total_match_score(user, candidate)
                candidate.match_result = result
            
            # 3.4 排序并取 Top N
            candidates.sort(key=lambda x: x.match_result.total_score, reverse=True)
            top_matches = candidates[:10]  # 每周最多10个匹配
            
            # 3.5 保存匹配记录
            for match in top_matches:
                save_weekly_match(
                    user_id=user.id,
                    matched_user_id=match.id,
                    week_start_date=week_start,
                    total_score=match.match_result.total_score,
                    values_score=match.match_result.values_score,
                    interests_score=match.match_result.interests_score,
                    personality_score=match.match_result.personality_score,
                    match_reasons=match.match_result.match_reasons
                )
            
            # 3.6 发送通知
            if top_matches:
                send_notification(user.id, 'weekly_match', {
                    'count': len(top_matches),
                    'top_score': top_matches[0].match_result.total_score
                })
        
        # 4. 记录任务执行
        save_task_record('weekly_matching', len(active_users))
        
    finally:
        await release_lock(lock)
    
    return f"本周匹配完成，共处理 {len(active_users)} 用户"
```

### 7.2 增量匹配（新用户）

```python
async def match_new_user(user_id: str):
    """
    新用户注册后的增量匹配
    """
    user = get_user(user_id)
    
    # 获取当前周的所有活跃用户
    active_users = get_active_users()
    
    # 过滤并计算
    candidates = apply_hard_filters(user, active_users)
    
    for candidate in candidates:
        result = calculate_total_match_score(user, candidate)
        
        # 双向检查：如果对方也应该匹配到新用户
        reverse_result = calculate_total_match_score(candidate, user)
        
        if result.total_score >= 70:  # 高质量匹配
            save_weekly_match(user, candidate, result)
        
        if reverse_result.total_score >= 70:
            save_weekly_match(candidate, user, reverse_result)
            send_notification(candidate.id, 'new_match', {
                'match_score': reverse_result.total_score
            })
```

### 7.3 定时任务调度配置

```typescript
// 使用 node-cron 或 agenda
import cron from 'node-cron';

// 每周一凌晨 2:00 执行
cron.schedule('0 2 * * 1', async () => {
  await weeklyMatchingTask();
});

// 每天凌晨 3:00 清理过期匹配
cron.schedule('0 3 * * *', async () => {
  await expireOldMatches();
});

// 每小时检查暗恋匹配
cron.schedule('0 * * * *', async () => {
  await checkMutualCrushes();
});
```

---

## 八、性能优化

### 8.1 缓存策略

```python
def get_user_match_vector(user_id: str) -> dict:
    """
    获取用户匹配向量（带缓存）
    """
    cache_key = f"match_vector:{user_id}"
    
    # 尝试从 Redis 获取
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # 计算并缓存
    user = get_user(user_id)
    vector = {
        'values': calculate_values_vector(user),
        'interests': extract_interest_tags(user),
        'personality': calculate_personality_vector(user)
    }
    
    # 缓存 1 小时
    redis.setex(cache_key, 3600, json.dumps(vector))
    
    return vector
```

### 8.2 批量计算优化

```python
async def batch_calculate_matches(users: list) -> dict:
    """
    批量计算匹配分数（矩阵运算优化）
    """
    # 使用 NumPy 进行矩阵运算
    import numpy as np
    
    # 构建用户特征矩阵
    feature_matrix = np.array([
        get_feature_vector(user) for user in users
    ])
    
    # 计算相似度矩阵（一次计算所有用户对）
    similarity_matrix = cosine_similarity(feature_matrix)
    
    return similarity_matrix
```

### 8.3 数据库查询优化

```sql
-- 使用物化视图预计算常用指标
CREATE MATERIALIZED VIEW mv_user_match_profiles AS
SELECT 
  u.id,
  u.gender,
  u.city,
  EXTRACT(YEAR FROM AGE(u.birthday)) AS age,
  u.gender_pref,
  u.min_age_pref,
  u.max_age_pref,
  -- 预计算兴趣标签
  (SELECT array_agg(answer_data->>'choice')
   FROM user_answers ua
   JOIN questions q ON ua.question_id = q.id
   WHERE ua.user_id = u.id AND q.category = 'interests'
  ) AS interest_tags
FROM users u
WHERE u.status = 'active';

-- 每天刷新
REFRESH MATERIALIZED VIEW mv_user_match_profiles;
```

---

## 九、算法评估与迭代

### 9.1 匹配质量指标

```python
def calculate_match_quality_metrics():
    """
    计算匹配质量指标
    """
    # 1. 双向匹配率
    mutual_rate = count_mutual_matches() / count_total_matches()
    
    # 2. 用户满意度（来自反馈）
    avg_satisfaction = get_average_match_rating()
    
    # 3. 聊天转化率
    chat_conversion = count_matches_with_chat() / count_total_matches()
    
    # 4. 匹配准确率（用户操作反馈）
    like_rate = count_liked_matches() / count_viewed_matches()
    
    return {
        'mutual_match_rate': mutual_rate,
        'average_satisfaction': avg_satisfaction,
        'chat_conversion_rate': chat_conversion,
        'like_rate': like_rate
    }
```

### 9.2 A/B 测试框架

```python
def get_algorithm_variant(user_id: str) -> str:
    """
    根据用户 ID 决定使用哪个算法变体
    """
    user_hash = hash(user_id) % 100
    
    if user_hash < 50:
        return 'control'  # 对照组（当前算法）
    else:
        return 'treatment'  # 实验组（新算法）

def calculate_match_score_with_variant(user_a, user_b, variant: str):
    """
    根据变体使用不同算法
    """
    if variant == 'control':
        return calculate_total_match_score(user_a, user_b)
    else:
        return calculate_total_match_score_v2(user_a, user_b)  # 新算法
```

---

## 十、系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端应用层                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Web App │  │ iOS App  │  │Android App│  │ 小程序   │       │
│  └────┬─────┘  └────┬─────┘  └────┬──────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼──────────────┼──────────────┘
        │             │             │              │
        └─────────────┴─────────────┴──────────────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │
                    │ (Next.js)   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐      ┌────▼────┐
   │ 认证服务 │       │ 匹配服务   │      │ 通知服务 │
   │         │       │           │      │         │
   └────┬────┘       └─────┬─────┘      └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌─────▼─────┐      ┌────▼────┐
   │PostgreSQL│       │   Redis   │      │ MQ/任务队列│
   │ (主数据库)│       │  (缓存)   │      │(Bull/BullMQ)│
   └──────────┘       └───────────┘      └─────────┘

        ┌─────────────────────────────────┐
        │         定时任务调度             │
        │  ┌──────────┐  ┌──────────┐    │
        │  │ 每周匹配  │  │暗恋检测   │    │
        │  └──────────┘  └──────────┘    │
        │  ┌──────────┐  ┌──────────┐    │
        │  │过期清理   │  │数据统计   │    │
        │  └──────────┘  └──────────┘    │
        └─────────────────────────────────┘
```

---

## 十一、部署建议

### 11.1 生产环境配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=xindongtoudi
      - POSTGRES_USER=...
      - POSTGRES_PASSWORD=...
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  # 定时任务 Worker
  worker:
    build: .
    command: npm run worker
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

### 11.2 监控告警

- **任务执行监控**: 定时任务失败告警
- **匹配质量监控**: 匹配率下降告警
- **性能监控**: API 响应时间、数据库查询慢日志
- **业务监控**: 新注册用户数、活跃用户数、匹配成功数

---

## 总结

本匹配算法设计涵盖：
1. **价值观匹配**: 余弦相似度 + 加权匹配
2. **兴趣匹配**: Jaccard 相似度 + 强度加权
3. **性格匹配**: 大五人格 + MBTI 兼容性
4. **综合评分**: 加权平均 + 理由生成
5. **定时任务**: 分布式锁 + 批量计算
6. **性能优化**: 缓存 + 矩阵运算 + 物化视图
7. **迭代机制**: A/B 测试 + 质量指标监控

算法可根据实际用户反馈持续优化迭代。
