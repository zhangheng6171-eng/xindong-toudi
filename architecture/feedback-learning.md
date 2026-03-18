# 基于用户反馈的匹配优化系统设计

> 版本：v1.0  
> 作者：系统架构师  
> 日期：2026-03-18

---

## 目录

1. [系统概述](#1-系统概述)
2. [反馈数据收集方案](#2-反馈数据收集方案)
3. [学习算法设计](#3-学习算法设计)
4. [个性化权重优化](#4-个性化权重优化)
5. [协同过滤实现](#5-协同过滤实现)
6. [A/B测试框架](#6-ab测试框架)
7. [伪代码实现](#7-伪代码实现)
8. [系统架构图](#8-系统架构图)

---

## 1. 系统概述

### 1.1 核心目标

构建一个能够从用户行为和反馈中持续学习、自我优化的匹配系统，实现：

- **精准匹配**：提高匹配质量，降低用户流失率
- **个性化推荐**：为每个用户定制匹配策略
- **持续进化**：通过反馈闭环不断优化算法

### 1.2 核心挑战

| 挑战 | 描述 | 解决方案 |
|------|------|----------|
| 稀疏性 | 反馈数据稀疏，大部分匹配无反馈 | 隐性反馈挖掘 + 冷启动策略 |
| 延迟性 | 长期反馈（如建立关系）滞后 | 多时间尺度建模 + 代理指标 |
| 偏差性 | 用户反馈存在选择偏差 | 倾向性评分 + 反事实推理 |
| 冷启动 | 新用户无历史数据 | 内容特征 + 群体推荐 |

### 1.3 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     反馈学习系统架构                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ 数据收集  │───▶│ 特征工程  │───▶│ 模型训练  │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │                               │                      │
│       ▼                               ▼                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ 反馈分析  │───▶│ 权重优化  │───▶│ 在线推理  │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │               │                 │                   │
│       └───────────────┴─────────────────┘                   │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │  A/B测试框架 │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 反馈数据收集方案

### 2.1 反馈类型设计

#### 2.1.1 显性反馈（Explicit Feedback）

```yaml
显性反馈类型:
  匹配评价:
    - 类型: 喜欢 / 不喜欢 / 跳过
    - 时机: 用户查看匹配对象后立即
    - 触发: 卡片滑动、按钮点击
    - 数据结构:
        user_id: string
        match_id: string
        action: like | dislike | skip
        timestamp: datetime
        context:
          view_duration: int  # 查看时长(秒)
          profile_completeness: float  # 查看资料完整度
          previous_actions: list  # 前3次操作序列
```

**UI设计要点：**
- 喜欢：右滑或点击"心动"按钮（带动画反馈）
- 不喜欢：左滑或点击"不合适"按钮
- 跳过：上滑或点击"暂不考虑"（允许稍后重新推荐）

#### 2.1.2 隐性反馈（Implicit Feedback）

```yaml
隐性反馈类型:
  互动行为:
    发起聊天:
      weight: 0.8
      signal: 强烈兴趣
      触发条件: 用户主动发送第一条消息
    
    回复速度:
      weight: 0.6
      signal: 积极程度
      计算: avg_reply_time < 5min → 高兴趣
    
    聊天频率:
      weight: 0.7
      signal: 持续兴趣
      计算: messages_per_day > 10 → 高兴趣
    
    聊天时长:
      weight: 0.5
      signal: 投入程度
      计算: total_chat_duration > 30min/day
    
    表情使用:
      weight: 0.4
      signal: 情感表达
      计算: emoji_ratio > 20% → 高兴趣
```

**数据埋点设计：**

```javascript
// 聊天事件埋点
const chatEvents = {
  // 消息发送
  MESSAGE_SENT: {
    sender_id: string,
    receiver_id: string,
    message_type: 'text' | 'image' | 'voice' | 'gift',
    timestamp: datetime,
    message_length: int,
    has_emoji: boolean
  },
  
  // 消息阅读
  MESSAGE_READ: {
    reader_id: string,
    sender_id: string,
    message_id: string,
    time_to_read: int,  // 毫秒
    timestamp: datetime
  },
  
  // 聊天会话
  CHAT_SESSION: {
    user_ids: [string, string],
    session_start: datetime,
    session_end: datetime,
    message_count: int,
    initiator_id: string,
    last_message_time: datetime
  }
};
```

#### 2.1.3 长期反馈（Long-term Feedback）

```yaml
长期反馈类型:
  关系进展:
    线下见面:
      weight: 1.0
      signal: 高度匹配
      收集方式: 用户主动标记 / 地理位置推断
      数据字段:
        - meeting_time: datetime
        - meeting_type: planned | casual
        - duration: int  # 分钟
        - user_satisfaction: 1-5  # 会后评价
    
    建立关系:
      weight: 1.0
      signal: 匹配成功
      触发: 双方确认"在一起"或持续互动>30天
      数据字段:
        - relationship_start: datetime
        - relationship_type: dating | friendship | ...
        - user_happiness: 1-5
    
    关系持续时间:
      weight: 动态
      signal: 匹配质量
      计算: relationship_duration_in_days
      衰减函数: score = base_score * (1 - e^(-duration/30))
```

**关系确认机制：**

```
┌─────────────────────────────────────┐
│         关系进展追踪流程              │
├─────────────────────────────────────┤
│                                      │
│  匹配成功                            │
│     │                                │
│     ▼                                │
│  [Day 3] 自动询问：聊得怎么样？        │
│     │                                │
│     ├─▶ "很好" → 标记为积极互动        │
│     ├─▶ "一般" → 降低推荐权重         │
│     └─▶ "不回复" → 等待下次触发        │
│                                      │
│  [Day 7] 检查聊天频率                 │
│     │                                │
│     ├─▶ 活跃 → 继续观察               │
│     └─▶ 冷淡 → 标记为低质量匹配        │
│                                      │
│  [Day 14] 询问：见过面吗？            │
│     │                                │
│     ├─▶ "见过" → 触发线下见面记录      │
│     └─▶ "没有" → 检查原因             │
│                                      │
│  [Day 30] 关系状态确认                │
│     │                                │
│     ├─▶ "在一起了" → 标记为成功案例    │
│     └─▶ "分开了" → 记录失败原因        │
│                                      │
└─────────────────────────────────────┘
```

### 2.2 数据存储设计

#### 2.2.1 反馈数据表

```sql
-- 用户显性反馈表
CREATE TABLE user_explicit_feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    match_user_id VARCHAR(64) NOT NULL,
    action VARCHAR(20) NOT NULL,  -- like, dislike, skip
    view_duration_seconds INT,
    profile_view_depth FLOAT,  -- 0.0-1.0 资料完整度
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_match (user_id, match_user_id),
    INDEX idx_created_at (created_at)
);

-- 用户隐性反馈表
CREATE TABLE user_implicit_feedback (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    match_user_id VARCHAR(64) NOT NULL,
    feedback_type VARCHAR(50) NOT NULL,  -- chat_initiated, reply_time, etc.
    feedback_value FLOAT NOT NULL,
    confidence FLOAT DEFAULT 1.0,  -- 置信度
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_match_type (user_id, match_user_id, feedback_type)
);

-- 长期关系表
CREATE TABLE user_relationships (
    id BIGSERIAL PRIMARY KEY,
    user_id_1 VARCHAR(64) NOT NULL,
    user_id_2 VARCHAR(64) NOT NULL,
    relationship_type VARCHAR(50),  -- dating, friendship, etc.
    start_date DATE,
    end_date DATE,
    end_reason VARCHAR(100),
    satisfaction_score FLOAT,  -- 用户评价
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (user_id_1, user_id_2),
    INDEX idx_start_date (start_date)
);

-- 匹配记录表
CREATE TABLE match_records (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    match_user_id VARCHAR(64) NOT NULL,
    match_score FLOAT NOT NULL,
    match_dimensions JSONB,  -- 各维度得分
    algorithm_version VARCHAR(20),
    experiment_id VARCHAR(50),  -- A/B测试ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_experiment (experiment_id)
);
```

#### 2.2.2 特征宽表

```sql
-- 用户匹配特征宽表（用于模型训练）
CREATE VIEW user_match_features AS
SELECT 
    m.user_id,
    m.match_user_id,
    m.match_score,
    m.match_dimensions->>'values' as dimension_scores,
    m.match_dimensions->>'weights' as dimension_weights,
    
    -- 用户特征
    u1.age as user_age,
    u1.gender as user_gender,
    u1.location as user_location,
    u1.signup_date as user_signup_date,
    u1.active_days as user_active_days,
    
    -- 匹配对象特征
    u2.age as match_age,
    u2.gender as match_gender,
    u2.location as match_location,
    
    -- 显性反馈
    COALESCE(e.action, 'no_action') as explicit_action,
    e.view_duration_seconds,
    
    -- 隐性反馈聚合
    COUNT(CASE WHEN i.feedback_type = 'chat_initiated' THEN 1 END) as chat_count,
    AVG(CASE WHEN i.feedback_type = 'reply_time' THEN i.feedback_value END) as avg_reply_time,
    SUM(CASE WHEN i.feedback_type = 'message_sent' THEN i.feedback_value END) as total_messages,
    
    -- 长期反馈
    CASE WHEN r.id IS NOT NULL THEN 1 ELSE 0 END as has_relationship,
    CASE WHEN r.start_date IS NOT NULL 
         THEN CURRENT_DATE - r.start_date 
         ELSE NULL END as relationship_duration,
    
    -- 标签
    CASE 
        WHEN e.action = 'like' OR COUNT(i.id) > 5 THEN 1  -- 正样本
        WHEN e.action = 'dislike' THEN 0  -- 负样本
        ELSE NULL  -- 未标注
    END as label,
    
    m.created_at as match_time
    
FROM match_records m
LEFT JOIN users u1 ON m.user_id = u1.id
LEFT JOIN users u2 ON m.match_user_id = u2.id
LEFT JOIN user_explicit_feedback e ON m.user_id = e.user_id AND m.match_user_id = e.match_user_id
LEFT JOIN user_implicit_feedback i ON m.user_id = i.user_id AND m.match_user_id = i.match_user_id
LEFT JOIN user_relationships r ON (m.user_id = r.user_id_1 AND m.match_user_id = r.user_id_2)
                               OR (m.user_id = r.user_id_2 AND m.match_user_id = r.user_id_1)

GROUP BY m.id, u1.id, u2.id, e.id, r.id;
```

### 2.3 数据质量保证

```yaml
数据质量检查:
  完整性检查:
    - 检查必填字段是否为空
    - 检查外键关联是否有效
    - 触发告警: 完整率 < 95%
  
  一致性检查:
    - 同一匹配的显性反馈和隐性反馈是否冲突
    - 例如: dislike 但 chat_count > 10 → 标记异常
  
  时效性检查:
    - 反馈数据的延迟是否超过阈值
    - 长期反馈是否及时更新
  
  噪声过滤:
    - 异常行为检测（刷量、机器人）
    - 用户ID黑名单过滤
    - IP地址聚合异常检测
```

---

## 3. 学习算法设计

### 3.1 反馈分析框架

#### 3.1.1 假阳性/假阴性识别

```python
class MatchQualityAnalyzer:
    """匹配质量分析器"""
    
    def analyze_match_errors(self, matches: List[Match]) -> ErrorAnalysis:
        """
        识别匹配系统的预测错误
        
        假阳性(False Positive): 匹配分高，但用户不喜欢
        假阴性(False Negative): 匹配分低，但用户喜欢
        """
        
        results = {
            'false_positives': [],
            'false_negatives': [],
            'true_positives': [],
            'true_negatives': []
        }
        
        for match in matches:
            predicted_score = match.match_score  # 预测的匹配分
            actual_outcome = self.get_actual_outcome(match)  # 实际结果
            
            # 定义阈值
            high_score_threshold = 0.7
            low_score_threshold = 0.3
            positive_outcome = actual_outcome in ['like', 'chat_active', 'relationship']
            
            if predicted_score >= high_score_threshold:
                if positive_outcome:
                    results['true_positives'].append(match)
                else:
                    results['false_positives'].append(match)  # 假阳性
            elif predicted_score <= low_score_threshold:
                if positive_outcome:
                    results['false_negatives'].append(match)  # 假阴性
                else:
                    results['true_negatives'].append(match)
        
        return ErrorAnalysis(
            fp_count=len(results['false_positives']),
            fn_count=len(results['false_negatives']),
            fp_rate=len(results['false_positives']) / (len(results['false_positives']) + len(results['true_positives']) + 1e-6),
            fn_rate=len(results['false_negatives']) / (len(results['false_negatives']) + len(results['true_negatives']) + 1e-6)
        )
```

#### 3.1.2 错误模式分析

```python
def analyze_failure_patterns(false_positives: List[Match]) -> FailurePatterns:
    """
    分析失败匹配的共同特征
    """
    
    patterns = {
        'dimension_failures': {},  # 各维度的失败率
        'feature_importance': {},  # 失败案例的特征重要性
        'user_segments': {}  # 用户群体的失败模式
    }
    
    for match in false_positives:
        # 分析各维度的失败贡献
        for dim, score in match.dimension_scores.items():
            if dim not in patterns['dimension_failures']:
                patterns['dimension_failures'][dim] = {'high_score_count': 0, 'total': 0}
            
            patterns['dimension_failures'][dim]['total'] += 1
            if score > 0.7:  # 高分但失败
                patterns['dimension_failures'][dim]['high_score_count'] += 1
    
    # 计算各维度的失败率
    for dim, stats in patterns['dimension_failures'].items():
        stats['failure_rate'] = stats['high_score_count'] / stats['total']
    
    # 使用决策树分析失败特征
    feature_importance = train_decision_tree(
        features=extract_features(false_positives),
        labels=[1] * len(false_positives),  # 失败标记
        comparison_group=true_positives  # 对照组
    )
    
    patterns['feature_importance'] = feature_importance
    
    return patterns
```

**常见失败模式示例：**

```yaml
失败模式识别结果示例:
  假阳性模式:
    模式1_价值观错配:
      特征: values_score > 0.8 但 action = dislike
      原因: 价值观维度权重过高，忽视了其他重要因素
      影响: 占假阳性案例的35%
    
    模式2_外貌偏好偏差:
      特征: 相似度评分高但无互动
      原因: 算法未充分考虑用户的外貌偏好
      影响: 占假阳性案例的28%
    
    模式3_地域忽视:
      特征: 地域相似度高但距离>50km
      原因: 地域维度计算不够精细
      影响: 占假阳性案例的20%
  
  假阴性模式:
    模式1_兴趣互补:
      特征: 兴趣相似度低但匹配成功
      原因: 忽视了互补性匹配
      影响: 占假阴性案例的40%
    
    模式2_性格互补:
      特征: 性格相似度<0.3但关系持续
      原因: 性格互补也很重要
      影响: 占假阴性案例的25%
```

### 3.2 在线学习算法

#### 3.2.1 多臂老虎机（MAB）权重优化

```python
import numpy as np
from typing import List, Dict

class MultiArmedBanditOptimizer:
    """
    使用MAB动态优化匹配维度权重
    每个维度是一个"臂"，调整权重是"拉杆"
    """
    
    def __init__(self, dimensions: List[str], alpha: float = 0.1):
        self.dimensions = dimensions
        self.alpha = alpha  # 学习率
        
        # 初始化每个维度的权重和统计量
        self.weights = {dim: 1.0 / len(dimensions) for dim in dimensions}
        self.successes = {dim: 1.0 for dim in dimensions}  # 成功次数
        self.failures = {dim: 1.0 for dim in dimensions}   # 失败次数
    
    def update(self, match_result: MatchResult):
        """
        根据匹配结果更新权重
        使用Thompson Sampling算法
        """
        
        for dim in self.dimensions:
            dim_score = match_result.dimension_scores.get(dim, 0.5)
            
            if match_result.is_positive():
                # 正反馈：该维度得分高时应该增加权重
                self.successes[dim] += dim_score * self.alpha
            else:
                # 负反馈：该维度得分高时应该降低权重
                self.failures[dim] += dim_score * self.alpha
        
        # 重新计算权重（Thompson Sampling）
        self._recompute_weights()
    
    def _recompute_weights(self):
        """基于Beta分布重新计算权重"""
        sampled_weights = {}
        for dim in self.dimensions:
            # 从Beta分布采样
            sample = np.random.beta(
                self.successes[dim],
                self.failures[dim]
            )
            sampled_weights[dim] = sample
        
        # 归一化
        total = sum(sampled_weights.values())
        self.weights = {k: v / total for k, v in sampled_weights.items()}
    
    def get_weights(self) -> Dict[str, float]:
        """获取当前权重"""
        return self.weights.copy()
```

#### 3.2.2 贝叶斯在线学习

```python
class BayesianOnlineLearner:
    """
    贝叶斯在线学习器
    维护权重的不确定性估计
    """
    
    def __init__(self, dimensions: List[str], prior_mean: float = 0.5, prior_var: float = 0.1):
        self.dimensions = dimensions
        
        # 每个维度的权重分布（正态分布）
        self.weight_means = {dim: prior_mean for dim in dimensions}
        self.weight_vars = {dim: prior_var for dim in dimensions}
        
        # 观测噪声
        self.observation_noise = 0.1
    
    def update(self, match_result: MatchResult):
        """
        贝叶斯更新
        后验 ∝ 似然 × 先验
        """
        
        for dim in self.dimensions:
            dim_score = match_result.dimension_scores.get(dim, 0.5)
            
            # 观测值（匹配结果）
            y = 1.0 if match_result.is_positive() else 0.0
            
            # 特征值
            x = dim_score
            
            # 贝叶斯更新公式
            prior_mean = self.weight_means[dim]
            prior_var = self.weight_vars[dim]
            
            # 后验方差: 1/σ²_post = 1/σ²_prior + x²/σ²_obs
            posterior_precision = 1.0 / prior_var + (x ** 2) / self.observation_noise
            posterior_var = 1.0 / posterior_precision
            
            # 后验均值: μ_post = σ²_post × (μ_prior/σ²_prior + xy/σ²_obs)
            posterior_mean = posterior_var * (
                prior_mean / prior_var + 
                x * y / self.observation_noise
            )
            
            self.weight_means[dim] = posterior_mean
            self.weight_vars[dim] = posterior_var
    
    def sample_weights(self) -> Dict[str, float]:
        """
        从后验分布采样权重
        用于探索和不确定性量化
        """
        sampled = {}
        for dim in self.dimensions:
            sampled[dim] = np.random.normal(
                self.weight_means[dim],
                np.sqrt(self.weight_vars[dim])
            )
        
        # 归一化并确保正数
        total = sum(max(0.01, w) for w in sampled.values())
        return {k: max(0.01, v) / total for k, v in sampled.items()}
```

### 3.3 反馈时间窗口处理

```python
class TimeDecayFeedbackAggregator:
    """
    时间衰减反馈聚合器
    不同类型的反馈有不同的时间衰减率
    """
    
    def __init__(self):
        self.decay_rates = {
            'explicit_like': 0.01,      # 显性喜欢：衰减很慢
            'explicit_dislike': 0.005,  # 显性不喜欢：衰减更慢（记住教训）
            'chat_initiated': 0.02,     # 发起聊天：较快衰减
            'chat_frequency': 0.03,     # 聊天频率：更快衰减
            'relationship': 0.001       # 长期关系：几乎不衰减
        }
    
    def aggregate_feedback(
        self, 
        feedbacks: List[Feedback],
        reference_time: datetime
    ) -> float:
        """
        聚合多个反馈，考虑时间衰减
        """
        
        total_score = 0.0
        total_weight = 0.0
        
        for feedback in feedbacks:
            # 计算时间衰减
            days_elapsed = (reference_time - feedback.timestamp).days
            decay_rate = self.decay_rates.get(feedback.type, 0.02)
            time_decay = np.exp(-decay_rate * days_elapsed)
            
            # 加权得分
            score = self._feedback_to_score(feedback)
            weight = time_decay * self._get_feedback_weight(feedback.type)
            
            total_score += score * weight
            total_weight += weight
        
        return total_score / (total_weight + 1e-6)
    
    def _feedback_to_score(self, feedback: Feedback) -> float:
        """将反馈转换为得分"""
        score_map = {
            'explicit_like': 1.0,
            'explicit_dislike': -1.0,
            'explicit_skip': 0.0,
            'chat_initiated': 0.8,
            'chat_no_response': -0.3,
            'relationship': 1.0,
            'breakup': -0.5
        }
        return score_map.get(feedback.type, 0.0)
    
    def _get_feedback_weight(self, feedback_type: str) -> float:
        """获取反馈类型的权重"""
        weight_map = {
            'explicit_like': 1.0,
            'explicit_dislike': 1.2,  # 负反馈权重更高
            'chat_initiated': 0.7,
            'chat_frequency': 0.5,
            'relationship': 1.5       # 长期反馈权重最高
        }
        return weight_map.get(feedback_type, 0.5)
```

---

## 4. 个性化权重优化

### 4.1 用户画像建模

```python
class UserProfile:
    """用户匹配偏好画像"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        
        # 全局权重（从群体学习）
        self.global_weights = None
        
        # 个性化权重（从个人历史学习）
        self.personalized_weights = None
        
        # 权重置信度（数据量越少，置信度越低）
        self.weight_confidence = 0.0
        
        # 用户特征
        self.features = {}
        
        # 历史统计
        self.stats = {
            'total_matches': 0,
            'positive_feedback': 0,
            'negative_feedback': 0,
            'avg_match_score': 0.0
        }
    
    def update_weights(self, new_weights: Dict[str, float], confidence: float):
        """
        更新个性化权重
        使用置信度加权混合
        """
        
        if self.personalized_weights is None:
            self.personalized_weights = new_weights
            self.weight_confidence = confidence
        else:
            # 加权混合：置信度越高，越信任个性化权重
            alpha = self.weight_confidence / (self.weight_confidence + confidence)
            
            self.personalized_weights = {
                dim: alpha * self.personalized_weights.get(dim, 0.5) + 
                     (1 - alpha) * new_weights.get(dim, 0.5)
                for dim in set(self.personalized_weights.keys()) | set(new_weights.keys())
            }
            
            # 更新置信度
            self.weight_confidence = min(1.0, self.weight_confidence + confidence * 0.1)
```

### 4.2 个性化权重学习

```python
class PersonalizedWeightLearner:
    """
    个性化权重学习器
    为每个用户学习专属的维度权重
    """
    
    def __init__(self, global_weights: Dict[str, float]):
        self.global_weights = global_weights
        self.user_profiles = {}  # user_id -> UserProfile
        self.min_samples = 10    # 最小样本数才启用个性化
    
    def learn_user_weights(self, user_id: str, history: List[MatchResult]) -> Dict[str, float]:
        """
        从用户历史学习个性化权重
        """
        
        profile = self.user_profiles.get(user_id, UserProfile(user_id))
        
        # 检查样本量是否足够
        if len(history) < self.min_samples:
            # 冷启动：使用全局权重或相似用户权重
            return self._cold_start_weights(user_id, profile)
        
        # 准备训练数据
        X = []  # 特征：各维度得分
        y = []  # 标签：匹配是否成功
        
        for match in history:
            feature_vector = [match.dimension_scores.get(dim, 0) for dim in self.global_weights.keys()]
            X.append(feature_vector)
            y.append(1 if match.is_positive() else 0)
        
        X = np.array(X)
        y = np.array(y)
        
        # 使用逻辑回归学习权重
        from sklearn.linear_model import LogisticRegression
        
        model = LogisticRegression(fit_intercept=False, penalty='l2', C=0.1)
        model.fit(X, y)
        
        # 提取权重并归一化
        learned_weights = {
            dim: max(0.01, w) 
            for dim, w in zip(self.global_weights.keys(), model.coef_[0])
        }
        
        total = sum(learned_weights.values())
        normalized_weights = {k: v / total for k, v in learned_weights.items()}
        
        # 计算置信度
        confidence = self._compute_confidence(len(history), model.score(X, y))
        
        # 更新用户画像
        profile.update_weights(normalized_weights, confidence)
        self.user_profiles[user_id] = profile
        
        return profile.personalized_weights
    
    def _cold_start_weights(self, user_id: str, profile: UserProfile) -> Dict[str, float]:
        """
        冷启动用户的权重处理
        """
        
        # 策略1: 基于用户特征调整全局权重
        if profile.features:
            adjusted_weights = self._adjust_by_features(self.global_weights, profile.features)
            return adjusted_weights
        
        # 策略2: 找到相似用户，使用其权重
        similar_users = self._find_similar_users(user_id)
        if similar_users:
            return self._aggregate_similar_weights(similar_users)
        
        # 策略3: 使用全局权重
        return self.global_weights.copy()
    
    def _adjust_by_features(
        self, 
        base_weights: Dict[str, float], 
        features: Dict[str, Any]
    ) -> Dict[str, float]:
        """
        根据用户特征调整权重
        """
        
        adjusted = base_weights.copy()
        
        # 示例规则
        if features.get('age', 0) < 25:
            # 年轻用户更看重兴趣
            adjusted['interest'] *= 1.3
            adjusted['values'] *= 0.8
        
        if features.get('is_new_user'):
            # 新用户更看重外貌
            adjusted['appearance'] *= 1.2
            adjusted['values'] *= 0.9
        
        if features.get('relationship_goal') == 'serious':
            # 寻找严肃关系的用户更看重价值观
            adjusted['values'] *= 1.4
            adjusted['appearance'] *= 0.8
        
        # 归一化
        total = sum(adjusted.values())
        return {k: v / total for k, v in adjusted.items()}
    
    def _compute_confidence(self, sample_size: int, accuracy: float) -> float:
        """计算权重的置信度"""
        # 样本量因子
        size_factor = 1 - np.exp(-sample_size / 50)
        # 准确率因子
        acc_factor = accuracy
        return size_factor * acc_factor
```

### 4.3 权重融合策略

```python
class WeightFusionStrategy:
    """
    权重融合策略
    结合全局权重、个性化权重、上下文权重
    """
    
    def __init__(self):
        self.fusion_weights = {
            'global': 0.3,      # 全局权重占比
            'personalized': 0.5, # 个性化权重占比
            'context': 0.2      # 上下文权重占比
        }
    
    def fuse_weights(
        self,
        global_weights: Dict[str, float],
        personalized_weights: Dict[str, float],
        context_weights: Dict[str, float],
        confidence: float
    ) -> Dict[str, float]:
        """
        融合多层权重
        """
        
        # 根据置信度调整融合比例
        # 置信度越高，个性化权重占比越大
        adjusted_fusion = {
            'global': self.fusion_weights['global'] * (1 - confidence * 0.5),
            'personalized': self.fusion_weights['personalized'] * (1 + confidence * 0.3),
            'context': self.fusion_weights['context']
        }
        
        # 归一化融合权重
        total_fusion = sum(adjusted_fusion.values())
        adjusted_fusion = {k: v / total_fusion for k, v in adjusted_fusion.items()}
        
        # 加权融合
        all_dims = set(global_weights.keys()) | set(personalized_weights.keys()) | set(context_weights.keys())
        
        fused = {}
        for dim in all_dims:
            fused[dim] = (
                adjusted_fusion['global'] * global_weights.get(dim, 0.5) +
                adjusted_fusion['personalized'] * personalized_weights.get(dim, 0.5) +
                adjusted_fusion['context'] * context_weights.get(dim, 0.5)
            )
        
        # 归一化
        total = sum(fused.values())
        return {k: v / total for k, v in fused.items()}
```

### 4.4 冷启动解决方案

```yaml
冷启动策略矩阵:
  
  新用户冷启动:
    策略1_特征映射:
      描述: 根据用户注册信息调整权重
      实现:
        - 年龄 < 25: 增加兴趣权重，降低价值观权重
        - 性格测试结果: 根据性格类型调整匹配策略
        - 注册目的: serious_relationship → 增加价值观权重
      效果: 比随机推荐提升20%点击率
    
    策略2_相似用户迁移:
      描述: 找到相似的老用户，借用其权重
      实现:
        - 计算用户相似度（基于人口统计、兴趣标签）
        - Top-K相似用户的加权平均权重
      效果: 比全局权重提升15%匹配质量
    
    策略3_快速探索:
      描述: 前几次推荐增加多样性
      实现:
        - 前10次推荐使用探索策略
        - 高权重的维度也推荐一些低分候选
        - 快速收集反馈调整权重
      效果: 7天内达到稳定权重
  
  新维度冷启动:
    策略:
      - 新增维度初始权重设为中等（0.5）
      - 观察期：收集1000次匹配反馈
      - 根据反馈调整权重
      - 与现有维度比较效果
  
  新地区冷启动:
    策略:
      - 使用相似地区的权重
      - 文化相似性映射
      - 本地化调整（如宗教、语言）
```

---

## 5. 协同过滤实现

### 5.1 用户相似度计算

```python
class UserSimilarityComputer:
    """
    用户相似度计算器
    用于协同过滤
    """
    
    def __init__(self):
        self.user_vectors = {}  # 用户向量（喜欢/不喜欢的匹配对象）
        self.similarity_cache = {}
    
    def compute_similarity(self, user_id_1: str, user_id_2: str) -> float:
        """
        计算两个用户的相似度
        基于"喜欢相似的匹配对象"
        """
        
        # 获取用户的喜欢/不喜欢向量
        vec1 = self._get_user_preference_vector(user_id_1)
        vec2 = self._get_user_preference_vector(user_id_2)
        
        if vec1 is None or vec2 is None:
            return 0.0
        
        # 计算余弦相似度
        from sklearn.metrics.pairwise import cosine_similarity
        
        similarity = cosine_similarity([vec1], [vec2])[0][0]
        
        # 缓存结果
        cache_key = tuple(sorted([user_id_1, user_id_2]))
        self.similarity_cache[cache_key] = similarity
        
        return similarity
    
    def _get_user_preference_vector(self, user_id: str) -> np.ndarray:
        """
        获取用户的偏好向量
        """
        
        # 从数据库查询用户的所有反馈
        feedbacks = self._query_user_feedbacks(user_id)
        
        if not feedbacks:
            return None
        
        # 构建向量：每个匹配对象一个维度
        # 值：like=1, dislike=-1, no_action=0
        all_users = self._get_all_matched_users(user_id)
        vector = []
        
        for other_user in all_users:
            feedback = feedbacks.get(other_user, 'no_action')
            if feedback == 'like':
                vector.append(1.0)
            elif feedback == 'dislike':
                vector.append(-1.0)
            else:
                vector.append(0.0)
        
        return np.array(vector)
    
    def find_similar_users(self, user_id: str, top_k: int = 10) -> List[Tuple[str, float]]:
        """
        找到相似的用户
        """
        
        similarities = []
        
        for other_user in self._get_all_users():
            if other_user == user_id:
                continue
            
            sim = self.compute_similarity(user_id, other_user)
            similarities.append((other_user, sim))
        
        # 排序并返回Top-K
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:top_k]
```

### 5.2 协同过滤推荐

```python
class CollaborativeFilteringRecommender:
    """
    协同过滤推荐器
    "喜欢相似匹配对象的用户可能互相喜欢"
    """
    
    def __init__(self, user_similarity_computer: UserSimilarityComputer):
        self.similarity_computer = user_similarity_computer
        self.min_similarity = 0.3  # 最小相似度阈值
    
    def recommend(
        self, 
        user_id: str, 
        candidate_pool: List[str],
        top_n: int = 10
    ) -> List[Tuple[str, float]]:
        """
        基于协同过滤的推荐
        
        核心思想：
        1. 找到与当前用户相似的用户
        2. 推荐这些相似用户喜欢的对象
        3. 过滤掉当前用户已经交互过的对象
        """
        
        # 找到相似用户
        similar_users = self.similarity_computer.find_similar_users(user_id, top_k=20)
        similar_users = [(u, s) for u, s in similar_users if s >= self.min_similarity]
        
        if not similar_users:
            return []
        
        # 获取当前用户已交互的对象（需要排除）
        interacted = self._get_interacted_users(user_id)
        
        # 聚合相似用户的喜欢对象
        candidate_scores = {}
        
        for similar_user, similarity in similar_users:
            # 获取该相似用户喜欢的对象
            liked_users = self._get_liked_users(similar_user)
            
            for liked_user in liked_users:
                # 排除已交互对象
                if liked_user in interacted:
                    continue
                
                # 排除候选池之外的对象
                if candidate_pool and liked_user not in candidate_pool:
                    continue
                
                # 累加相似度加权得分
                if liked_user not in candidate_scores:
                    candidate_scores[liked_user] = 0.0
                
                candidate_scores[liked_user] += similarity
        
        # 排序并返回Top-N
        recommendations = sorted(
            candidate_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:top_n]
        
        return recommendations
    
    def get_collaborative_score(self, user_id: str, candidate_id: str) -> float:
        """
        计算协同过滤得分
        用于与其他推荐信号融合
        """
        
        # 找到喜欢过candidate_id的用户
        users_who_liked = self._get_users_who_liked(candidate_id)
        
        # 计算当前用户与这些用户的相似度之和
        total_similarity = 0.0
        
        for other_user in users_who_liked:
            sim = self.similarity_computer.compute_similarity(user_id, other_user)
            total_similarity += sim
        
        # 归一化（假设最多10个相似用户）
        normalized_score = min(1.0, total_similarity / 10.0)
        
        return normalized_score
```

### 5.3 用户聚类

```python
class UserClusterer:
    """
    用户聚类器
    将用户分群，进行群体推荐
    """
    
    def __init__(self, n_clusters: int = 20):
        self.n_clusters = n_clusters
        self.cluster_model = None
        self.user_cluster_map = {}  # user_id -> cluster_id
        self.cluster_profiles = {}  # cluster_id -> 典型权重
    
    def fit(self, user_features: Dict[str, np.ndarray]):
        """
        训练聚类模型
        """
        
        from sklearn.cluster import KMeans
        
        # 准备特征矩阵
        user_ids = list(user_features.keys())
        feature_matrix = np.array([user_features[uid] for uid in user_ids])
        
        # 训练K-Means
        self.cluster_model = KMeans(
            n_clusters=self.n_clusters,
            random_state=42,
            n_init=10
        )
        
        cluster_labels = self.cluster_model.fit_predict(feature_matrix)
        
        # 保存用户-簇映射
        for user_id, cluster_id in zip(user_ids, cluster_labels):
            self.user_cluster_map[user_id] = int(cluster_id)
        
        # 计算每个簇的典型权重
        self._compute_cluster_profiles(user_features)
    
    def _compute_cluster_profiles(self, user_features: Dict[str, np.ndarray]):
        """
        计算每个簇的典型特征和推荐权重
        """
        
        for cluster_id in range(self.n_clusters):
            # 找到该簇的所有用户
            cluster_users = [
                uid for uid, cid in self.user_cluster_map.items() 
                if cid == cluster_id
            ]
            
            # 计算平均特征
            cluster_features = np.mean([
                user_features[uid] for uid in cluster_users
            ], axis=0)
            
            self.cluster_profiles[cluster_id] = {
                'center': cluster_features,
                'size': len(cluster_users),
                'user_ids': cluster_users
            }
    
    def get_cluster_recommendations(
        self, 
        user_id: str,
        exclude_interacted: List[str]
    ) -> List[Tuple[str, float]]:
        """
        基于用户群体的推荐
        """
        
        cluster_id = self.user_cluster_map.get(user_id)
        if cluster_id is None:
            return []
        
        cluster_profile = self.cluster_profiles[cluster_id]
        cluster_users = cluster_profile['user_ids']
        
        # 统计该群体喜欢的对象
        candidate_scores = {}
        
        for other_user in cluster_users:
            if other_user == user_id:
                continue
            
            liked_users = self._get_liked_users(other_user)
            for liked_user in liked_users:
                if liked_user not in exclude_interacted:
                    candidate_scores[liked_user] = candidate_scores.get(liked_user, 0) + 1
        
        # 归一化并排序
        total = sum(candidate_scores.values())
        recommendations = [
            (uid, score / total) 
            for uid, score in candidate_scores.items()
        ]
        recommendations.sort(key=lambda x: x[1], reverse=True)
        
        return recommendations[:10]
```

### 5.4 负反馈处理

```python
class NegativeFeedbackHandler:
    """
    负反馈处理器
    处理用户的dislike、跳过、冷互动等负反馈
    """
    
    def __init__(self):
        self.negative_feedback_weights = {
            'explicit_dislike': -1.0,      # 显性不喜欢
            'no_chat_response': -0.5,      # 对方不回复
            'chat_ended_early': -0.3,      # 聊夭折
            'unmatch': -0.8,               # 解除匹配
            'report': -2.0                 # 举报
        }
        
        self.negative_patterns = {}  # 用户 -> 负反馈模式
    
    def analyze_negative_pattern(self, user_id: str) -> Dict[str, Any]:
        """
        分析用户的负反馈模式
        """
        
        negative_feedbacks = self._get_user_negative_feedbacks(user_id)
        
        if not negative_feedbacks:
            return {'pattern': 'none', 'suggestions': []}
        
        # 分析负反馈的共同特征
        common_features = self._extract_common_features(negative_feedbacks)
        
        # 识别负反馈模式
        pattern = self._identify_pattern(common_features)
        
        # 生成调整建议
        suggestions = self._generate_suggestions(pattern)
        
        return {
            'pattern': pattern,
            'common_features': common_features,
            'suggestions': suggestions
        }
    
    def _identify_pattern(self, features: Dict[str, Any]) -> str:
        """
        识别负反馈模式
        """
        
        # 模式1: 对某类人群不感兴趣
        if features.get('age_range'):
            return 'age_preference_mismatch'
        
        # 模式2: 地域偏好问题
        if features.get('location'):
            return 'location_preference_mismatch'
        
        # 模式3: 职业偏好问题
        if features.get('occupation'):
            return 'occupation_preference_mismatch'
        
        # 模式4: 照片质量问题（喜欢后不聊）
        if features.get('photo_mismatch'):
            return 'expectation_mismatch'
        
        return 'unknown_pattern'
    
    def adjust_recommendations(
        self, 
        user_id: str,
        candidates: List[str],
        base_scores: Dict[str, float]
    ) -> Dict[str, float]:
        """
        根据负反馈模式调整推荐得分
        """
        
        negative_pattern = self.analyze_negative_pattern(user_id)
        pattern_type = negative_pattern['pattern']
        
        adjusted_scores = base_scores.copy()
        
        for candidate_id in candidates:
            candidate_features = self._get_candidate_features(candidate_id)
            
            # 根据模式调整得分
            if pattern_type == 'age_preference_mismatch':
                if self._age_mismatch(user_id, candidate_id, negative_pattern['common_features']):
                    adjusted_scores[candidate_id] *= 0.5
            
            elif pattern_type == 'location_preference_mismatch':
                if self._location_mismatch(user_id, candidate_id, negative_pattern['common_features']):
                    adjusted_scores[candidate_id] *= 0.6
            
            elif pattern_type == 'occupation_preference_mismatch':
                if self._occupation_mismatch(user_id, candidate_id, negative_pattern['common_features']):
                    adjusted_scores[candidate_id] *= 0.7
        
        return adjusted_scores
    
    def handle_negative_for_collaborative_filtering(
        self,
        user_id: str,
        disliked_user_id: str
    ):
        """
        处理协同过滤中的负反馈
        
        当用户不喜欢某人时：
        1. 降低与喜欢过该人的用户的相似度
        2. 更新用户偏好向量
        """
        
        # 找到喜欢过disliked_user_id的用户
        users_who_liked = self._get_users_who_liked(disliked_user_id)
        
        # 降低相似度
        for other_user in users_who_liked:
            self._reduce_similarity(user_id, other_user, factor=0.8)
        
        # 更新用户偏好向量
        self._update_preference_vector(user_id, disliked_user_id, 'dislike')
```

---

## 6. A/B测试框架

### 6.1 实验设计

```yaml
A/B测试实验框架:
  
  实验类型:
    算法对比实验:
      目的: 比较不同算法的效果
      示例: 
        - 对照组: 原有权重算法
        - 实验组: 新的个性化权重算法
      流量分配: 50% vs 50%
    
    参数调优实验:
      目的: 优化算法参数
      示例:
        - 对照组: 学习率=0.1
        - 实验组A: 学习率=0.05
        - 实验组B: 学习率=0.2
      流量分配: 33% vs 33% vs 33%
    
    新功能实验:
      目的: 验证新功能效果
      示例:
        - 对照组: 不展示新功能
        - 实验组: 展示协同过滤推荐
      流量分配: 90% vs 10% (灰度发布)
  
  实验设计原则:
    - 随机分配: 用户级别随机，同一用户始终在同一组
    - 样本量计算: 基于效应量和显著性水平
    - 最小检测效应(MDE): 提前定义最小可检测差异
    - 实验时长: 考虑周期性和学习效应
```

### 6.2 分流策略

```python
class ABTestSplitter:
    """
    A/B测试分流器
    """
    
    def __init__(self, salt: str = "ab_test_salt"):
        self.salt = salt
        self.experiments = {}  # experiment_id -> ExperimentConfig
    
    def assign_group(self, user_id: str, experiment_id: str) -> str:
        """
        为用户分配实验组
        使用一致性哈希确保同一用户始终在同一组
        """
        
        config = self.experiments.get(experiment_id)
        if not config:
            return 'control'  # 默认对照组
        
        # 使用用户ID和实验ID生成哈希
        hash_input = f"{user_id}_{experiment_id}_{self.salt}"
        hash_value = int(hashlib.md5(hash_input.encode()).hexdigest(), 16)
        
        # 映射到 [0, 100) 区间
        bucket = hash_value % 100
        
        # 根据流量分配确定组
        cumulative = 0
        for group_name, traffic_ratio in config['traffic_split'].items():
            cumulative += traffic_ratio
            if bucket < cumulative:
                return group_name
        
        return 'control'
    
    def create_experiment(self, config: ExperimentConfig):
        """
        创建实验
        """
        self.experiments[config['experiment_id']] = config
    
    def get_user_experiments(self, user_id: str) -> Dict[str, str]:
        """
        获取用户参与的所有实验及其分组
        """
        assignments = {}
        for experiment_id in self.experiments.keys():
            assignments[experiment_id] = self.assign_group(user_id, experiment_id)
        return assignments


class ExperimentConfig:
    """实验配置"""
    
    def __init__(
        self,
        experiment_id: str,
        name: str,
        description: str,
        traffic_split: Dict[str, int],  # {'control': 50, 'treatment': 50}
        start_date: datetime,
        end_date: datetime,
        metrics: List[str],
        variants: Dict[str, Dict[str, Any]]  # 各变体的配置
    ):
        self.experiment_id = experiment_id
        self.name = name
        self.description = description
        self.traffic_split = traffic_split
        self.start_date = start_date
        self.end_date = end_date
        self.metrics = metrics
        self.variants = variants
```

### 6.3 核心指标定义

```yaml
核心指标体系:
  
  北极星指标:
    - 指标名: 成功匹配率
    - 定义: 建立关系用户数 / 活跃用户数
    - 目标: 提升10%
  
  一级指标:
    匹配质量:
      - 匹配接受率: like_count / match_count
      - 互动率: chat_initiated_count / match_count
      - 深度互动率: (message_count > 10) / chat_initiated_count
    
    用户满意度:
      - NPS得分: 净推荐值
      - 用户留存率: 7日/30日留存
      - 推荐接受率: 用户对推荐的评价
    
    平台健康度:
      - 日活跃用户(DAU)
      - 人均匹配数
      - 人均互动数
  
  二级指标:
    匹配效率:
      - 平均匹配响应时间
      - 推荐点击率(CTR)
      - 推荐转化率
    
    用户行为:
      - 平均浏览时长
      - 喜欢率 / 不喜欢率
      - 跳过率
    
    算法表现:
      - 假阳性率(FP Rate)
      - 假阴性率(FN Rate)
      - AUC-ROC
```

```python
class MetricsCalculator:
    """
    指标计算器
    """
    
    def __init__(self):
        self.metric_definitions = {
            # 北极星指标
            'success_match_rate': self._calc_success_match_rate,
            
            # 一级指标
            'match_accept_rate': self._calc_match_accept_rate,
            'interaction_rate': self._calc_interaction_rate,
            'retention_d7': self._calc_retention_d7,
            
            # 二级指标
            'ctr': self._calc_ctr,
            'fp_rate': self._calc_fp_rate,
            'fn_rate': self._calc_fn_rate,
            'auc_roc': self._calc_auc_roc
        }
    
    def calculate_metrics(
        self, 
        experiment_id: str,
        group: str,
        date_range: Tuple[datetime, datetime]
    ) -> Dict[str, float]:
        """
        计算指定实验组的指标
        """
        
        metrics = {}
        
        for metric_name, calc_func in self.metric_definitions.items():
            metrics[metric_name] = calc_func(
                experiment_id=experiment_id,
                group=group,
                date_range=date_range
            )
        
        return metrics
    
    def _calc_match_accept_rate(
        self, 
        experiment_id: str,
        group: str,
        date_range: Tuple[datetime, datetime]
    ) -> float:
        """
        计算匹配接受率
        """
        
        # 查询数据
        query = """
        SELECT 
            COUNT(CASE WHEN action = 'like' THEN 1 END) as like_count,
            COUNT(*) as total_count
        FROM user_explicit_feedback e
        JOIN match_records m ON e.user_id = m.user_id 
            AND e.match_user_id = m.match_user_id
        WHERE m.experiment_id = %s
            AND m.created_at BETWEEN %s AND %s
            AND e.user_id IN (
                SELECT user_id FROM ab_test_assignments 
                WHERE experiment_id = %s AND group_name = %s
            )
        """
        
        result = execute_query(query, [experiment_id, date_range[0], date_range[1], 
                                       experiment_id, group])
        
        like_count = result[0]['like_count']
        total_count = result[0]['total_count']
        
        return like_count / (total_count + 1e-6)
    
    def _calc_success_match_rate(
        self,
        experiment_id: str,
        group: str,
        date_range: Tuple[datetime, datetime]
    ) -> float:
        """
        计算成功匹配率（北极星指标）
        """
        
        query = """
        SELECT 
            COUNT(DISTINCT CASE WHEN r.id IS NOT NULL THEN m.user_id END) as success_users,
            COUNT(DISTINCT m.user_id) as total_users
        FROM match_records m
        LEFT JOIN user_relationships r ON (m.user_id = r.user_id_1 AND m.match_user_id = r.user_id_2)
            OR (m.user_id = r.user_id_2 AND m.match_user_id = r.user_id_1)
        WHERE m.experiment_id = %s
            AND m.created_at BETWEEN %s AND %s
            AND m.user_id IN (
                SELECT user_id FROM ab_test_assignments 
                WHERE experiment_id = %s AND group_name = %s
            )
        """
        
        result = execute_query(query, [experiment_id, date_range[0], date_range[1], 
                                       experiment_id, group])
        
        success_users = result[0]['success_users']
        total_users = result[0]['total_users']
        
        return success_users / (total_users + 1e-6)
    
    def _calc_auc_roc(
        self,
        experiment_id: str,
        group: str,
        date_range: Tuple[datetime, datetime]
    ) -> float:
        """
        计算AUC-ROC
        """
        
        from sklearn.metrics import roc_auc_score
        
        # 获取预测得分和真实标签
        query = """
        SELECT 
            m.match_score as predicted,
            CASE 
                WHEN e.action = 'like' THEN 1
                WHEN e.action = 'dislike' THEN 0
                WHEN COUNT(i.id) > 5 THEN 1
                ELSE 0
            END as actual
        FROM match_records m
        LEFT JOIN user_explicit_feedback e ON m.user_id = e.user_id 
            AND m.match_user_id = e.match_user_id
        LEFT JOIN user_implicit_feedback i ON m.user_id = i.user_id 
            AND m.match_user_id = i.match_user_id
        WHERE m.experiment_id = %s
            AND m.created_at BETWEEN %s AND %s
            AND m.user_id IN (
                SELECT user_id FROM ab_test_assignments 
                WHERE experiment_id = %s AND group_name = %s
            )
        GROUP BY m.id, m.match_score, e.action
        """
        
        results = execute_query(query, [experiment_id, date_range[0], date_range[1], 
                                        experiment_id, group])
        
        y_true = [r['actual'] for r in results]
        y_score = [r['predicted'] for r in results]
        
        return roc_auc_score(y_true, y_score)
```

### 6.4 统计显著性检验

```python
class StatisticalSignificanceTester:
    """
    统计显著性检验器
    """
    
    def __init__(self, alpha: float = 0.05, power: float = 0.8):
        self.alpha = alpha  # 显著性水平
        self.power = power  # 统计功效
    
    def two_proportion_z_test(
        self,
        successes_1: int,
        trials_1: int,
        successes_2: int,
        trials_2: int
    ) -> StatisticalTestResult:
        """
        双比例Z检验
        用于比较两组的转化率等比例指标
        """
        
        from scipy import stats
        
        # 计算比例
        p1 = successes_1 / trials_1
        p2 = successes_2 / trials_2
        
        # 合并比例
        p_pooled = (successes_1 + successes_2) / (trials_1 + trials_2)
        
        # 标准误差
        se = np.sqrt(p_pooled * (1 - p_pooled) * (1/trials_1 + 1/trials_2))
        
        # Z统计量
        z_stat = (p1 - p2) / (se + 1e-10)
        
        # 双侧p值
        p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))
        
        # 置信区间
        se_diff = np.sqrt(p1*(1-p1)/trials_1 + p2*(1-p2)/trials_2)
        ci_lower = (p1 - p2) - 1.96 * se_diff
        ci_upper = (p1 - p2) + 1.96 * se_diff
        
        # 效应量（相对提升）
        relative_lift = (p1 - p2) / (p2 + 1e-10)
        
        return StatisticalTestResult(
            test_name='two_proportion_z_test',
            statistic=z_stat,
            p_value=p_value,
            is_significant=p_value < self.alpha,
            confidence_interval=(ci_lower, ci_upper),
            effect_size=relative_lift,
            interpretation=self._interpret_result(p_value, relative_lift)
        )
    
    def two_sample_t_test(
        self,
        sample_1: List[float],
        sample_2: List[float]
    ) -> StatisticalTestResult:
        """
        双样本t检验
        用于比较两组的均值（如聊天时长、匹配得分等）
        """
        
        from scipy import stats
        
        # 执行t检验
        t_stat, p_value = stats.ttest_ind(sample_1, sample_2)
        
        # 效应量（Cohen's d）
        mean1, mean2 = np.mean(sample_1), np.mean(sample_2)
        var1, var2 = np.var(sample_1, ddof=1), np.var(sample_2, ddof=1)
        pooled_std = np.sqrt((var1 + var2) / 2)
        cohens_d = (mean1 - mean2) / (pooled_std + 1e-10)
        
        # 置信区间
        n1, n2 = len(sample_1), len(sample_2)
        se = np.sqrt(var1/n1 + var2/n2)
        df = n1 + n2 - 2
        t_critical = stats.t.ppf(0.975, df)
        ci_lower = (mean1 - mean2) - t_critical * se
        ci_upper = (mean1 - mean2) + t_critical * se
        
        return StatisticalTestResult(
            test_name='two_sample_t_test',
            statistic=t_stat,
            p_value=p_value,
            is_significant=p_value < self.alpha,
            confidence_interval=(ci_lower, ci_upper),
            effect_size=cohens_d,
            interpretation=self._interpret_result(p_value, cohens_d)
        )
    
    def mann_whitney_u_test(
        self,
        sample_1: List[float],
        sample_2: List[float]
    ) -> StatisticalTestResult:
        """
        Mann-Whitney U检验（非参数检验）
        用于比较非正态分布的中位数差异
        """
        
        from scipy import stats
        
        u_stat, p_value = stats.mannwhitneyu(sample_1, sample_2, alternative='two-sided')
        
        # 效应量（rank-biserial correlation）
        n1, n2 = len(sample_1), len(sample_2)
        effect_size = 1 - (2 * u_stat) / (n1 * n2)
        
        return StatisticalTestResult(
            test_name='mann_whitney_u_test',
            statistic=u_stat,
            p_value=p_value,
            is_significant=p_value < self.alpha,
            confidence_interval=None,
            effect_size=effect_size,
            interpretation=self._interpret_result(p_value, effect_size)
        )
    
    def sample_size_calculation(
        self,
        baseline_rate: float,
        minimum_detectable_effect: float,
        test_type: str = 'two_sided'
    ) -> int:
        """
        计算所需样本量
        """
        
        from scipy import stats
        
        # 效应量（预期提升后的比例）
        expected_rate = baseline_rate * (1 + minimum_detectable_effect)
        
        # Z分数
        if test_type == 'two_sided':
            z_alpha = stats.norm.ppf(1 - self.alpha / 2)
        else:
            z_alpha = stats.norm.ppf(1 - self.alpha)
        
        z_beta = stats.norm.ppf(self.power)
        
        # 样本量计算
        p1, p2 = baseline_rate, expected_rate
        p_avg = (p1 + p2) / 2
        
        n = (
            (z_alpha * np.sqrt(2 * p_avg * (1 - p_avg)) + 
             z_beta * np.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2
        ) / ((p1 - p2) ** 2 + 1e-10)
        
        return int(np.ceil(n))
    
    def _interpret_result(self, p_value: float, effect_size: float) -> str:
        """解释检验结果"""
        
        if p_value >= self.alpha:
            return "差异不显著，无法拒绝原假设"
        
        # 判断效应量大小
        if abs(effect_size) < 0.2:
            effect_magnitude = "微小"
        elif abs(effect_size) < 0.5:
            effect_magnitude = "小"
        elif abs(effect_size) < 0.8:
            effect_magnitude = "中等"
        else:
            effect_magnitude = "大"
        
        direction = "正向" if effect_size > 0 else "负向"
        
        return f"差异显著，{effect_magnitude}{direction}效应（p={p_value:.4f}）"


@dataclass
class StatisticalTestResult:
    """统计检验结果"""
    test_name: str
    statistic: float
    p_value: float
    is_significant: bool
    confidence_interval: Optional[Tuple[float, float]]
    effect_size: float
    interpretation: str
```

### 6.5 实验报告生成

```python
class ABTestReporter:
    """
    A/B测试报告生成器
    """
    
    def __init__(self):
        self.metrics_calculator = MetricsCalculator()
        self.significance_tester = StatisticalSignificanceTester()
    
    def generate_report(
        self,
        experiment_id: str,
        date_range: Tuple[datetime, datetime]
    ) -> ABTestReport:
        """
        生成A/B测试报告
        """
        
        # 获取实验配置
        config = self._get_experiment_config(experiment_id)
        
        # 计算各组指标
        group_metrics = {}
        for group_name in config['traffic_split'].keys():
            group_metrics[group_name] = self.metrics_calculator.calculate_metrics(
                experiment_id=experiment_id,
                group=group_name,
                date_range=date_range
            )
        
        # 统计显著性检验
        significance_results = {}
        control_group = 'control'
        
        for group_name in config['traffic_split'].keys():
            if group_name == control_group:
                continue
            
            significance_results[group_name] = self._compare_groups(
                control_group=control_group,
                treatment_group=group_name,
                metrics=group_metrics,
                experiment_id=experiment_id,
                date_range=date_range
            )
        
        # 生成结论和建议
        conclusion = self._generate_conclusion(significance_results)
        recommendations = self._generate_recommendations(conclusion, config)
        
        return ABTestReport(
            experiment_id=experiment_id,
            experiment_name=config['name'],
            date_range=date_range,
            group_metrics=group_metrics,
            significance_results=significance_results,
            conclusion=conclusion,
            recommendations=recommendations,
            generated_at=datetime.now()
        )
    
    def _compare_groups(
        self,
        control_group: str,
        treatment_group: str,
        metrics: Dict[str, Dict[str, float]],
        experiment_id: str,
        date_range: Tuple[datetime, datetime]
    ) -> Dict[str, StatisticalTestResult]:
        """
        比较对照组和实验组
        """
        
        results = {}
        
        # 获取原始数据（用于t检验）
        control_data = self._get_raw_metrics_data(experiment_id, control_group, date_range)
        treatment_data = self._get_raw_metrics_data(experiment_id, treatment_group, date_range)
        
        for metric_name in metrics[control_group].keys():
            # 根据指标类型选择检验方法
            if metric_name in ['match_accept_rate', 'interaction_rate', 'success_match_rate']:
                # 比例指标：使用Z检验
                control_success, control_total = self._get_success_total(
                    experiment_id, control_group, metric_name, date_range
                )
                treatment_success, treatment_total = self._get_success_total(
                    experiment_id, treatment_group, metric_name, date_range
                )
                
                results[metric_name] = self.significance_tester.two_proportion_z_test(
                    successes_1=treatment_success,
                    trials_1=treatment_total,
                    successes_2=control_success,
                    trials_2=control_total
                )
            
            else:
                # 连续型指标：使用t检验
                results[metric_name] = self.significance_tester.two_sample_t_test(
                    sample_1=treatment_data.get(metric_name, []),
                    sample_2=control_data.get(metric_name, [])
                )
        
        return results
    
    def _generate_conclusion(
        self, 
        significance_results: Dict[str, Dict[str, StatisticalTestResult]]
    ) -> str:
        """
        生成结论
        """
        
        significant_metrics = []
        
        for group_name, results in significance_results.items():
            for metric_name, test_result in results.items():
                if test_result.is_significant:
                    direction = "提升" if test_result.effect_size > 0 else "下降"
                    significant_metrics.append(
                        f"{group_name}组在{metric_name}上有显著{direction}"
                        f"（效应量: {test_result.effect_size:.3f}）"
                    )
        
        if not significant_metrics:
            return "实验组与对照组无显著差异，建议继续观察或调整实验方案。"
        
        return "实验结果显著：\n" + "\n".join(f"- {m}" for m in significant_metrics)
    
    def _generate_recommendations(
        self, 
        conclusion: str,
        config: ExperimentConfig
    ) -> List[str]:
        """
        生成建议
        """
        
        recommendations = []
        
        # 基于结论给出建议
        if "显著提升" in conclusion:
            recommendations.append("✅ 建议全量发布实验组方案")
            recommendations.append("📋 制定发布计划和监控方案")
            recommendations.append("🔄 继续监控长期效果")
        
        elif "显著下降" in conclusion:
            recommendations.append("❌ 不建议发布实验组方案")
            recommendations.append("🔍 分析失败原因，优化方案")
            recommendations.append("🧪 设计新的实验方案")
        
        else:
            recommendations.append("⏸️ 建议延长实验时间")
            recommendations.append("📊 增加样本量或调整指标")
            recommendations.append("🔬 深入分析用户细分数据")
        
        return recommendations


@dataclass
class ABTestReport:
    """A/B测试报告"""
    experiment_id: str
    experiment_name: str
    date_range: Tuple[datetime, datetime]
    group_metrics: Dict[str, Dict[str, float]]
    significance_results: Dict[str, Dict[str, StatisticalTestResult]]
    conclusion: str
    recommendations: List[str]
    generated_at: datetime
    
    def to_markdown(self) -> str:
        """转换为Markdown格式"""
        
        md = f"""# A/B测试报告：{self.experiment_name}

**实验ID:** {self.experiment_id}  
**时间范围:** {self.date_range[0].strftime('%Y-%m-%d')} ~ {self.date_range[1].strftime('%Y-%m-%d')}  
**生成时间:** {self.generated_at.strftime('%Y-%m-%d %H:%M:%S')}

## 指标对比

| 指标 | 对照组 | 实验组 | 变化 | 显著性 |
|------|--------|--------|------|--------|
"""
        
        for group_name, metrics in self.group_metrics.items():
            if group_name == 'control':
                continue
            
            for metric_name, value in metrics.items():
                control_value = self.group_metrics['control'].get(metric_name, 0)
                change = (value - control_value) / (control_value + 1e-6) * 100
                
                sig_result = self.significance_results.get(group_name, {}).get(metric_name)
                is_sig = "✅ 是" if sig_result and sig_result.is_significant else "❌ 否"
                
                md += f"| {metric_name} | {control_value:.4f} | {value:.4f} | {change:+.2f}% | {is_sig} |\n"
        
        md += f"""
## 结论

{self.conclusion}

## 建议

"""
        for rec in self.recommendations:
            md += f"- {rec}\n"
        
        return md
```

---

## 7. 伪代码实现

### 7.1 端到端匹配系统

```python
class IntelligentMatchingSystem:
    """
    智能匹配系统主类
    整合所有组件：反馈收集、权重优化、协同过滤、A/B测试
    """
    
    def __init__(self):
        # 核心组件
        self.feedback_collector = FeedbackCollector()
        self.quality_analyzer = MatchQualityAnalyzer()
        self.weight_optimizer = MultiArmedBanditOptimizer(DIMENSIONS)
        self.personalized_learner = PersonalizedWeightLearner(GLOBAL_WEIGHTS)
        self.cf_recommender = CollaborativeFilteringRecommender()
        self.ab_tester = ABTestSplitter()
        
        # 数据存储
        self.match_db = MatchDatabase()
        self.user_profile_store = UserProfileStore()
        
        # 配置
        self.config = {
            'cf_weight': 0.3,           # 协同过滤权重
            'content_weight': 0.5,      # 内容匹配权重
            'personalization_weight': 0.2,  # 个性化权重
            'min_feedback_for_personalization': 10
        }
    
    def recommend(
        self, 
        user_id: str, 
        top_n: int = 10
    ) -> List[MatchRecommendation]:
        """
        生成推荐列表
        """
        
        # 1. 确定A/B测试分组
        experiment_group = self.ab_tester.assign_group(
            user_id=user_id,
            experiment_id='personalization_v2'
        )
        
        # 2. 获取用户画像
        user_profile = self.user_profile_store.get(user_id)
        
        # 3. 计算匹配权重
        if experiment_group == 'treatment':
            # 实验组：使用个性化权重
            weights = self._get_personalized_weights(user_id, user_profile)
        else:
            # 对照组：使用全局权重
            weights = GLOBAL_WEIGHTS
        
        # 4. 生成候选池
        candidates = self._generate_candidates(user_id)
        
        # 5. 多路召回
        content_scores = self._content_based_matching(
            user_id=user_id,
            candidates=candidates,
            weights=weights
        )
        
        cf_scores = self.cf_recommender.recommend(
            user_id=user_id,
            candidate_pool=candidates
        )
        
        # 6. 分数融合
        final_scores = self._fuse_scores(
            content_scores=content_scores,
            cf_scores=cf_scores,
            user_id=user_id
        )
        
        # 7. 排序和后处理
        recommendations = self._rank_and_postprocess(
            scores=final_scores,
            user_id=user_id,
            top_n=top_n
        )
        
        # 8. 记录匹配记录（用于后续反馈分析）
        self._record_matches(user_id, recommendations, experiment_group)
        
        return recommendations
    
    def _get_personalized_weights(
        self, 
        user_id: str, 
        profile: UserProfile
    ) -> Dict[str, float]:
        """
        获取个性化权重
        """
        
        # 检查历史数据量
        if profile.stats['total_matches'] < self.config['min_feedback_for_personalization']:
            # 冷启动：使用特征调整的全局权重
            return self.personalized_learner._cold_start_weights(user_id, profile)
        
        # 从历史学习个性化权重
        history = self.match_db.get_user_match_history(user_id)
        return self.personalized_learner.learn_user_weights(user_id, history)
    
    def _content_based_matching(
        self,
        user_id: str,
        candidates: List[str],
        weights: Dict[str, float]
    ) -> Dict[str, float]:
        """
        基于内容的匹配
        """
        
        user_features = self._get_user_features(user_id)
        scores = {}
        
        for candidate_id in candidates:
            candidate_features = self._get_user_features(candidate_id)
            
            # 计算各维度得分
            dimension_scores = {}
            for dim in weights.keys():
                dim_score = self._calculate_dimension_score(
                    user_features=user_features,
                    candidate_features=candidate_features,
                    dimension=dim
                )
                dimension_scores[dim] = dim_score
            
            # 加权融合
            total_score = sum(
                dimension_scores[dim] * weights[dim]
                for dim in weights.keys()
            )
            
            scores[candidate_id] = total_score
        
        return scores
    
    def _calculate_dimension_score(
        self,
        user_features: Dict,
        candidate_features: Dict,
        dimension: str
    ) -> float:
        """
        计算单维度匹配得分
        """
        
        if dimension == 'values':
            # 价值观匹配（基于MBTI、信仰等）
            return self._values_similarity(user_features, candidate_features)
        
        elif dimension == 'interest':
            # 兴趣匹配（基于标签）
            return self._jaccard_similarity(
                user_features.get('interests', []),
                candidate_features.get('interests', [])
            )
        
        elif dimension == 'personality':
            # 性格匹配（可能是互补）
            return self._personality_match(user_features, candidate_features)
        
        elif dimension == 'lifestyle':
            # 生活方式匹配
            return self._lifestyle_similarity(user_features, candidate_features)
        
        elif dimension == 'appearance':
            # 外貌偏好
            return self._appearance_preference_match(user_features, candidate_features)
        
        elif dimension == 'location':
            # 地域匹配
            return self._location_match(user_features, candidate_features)
        
        else:
            return 0.5
    
    def _fuse_scores(
        self,
        content_scores: Dict[str, float],
        cf_scores: List[Tuple[str, float]],
        user_id: str
    ) -> Dict[str, float]:
        """
        融合多路得分
        """
        
        # 将协同过滤得分转为字典
        cf_dict = {uid: score for uid, score in cf_scores}
        
        # 融合
        all_candidates = set(content_scores.keys()) | set(cf_dict.keys())
        fused = {}
        
        for candidate in all_candidates:
            content = content_scores.get(candidate, 0)
            cf = cf_dict.get(candidate, 0)
            
            fused[candidate] = (
                self.config['content_weight'] * content +
                self.config['cf_weight'] * cf
            )
        
        return fused
    
    def _rank_and_postprocess(
        self,
        scores: Dict[str, float],
        user_id: str,
        top_n: int
    ) -> List[MatchRecommendation]:
        """
        排序和后处理
        """
        
        # 排序
        sorted_candidates = sorted(
            scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # 过滤：已匹配、已不喜欢等
        filtered = self._filter_candidates(user_id, sorted_candidates)
        
        # 多样性：避免推荐太相似的对象
        diversified = self._diversify_recommendations(filtered, top_n)
        
        # 生成推荐对象
        recommendations = [
            MatchRecommendation(
                user_id=user_id,
                match_user_id=candidate_id,
                match_score=score,
                match_dimensions=self._get_dimension_scores(user_id, candidate_id),
                reason=self._generate_match_reason(user_id, candidate_id)
            )
            for candidate_id, score in diversified[:top_n]
        ]
        
        return recommendations
    
    def process_feedback(
        self,
        user_id: str,
        match_user_id: str,
        feedback_type: str,
        feedback_value: Any
    ):
        """
        处理用户反馈，触发在线学习
        """
        
        # 1. 收集反馈
        feedback = self.feedback_collector.collect(
            user_id=user_id,
            match_user_id=match_user_id,
            feedback_type=feedback_type,
            feedback_value=feedback_value
        )
        
        # 2. 更新质量分析
        match_result = self.match_db.get_match(user_id, match_user_id)
        self.quality_analyzer.analyze(match_result)
        
        # 3. 在线权重更新
        self.weight_optimizer.update(match_result)
        
        # 4. 更新用户画像
        profile = self.user_profile_store.get(user_id)
        profile.update_with_feedback(feedback)
        self.user_profile_store.save(profile)
        
        # 5. 更新协同过滤模型
        if feedback_type == 'dislike':
            self.cf_recommender.negative_handler.handle_negative_for_collaborative_filtering(
                user_id=user_id,
                disliked_user_id=match_user_id
            )
        
        # 6. 触发批量学习（如果积累足够数据）
        if self._should_trigger_batch_learning():
            self._trigger_batch_learning()
```

### 7.2 在线服务架构

```python
class OnlineMatchingService:
    """
    在线匹配服务
    处理实时请求
    """
    
    def __init__(self):
        self.matching_system = IntelligentMatchingSystem()
        self.cache = RedisCache()
        self.queue = MessageQueue()
    
    @endpoint('/api/v1/recommend')
    def get_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """
        获取推荐
        """
        
        user_id = request.user_id
        top_n = request.top_n or 10
        
        # 检查缓存
        cache_key = f"recommend:{user_id}"
        cached = self.cache.get(cache_key)
        
        if cached and not request.force_refresh:
            return RecommendationResponse(
                recommendations=cached,
                from_cache=True
            )
        
        # 生成推荐
        recommendations = self.matching_system.recommend(user_id, top_n)
        
        # 缓存结果（5分钟）
        self.cache.set(cache_key, recommendations, ttl=300)
        
        return RecommendationResponse(
            recommendations=recommendations,
            from_cache=False
        )
    
    @endpoint('/api/v1/feedback')
    def submit_feedback(self, request: FeedbackRequest) -> FeedbackResponse:
        """
        提交反馈
        """
        
        # 异步处理反馈
        self.queue.publish('feedback_events', {
            'user_id': request.user_id,
            'match_user_id': request.match_user_id,
            'feedback_type': request.feedback_type,
            'feedback_value': request.feedback_value,
            'timestamp': datetime.now().isoformat()
        })
        
        return FeedbackResponse(status='accepted')
    
    @endpoint('/api/v1/match/{match_id}/chat')
    def on_chat_event(self, match_id: str, event: ChatEvent):
        """
        处理聊天事件（隐性反馈）
        """
        
        # 记录聊天事件
        self.feedback_collector.record_chat_event(match_id, event)
        
        # 如果是首次聊天，标记为积极信号
        if event.event_type == 'first_message':
            self.matching_system.process_feedback(
                user_id=event.sender_id,
                match_user_id=event.receiver_id,
                feedback_type='chat_initiated',
                feedback_value=True
            )
```

### 7.3 离线训练流程

```python
class OfflineTrainingPipeline:
    """
    离线训练管道
    定期更新模型和权重
    """
    
    def __init__(self):
        self.data_loader = DataLoader()
        self.trainer = ModelTrainer()
        self.evaluator = ModelEvaluator()
    
    @scheduled('0 2 * * *')  # 每天凌晨2点
    def daily_training(self):
        """
        每日训练任务
        """
        
        # 1. 提取训练数据
        train_data = self.data_loader.load_training_data(
            start_date=datetime.now() - timedelta(days=7),
            end_date=datetime.now()
        )
        
        # 2. 训练模型
        new_model = self.trainer.train(
            data=train_data,
            model_type='personalized_weights'
        )
        
        # 3. 评估模型
        metrics = self.evaluator.evaluate(new_model, test_data=train_data)
        
        # 4. 如果效果好，发布模型
        if metrics['auc'] > CURRENT_MODEL_AUC:
            self._deploy_model(new_model)
            self._notify_team(f"新模型已发布，AUC提升至{metrics['auc']:.4f}")
        
        # 5. 更新协同过滤模型
        self._update_cf_model(train_data)
        
        # 6. 用户聚类更新
        self._update_user_clusters(train_data)
    
    @scheduled('0 4 * * 0')  # 每周日凌晨4点
    def weekly_analysis(self):
        """
        每周深度分析
        """
        
        # 1. 分析失败匹配模式
        failure_patterns = self._analyze_failure_patterns()
        
        # 2. 生成优化建议
        suggestions = self._generate_optimization_suggestions(failure_patterns)
        
        # 3. A/B测试报告
        active_experiments = self._get_active_experiments()
        for exp_id in active_experiments:
            report = self.ab_tester.generate_report(exp_id)
            self._send_report(report)
        
        # 4. 权重分布分析
        weight_distribution = self._analyze_weight_distribution()
        self._update_global_weights(weight_distribution)
```

---

## 8. 系统架构图

### 8.1 整体架构

```
┌──────────────────────────────────────────────────────────────────────┐
│                          心动投递 - 匹配系统架构                         │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│    客户端层          │
├─────────────────────┤
│ iOS App  │ Android  │ Web App │ 小程序 │
└────┬─────┴────┬─────┴────┬─────┴───┬────┘
     │          │          │         │
     └──────────┴──────────┴─────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                            API Gateway                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │ 负载均衡     │  │ 限流熔断     │  │ 认证鉴权     │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │                                             │
        ▼                                             ▼
┌───────────────────┐                    ┌───────────────────┐
│  在线服务层        │                    │  消息队列层        │
├───────────────────┤                    ├───────────────────┤
│                   │                    │                   │
│  ┌─────────────┐  │                    │  ┌─────────────┐  │
│  │ 推荐服务     │  │                    │  │ 反馈事件     │  │
│  │             │  │    ───────────▶    │  │ 聊天事件     │  │
│  │ - 候选召回   │  │                    │  │ 用户行为     │  │
│  │ - 匹配计算   │  │                    │  │ 定时任务     │  │
│  │ - 结果排序   │  │                    │  └─────────────┘  │
│  └─────────────┘  │                    │                   │
│                   │                    └─────────┬─────────┘
│  ┌─────────────┐  │                              │
│  │ 反馈服务     │  │                              │
│  │             │  │                              │
│  │ - 显性反馈   │  │                              │
│  │ - 隐性反馈   │  │                              │
│  │ - 长期反馈   │  │                              │
│  └─────────────┘  │                              │
│                   │                              │
│  ┌─────────────┐  │                              │
│  │ 用户服务     │  │                              │
│  │             │  │                              │
│  │ - 用户画像   │  │                              │
│  │ - 偏好管理   │  │                              │
│  └─────────────┘  │                              │
└─────────┬─────────┘                              │
          │                                        │
          └────────────────┬───────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                            数据存储层                                 │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │   MySQL     │  │   Redis     │  │  MongoDB    │  │ ClickHouse  ││
│  │             │  │             │  │             │  │             ││
│  │ - 用户数据   │  │ - 缓存      │  │ - 反馈日志   │  │ - 分析统计   ││
│  │ - 匹配记录   │  │ - 会话      │  │ - 行为流水   │  │ - 报表      ││
│  │ - 关系数据   │  │ - 排行榜    │  │ - 特征存储   │  │ - 监控      ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
└──────────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                          离线计算层                                   │
│                                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │ Spark集群   │  │ 模型训练     │  │ 特征工程     │  │ 数据仓库     ││
│  │             │  │             │  │             │  │             ││
│  │ - 批量处理   │  │ - 权重优化   │  │ - 特征提取   │  │ - ETL      ││
│  │ - 用户聚类   │  │ - 协同过滤   │  │ - 特征服务   │  │ - 数据清洗   ││
│  │ - 统计分析   │  │ - 深度学习   │  │ - 在线学习   │  │ - 数据集成   ││
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### 8.2 反馈学习闭环

```
┌─────────────────────────────────────────────────────────────────┐
│                      反馈学习闭环                                │
└─────────────────────────────────────────────────────────────────┘

     ┌──────────┐
     │  匹配推荐  │
     └─────┬────┘
           │
           ▼
     ┌──────────┐      显性反馈       ┌──────────┐
     │  用户行为  │──────────────────▶│ 反馈收集  │
     └─────┬────┘                    └─────┬────┘
           │                               │
           │ 隐性反馈                       │
           │                               ▼
           │                        ┌──────────┐
           └───────────────────────▶│ 数据存储  │
                                    └─────┬────┘
                                          │
                                          ▼
                                   ┌──────────┐
                                   │ 反馈分析  │
                                   └─────┬────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
              ▼                          ▼                          ▼
       ┌──────────┐              ┌──────────┐              ┌──────────┐
       │ 错误分析  │              │ 权重优化  │              │ 协同过滤  │
       │          │              │          │              │          │
       │- 假阳性  │              │- 在线学习 │              │- 相似用户 │
       │- 假阴性  │              │- 批量更新 │              │- 用户聚类 │
       │- 失败模式│              │- 个性化   │              │- 负反馈   │
       └─────┬────┘              └─────┬────┘              └─────┬────┘
             │                         │                         │
             └─────────────────────────┼─────────────────────────┘
                                       │
                                       ▼
                                ┌──────────┐
                                │ 模型更新  │
                                └─────┬────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │ A/B测试  │
                                └─────┬────┘
                                      │
                                      ▼
                                ┌──────────┐
                                │ 效果评估  │
                                └─────┬────┘
                                      │
                                      └────────────────▶ 回到开始
```

### 8.3 数据流向

```
用户行为 → 反馈收集 → 特征工程 → 模型训练 → 在线推理 → 推荐
    ↑                                                    ↓
    └────────────────── 效果监控 ←──────────────────────┘
```

---

## 总结

本系统设计了一个完整的基于用户反馈的匹配优化系统，包含：

1. **多维度反馈收集**：显性、隐性、长期反馈的全方位采集
2. **智能学习算法**：MAB、贝叶斯在线学习、时间衰减等
3. **个性化权重**：用户画像、冷启动策略、权重融合
4. **协同过滤**：用户相似度、聚类推荐、负反馈处理
5. **A/B测试框架**：实验设计、指标体系、显著性检验

系统具备：
- ✅ 可扩展性：模块化设计，易于扩展新功能
- ✅ 可维护性：清晰的架构分层，便于维护
- ✅ 可观测性：完善的监控和日志系统
- ✅ 可落地性：详细的伪代码和实施路径

---

**文档版本：** v1.0  
**最后更新：** 2026-03-18  
**维护者：** 架构团队
