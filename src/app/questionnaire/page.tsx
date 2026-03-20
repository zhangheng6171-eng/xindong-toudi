'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles, Heart, Check, PartyPopper, Stars, X } from 'lucide-react'
import { AnimatedBackground, GlassCard, GradientButton, FadeIn, Tag } from '@/components/animated-background'
import { QuestionnaireProgress, QuestionnaireComplete } from '@/components/questionnaire-progress'

// 问卷问题数据 - 66道题基于婚恋心理学专业设计
const questions = [
  // 大五人格 (1-15)
  { id: 1, group: "人格特质-开放性", question: "当你计划一次假期旅行时，你更倾向于选择？", type: "single_choice", options: ["完全陌生的地方，体验全新文化", "参考攻略，选择小众但有特色的目的地", "朋友推荐的知名景点", "曾经去过觉得不错的地方", "在家休息或附近转转"] },
  { id: 2, group: "人格特质-开放性", question: "如果有人邀请你参加一个你完全不了解的新兴文化活动，你的第一反应是？", type: "single_choice", options: ["非常期待，立刻答应", "先了解具体内容再决定", "有点犹豫，但愿意尝试一次", "觉得自己可能不太适合", "婉拒，更喜欢熟悉的活动"] },
  { id: 3, group: "人格特质-开放性", question: "朋友邀请你去一家新开的异国料理餐厅，菜单上都是你没见过的菜名，你会？", type: "single_choice", options: ["让服务员推荐特色菜，期待惊喜", "主动询问食材和口味，选个感兴趣的", "点相对熟悉的菜式", "建议换一家自己熟悉的餐厅"] },
  { id: 4, group: "人格特质-尽责性", question: "接到一个重要工作任务，距离截止日期还有两周，你通常会？", type: "single_choice", options: ["当天就开始规划并逐步推进", "列个详细的时间表，按计划执行", "提前几天集中完成", "心里记着，最后一两天完成", "拖到最后时刻才匆忙处理"] },
  { id: 5, group: "人格特质-尽责性", question: "你发现自己最近体重增加了一些，你会？", type: "single_choice", options: ["立即制定详细的饮食和运动计划并严格执行", "开始有意识地调整饮食和增加运动", "告诉自己下周开始注意", "觉得没关系，顺其自然", "偶尔想起来才注意一下"] },
  { id: 6, group: "人格特质-尽责性", question: "如果朋友借了你一笔钱，约定一个月归还，但到期后他似乎忘了这件事，你会？", type: "single_choice", options: ["按时提醒他，这不是小数目", "找个合适的委婉方式提醒", "再等等看，他可能只是暂时忘了", "不好意思开口，但心里一直记着", "就算了，钱不多，友谊更重要"] },
  { id: 7, group: "人格特质-外向性", question: "周末晚上，朋友打电话约你参加一个聚会，说会有一些你不认识的新朋友，你会？", type: "single_choice", options: ["很高兴参加，正好认识新朋友", "欣然前往，但会跟在熟悉的朋友身边", "有点犹豫，但愿意去试试", "更想在家休息，找理由推掉", "直接说不去，不喜欢社交场合"] },
  { id: 8, group: "人格特质-外向性", question: "在公司年会上，主持人突然邀请你上台参与互动游戏，你的感受是？", type: "single_choice", options: ["很兴奋，主动配合还即兴发挥", "欣然接受，按规则完成任务", "有点紧张，但还是会上去", "很想拒绝，觉得太尴尬", "感到非常不适，想办法躲开"] },
  { id: 9, group: "人格特质-外向性", question: "当你独自一人在餐厅吃饭，发现邻桌有人遗落了东西，你会？", type: "single_choice", options: ["主动上前叫住他", "大声提醒周围的人帮忙叫住", "追出去还给他", "等一下看有没有工作人员处理", "不太想管闲事，继续吃饭"] },
  { id: 10, group: "人格特质-宜人性", question: "伴侣做了一道新菜，但味道确实不太好，对方问你觉得怎么样，你会说？", type: "single_choice", options: ["真诚地夸奖他的用心，委婉提一点小建议", "说他辛苦了，味道还不错", "笑着说我很喜欢，你做的我都爱吃", "实话实说，但强调下次可以改进", "直接说出真实的感受"] },
  { id: 11, group: "人格特质-宜人性", question: "你和伴侣约好周末去看电影，但他临时加班要取消，你会？", type: "single_choice", options: ["完全理解，工作重要，改天再看", "表示理解，但会表达一点小失落", "有点失望，但接受现实", "觉得他不够重视这次约会", "很生气，觉得他不守承诺"] },
  { id: 12, group: "人格特质-宜人性", question: "在讨论家庭开支时，伴侣的消费观念和你有很大分歧，你会？", type: "single_choice", options: ["耐心倾听他的想法，一起寻找折中方案", "表达自己的观点，但尊重他的选择", "各自管理各自的钱，互不干涉", "试图说服他接受我的观点", "坚持自己的原则，不愿妥协"] },
  { id: 13, group: "人格特质-神经质", question: "伴侣回复消息的速度明显比平时慢了很多，你的第一反应是？", type: "single_choice", options: ["可能在忙，没关系", "有点好奇，但不会多想", "忍不住想他是不是出了什么事", "开始胡思乱想，忍不住再发一条", "非常焦虑，反复查看手机"] },
  { id: 14, group: "人格特质-神经质", question: "晚上躺在床上准备睡觉，突然想起白天和别人说话时可能说错了一句话，你会？", type: "single_choice", options: ["想一下就过去了，没什么大不了", "稍微纠结一下，然后放下", "辗转反侧，想明天怎么弥补", "后悔得睡不着，反复回想那个场景", "非常自责，觉得自己总是说错话"] },
  { id: 15, group: "人格特质-神经质", question: "当生活中遇到较大的压力时，你的睡眠和情绪状态通常是？", type: "single_choice", options: ["基本不受影响，能吃能睡", "偶尔会有些担忧，但总体还好", "会失眠或睡不好，但能自我调节", "明显焦虑，需要找人倾诉", "情绪波动很大，影响日常生活"] },

  // 依恋类型 (16-21)
  { id: 16, group: "依恋类型", question: "当伴侣没有及时回复消息时，你通常会？", type: "single_choice", options: ["担心TA出事了或不在乎我了，反复查看手机", "相信TA在忙，等会儿会回复", "无所谓，继续做自己的事"] },
  { id: 17, group: "依恋类型", question: "当伴侣想要独处一段时间时，你的第一反应是？", type: "single_choice", options: ["担心是不是我做错了什么，或TA不再爱我了", "理解TA需要空间，尊重TA的选择", "松了一口气，正好我也需要自由"] },
  { id: 18, group: "依恋类型", question: "在亲密关系中，你更倾向于？", type: "single_choice", options: ["希望时刻和伴侣保持联系，分享一切", "享受亲密，但也保留适度的个人空间", "保持一定距离，避免过度依赖"] },
  { id: 19, group: "依恋类型", question: "当伴侣向你表达情感需求时，你会？", type: "single_choice", options: ["很高兴TA愿意向我敞开心扉，愿意倾听和支持", "愿意倾听，但有时会感到有压力", "觉得有些不自在，不知道如何回应"] },
  { id: 20, group: "依恋类型", question: "如果你和伴侣发生争吵，事后你通常会？", type: "single_choice", options: ["担心这次争吵会影响我们的关系，急于和解确认", "冷静思考问题所在，寻求双方都能接受的解决方案", "想要保持距离，避免再次陷入冲突"] },
  { id: 21, group: "依恋类型", question: "对于完全信任一个人这件事，你的看法是？", type: "single_choice", options: ["很难完全信任，总是担心被伤害或背叛", "需要时间建立信任，但一旦建立就很稳固", "觉得信任有风险，保持一定的自我保护更安全"] },

  // 爱情三元论 (22-27)
  { id: 22, group: "爱情三元论", question: "当你在街上偶然看到伴侣时，心跳加速的感觉？", type: "single_choice", options: ["经常会有，即使在一起很久", "偶尔会有，在某些特别的时刻", "很少会有，感情更偏向稳定平淡"] },
  { id: 23, group: "爱情三元论", question: "你更喜欢和伴侣一起做什么？", type: "single_choice", options: ["浪漫约会、亲密互动、激情时刻", "深入交谈、分享心事、互相理解", "共同规划未来、承担家庭责任"] },
  { id: 24, group: "爱情三元论", question: "如果伴侣遇到困难，你更倾向于？", type: "single_choice", options: ["给TA拥抱和身体上的安慰", "倾听TA的烦恼，给TA情感支持", "帮TA分析问题，一起想办法解决"] },
  { id: 25, group: "爱情三元论", question: "关于和伴侣的未来规划，你认为？", type: "single_choice", options: ["享受当下，未来顺其自然", "希望建立深厚的精神连接，但不急于承诺", "会认真考虑长期承诺，比如结婚、买房等"] },
  { id: 26, group: "爱情三元论", question: "在选择伴侣时，你最看重的是？", type: "single_choice", options: ["身体吸引力、浪漫感觉", "心灵契合、情感理解", "责任感、价值观一致"] },
  { id: 27, group: "爱情三元论", question: "你认为理想的爱情应该是？", type: "single_choice", options: ["充满激情和浪漫，每天都像初恋", "互相理解支持，成为彼此最好的朋友", "坚定承诺，共同面对人生风雨"] },

  // 核心价值观 (28-37) - isCoreValue标记
  { id: 28, group: "核心价值观", question: "关于生育孩子，你的态度是？", type: "single_choice", options: ["一定要有孩子，这是人生必选项", "想要孩子，希望婚后1-2年内生育", "想要孩子，但希望30岁后再考虑", "不想要孩子，坚持丁克"], isCoreValue: true },
  { id: 29, group: "核心价值观", question: "对于婚姻中的忠诚，你的底线是？", type: "single_choice", options: ["绝对忠诚，任何形式的背叛都不接受", "身体出轨不可接受，精神出轨可以协商", "可以原谅一次，但下不为例", "具体情况具体分析，看对方态度"], isCoreValue: true },
  { id: 30, group: "核心价值观", question: "你理想的婚后居住方式是？", type: "single_choice", options: ["单独居住，与双方父母保持独立", "单独居住，但父母可以长期同住帮忙带娃", "与一方父母同住，方便照顾老人", "可以根据经济条件和家庭需要灵活安排"], isCoreValue: true },
  { id: 31, group: "核心价值观", question: "你的消费观更倾向于？", type: "single_choice", options: ["量入为出，优先储蓄，有规划地消费", "有存有花，保持平衡，享受当下", "追求品质，愿意为更好的体验买单", "活在当下，不太在意未来规划"], isCoreValue: true },
  { id: 32, group: "核心价值观", question: "关于家庭财务，你倾向于？", type: "single_choice", options: ["完全透明，共同管理所有收入和支出", "共同账户管家用，个人保留部分私房钱", "AA制，各自管理收入，大额支出协商", "完全独立，互不干涉对方财务"], isCoreValue: true },
  { id: 33, group: "核心价值观", question: "当工作与家庭发生冲突时，你会？", type: "single_choice", options: ["家庭优先，工作再忙也要陪伴家人", "尽量平衡，看具体情况决定", "现阶段事业优先，等事业稳定再顾家庭", "事业优先，好的经济基础才能给家庭保障"], isCoreValue: true },
  { id: 34, group: "核心价值观", question: "你与原生家庭（父母）的关系边界是？", type: "single_choice", options: ["独立决策，父母可以建议但不能干涉", "重要决定会征求父母意见，但自己做主", "尊重父母意见，尽量不让他们失望", "父母意见很重要，会优先考虑他们的想法"], isCoreValue: true },
  { id: 35, group: "核心价值观", question: "关于宗教信仰，你的态度是？", type: "single_choice", options: ["有坚定信仰，希望伴侣共同信仰和实践", "有信仰，尊重对方不同信仰或无信仰", "无特定宗教，但持开放态度", "无神论，希望伴侣也不要有宗教信仰"], isCoreValue: true },
  { id: 36, group: "核心价值观", question: "你认为婚姻的核心意义是？", type: "single_choice", options: ["一生一世，无论遇到什么困难都要坚持", "人生伴侣，共同成长，不再爱了可以分开", "现实合作关系，各取所需，合适就在一起", "为了孩子和家庭稳定而维系"], isCoreValue: true },
  { id: 37, group: "核心价值观", question: "关于社会政治观点，你倾向于？", type: "single_choice", options: ["传统保守，重视稳定和秩序", "温和中立，不过多参与政治讨论", "开放进步，支持社会变革和创新", "更关注个人生活，对政治不太在意"], isCoreValue: true },

  // 生活方式 (38-45)
  { id: 38, group: "生活方式", question: "你的日常作息习惯是？", type: "single_choice", options: ["早睡早起（22点前入睡）", "正常作息（23点左右入睡）", "夜猫子（凌晨后入睡）", "作息不规律"] },
  { id: 39, group: "生活方式", question: "你更倾向于哪种社交方式？", type: "single_choice", options: ["喜欢热闹，频繁参加社交活动", "适度社交，有选择地参加聚会", "偏向小范围密友社交", "更喜欢独处或线上社交"] },
  { id: 40, group: "生活方式", question: "你的饮食习惯更接近哪种？", type: "single_choice", options: ["注重健康，规律饮食", "口味适中，偶尔外食", "偏爱美食，愿意尝试各种餐厅", "不太讲究，方便就好"] },
  { id: 41, group: "生活方式", question: "你对待消费的态度是？", type: "single_choice", options: ["精打细算，储蓄优先", "适度消费，该花的花", "享受型消费，注重生活品质", "今朝有酒今朝醉，不太考虑未来"] },
  { id: 42, group: "生活方式", question: "你希望家务如何分工？", type: "single_choice", options: ["平均分配，共同承担", "根据双方时间灵活安排", "一方主外，另一方主内", "请保洁或外包服务"] },
  { id: 43, group: "生活方式", question: "你对居住城市的偏好是？", type: "single_choice", options: ["一线大城市，机会多", "二线城市，压力适中", "小城市或郊区，节奏慢", "都可以，视具体情况而定"] },
  { id: 44, group: "生活方式", question: "你对宠物的态度是？", type: "single_choice", options: ["非常喜欢，愿意养宠物", "可以接受，但不主动养", "不太喜欢宠物", "对宠物无感或过敏"] },
  { id: 45, group: "生活方式", question: "你更偏好哪种旅行方式？", type: "single_choice", options: ["深度游，喜欢慢慢体验", "高效打卡，热门景点都要去", "休闲度假，以放松为主", "说走就走的随机旅行"] },

  // 沟通风格 (46-51)
  { id: 46, group: "沟通风格", question: "当你表达不同意见时，通常会？", type: "single_choice", options: ["直接明确地表达", "比较委婉地暗示", "看场合，有时直接有时委婉", "尽量避免直接冲突"] },
  { id: 47, group: "沟通风格", question: "你更倾向于哪种沟通模式？", type: "single_choice", options: ["就事论事，关注问题解决", "注重情感交流，先安抚情绪", "两者结合，视情况而定", "更关注对方的想法和感受"] },
  { id: 48, group: "沟通风格", question: "面对冲突时，你通常会？", type: "single_choice", options: ["当场沟通，解决为止", "冷静后再谈，避免激化", "回避冲突，等对方先开口", "看问题大小，灵活处理"] },
  { id: 49, group: "沟通风格", question: "你更习惯哪种表达方式？", type: "single_choice", options: ["口头表达，言语直接", "文字表达，更善于书写", "两者结合，看场合", "用行动多于言语"] },
  { id: 50, group: "沟通风格", question: "当你倾听他人时，更倾向于？", type: "single_choice", options: ["专注倾听，给对方表达空间", "边听边回应，互动较多", "听完后复述确认理解", "边听边分析，给出建议"] },
  { id: 51, group: "沟通风格", question: "你表达情绪的方式通常是？", type: "single_choice", options: ["外显型，容易被察觉", "内敛型，情感不外露", "看场合，内外有别", "习惯通过第三方表达"] },

  // 情境题 (52-57)
  { id: 52, group: "情境题", question: "如果伴侣忘记了你们的纪念日，你的第一反应是？", type: "single_choice", options: ["直接表达失望，希望对方道歉补偿", "先不说，等对方自己想起来", "主动提醒，不给对方压力", "不介意，纪念日不是很重要", "会怀疑对方是不是不在乎我了"] },
  { id: 53, group: "情境题", question: "你发现伴侣与异性朋友单独吃饭，而事前没有告诉你，你会怎么做？", type: "single_choice", options: ["直接质问对方为什么不说，要求以后必须提前告知", "装作不知道，但心里会一直想着这件事", "平静地问清楚情况，表达自己的感受和担忧", "觉得没什么，信任对方就好", "也会约异性朋友吃饭，让对方体验一下这种感觉"] },
  { id: 54, group: "情境题", question: "双方父母对你们的婚事意见不合，你会怎么处理？", type: "single_choice", options: ["坚持自己的选择，希望父母理解和接受", "避免冲突，尽量减少双方父母见面的机会", "分别与双方父母沟通，寻找能够接受的折中方案", "倾向于听从父母的意见，他们更有经验", "让伴侣去说服TA的父母，自己去说服自己的父母"] },
  { id: 55, group: "情境题", question: "伴侣突然失业或收入大幅下降，你第一时间的反应和行动是什么？", type: "single_choice", options: ["安慰对方，一起分析原因并制定求职计划", "担心未来的经济压力，但不知道该怎么开口讨论", "主动承担更多开支，让对方安心找工作", "相信这只是暂时的，对方有能力渡过难关", "严肃讨论家庭财务状况，要求对方尽快找到新工作"] },
  { id: 56, group: "情境题", question: "伴侣的生活习惯与你差异很大，产生摩擦时你会？", type: "single_choice", options: ["明确指出问题，希望对方改正", "忍受着不说话，偶尔会生闷气", "一起讨论，找到双方都能接受的调整方式", "调整自己去适应对方，毕竟要互相包容", "各管各的，互不干涉"] },
  { id: 57, group: "情境题", question: "在是否要孩子、在哪里买房等重大决策上你们意见不一致，你会怎么做？", type: "single_choice", options: ["据理力争，认为自己是对的，希望对方改变想法", "暂时搁置话题，等以后再说", "深入沟通彼此的顾虑和期望，寻找可能的共识点", "妥协让步，不想因为这件事伤害感情", "各退一步，寻找一个折中的解决方案"] },

  // 兴趣爱好 (58-65)
  { id: 58, group: "兴趣爱好", question: "你喜欢哪些运动健身活动？（可多选）", type: "multiple_choice", maxSelect: 5, options: ["跑步/慢跑", "健身房/力量训练", "瑜伽/普拉提", "球类运动", "游泳", "户外徒步", "骑行", "舞蹈"] },
  { id: 59, group: "兴趣爱好", question: "你的阅读偏好是？（可多选）", type: "multiple_choice", maxSelect: 5, options: ["小说/文学", "商业/理财", "历史/传记", "心理学/自我成长", "科技/数码", "旅行/地理", "艺术/设计", "漫画/绘本"] },
  { id: 60, group: "兴趣爱好", question: "你喜欢看什么类型的影视内容？（可多选）", type: "multiple_choice", maxSelect: 5, options: ["爱情/偶像剧", "悬疑/推理", "科幻/奇幻", "喜剧/综艺", "纪录片", "动作/战争", "动漫", "文艺/独立电影"] },
  { id: 61, group: "兴趣爱好", question: "你平时喜欢听什么类型的音乐？（可多选）", type: "multiple_choice", maxSelect: 5, options: ["流行", "摇滚", "民谣", "电子/舞曲", "古典", "爵士", "R&B/嘻哈", "华语"] },
  { id: 62, group: "兴趣爱好", question: "你喜欢哪种美食风格？（可多选）", type: "multiple_choice", maxSelect: 5, options: ["中餐（川菜/粤菜等）", "西餐", "日料/韩餐", "火锅/串串", "东南亚菜", "素食", "甜品/烘焙", "快餐/小吃"] },
  { id: 63, group: "兴趣爱好", question: "你prefer哪种旅行方式？（可多选）", type: "multiple_choice", maxSelect: 5, options: ["城市观光", "自然风光", "海岛度假", "历史文化", "探险/徒步", "美食之旅", "购物之旅", "随心所欲的自由行"] },
  { id: 64, group: "兴趣爱好", question: "你平时喜欢玩什么类型的游戏？（可多选）", type: "multiple_choice", maxSelect: 5, options: ["手游/端游", "主机游戏", "棋牌类", "桌游", "益智/解谜", "竞技/电竞", "角色扮演", "休闲/消除"] },
  { id: 65, group: "兴趣爱好", question: "你平时喜欢参加什么类型的社交活动？（可多选）", type: "multiple_choice", maxSelect: 5, options: ["朋友聚会", "运动健身", "志愿者活动", "兴趣社群", "行业交流", "旅行团建", "游戏/桌游", "文艺展览"] },

  // 自我描述 (66)
  { id: 66, group: "自我描述", question: "用三个词来形容你自己，你会选择哪三个？", type: "open_text", placeholder: "请输入三个形容词，用逗号分隔，如：开朗、理性、有爱心", maxLength: 50 }
]

const groups = ["人格特质", "依恋类型", "爱情三元论", "核心价值观", "生活方式", "沟通风格", "情境题", "兴趣爱好", "自我描述"]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// 庆祝动画组件
function CelebrationOverlay({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-rose-500/95 via-pink-500/95 to-purple-500/95 backdrop-blur-sm"
      onClick={onComplete}
    >
      {/* 彩带效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              background: `hsl(${Math.random() * 360}, 80%, 70%)`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
            animate={{
              y: [0, window.innerHeight * 1.2],
              x: [0, (Math.random() - 0.5) * 200],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              opacity: [1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              delay: Math.random() * 2,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* 星星效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-4xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              rotate: [0, 180],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: Math.random() * 2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {/* 中心内容 */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center text-white z-10 px-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="text-8xl mb-6"
        >
          🎉
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold mb-4"
        >
          恭喜完成！
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-xl text-white/90 mb-8"
        >
          AI正在为你分析最佳匹配...
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-3xl font-bold">9</div>
            <div className="text-sm text-white/70">维度分析</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-3xl font-bold">66</div>
            <div className="text-sm text-white/70">问题完成</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-3xl font-bold">AI</div>
            <div className="text-sm text-white/70">智能匹配</div>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-white text-rose-600 font-bold rounded-full shadow-xl text-lg"
          onClick={onComplete}
        >
          查看匹配结果 →
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// 继续答题提示组件
function ContinuePrompt({ 
  savedProgress, 
  onContinue, 
  onRestart,
  onClose 
}: { 
  savedProgress: { question: number; answers: Record<number, any> }
  onContinue: () => void
  onRestart: () => void
  onClose: () => void
}) {
  const progressPercent = Math.round((savedProgress.question / questions.length) * 100)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">欢迎回来！</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">已完成进度</span>
            <span className="text-2xl font-bold text-rose-500">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
            />
          </div>
          <div className="mt-3 text-center text-gray-500">
            已答 {savedProgress.question} / {questions.length} 题
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-rose-400 mt-0.5" />
            <div className="text-sm text-gray-700">
              继续完成问卷，获取你的专属匹配分析！
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3 border-2 border-gray-200 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            重新开始
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium hover:shadow-lg transition-all"
          >
            继续答题
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function QuestionnairePage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [showCelebration, setShowCelebration] = useState(false)
  const [showContinuePrompt, setShowContinuePrompt] = useState(false)
  const [hasCheckedProgress, setHasCheckedProgress] = useState(false)

  // 检查是否有保存的进度
  useEffect(() => {
    const savedData = localStorage.getItem('questionnaireProgress')
    if (savedData && !hasCheckedProgress) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.question > 0 && Object.keys(parsed.answers).length > 0) {
          setShowContinuePrompt(true)
        }
      } catch (e) {
        console.error('Failed to parse saved progress:', e)
      }
      setHasCheckedProgress(true)
    }
  }, [hasCheckedProgress])

  // 自动保存进度
  useEffect(() => {
    if (currentQuestion > 0 || Object.keys(answers).length > 0) {
      localStorage.setItem('questionnaireProgress', JSON.stringify({
        question: currentQuestion,
        answers,
        timestamp: Date.now()
      }))
    }
  }, [currentQuestion, answers])

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentGroup = question.group.split('-')[0] || question.group
  const groupIndex = groups.indexOf(currentGroup) + 1

  const getGroupProgress = () => {
    const groupQuestions = questions.filter(q => (q.group.split('-')[0] || q.group) === currentGroup)
    if (groupQuestions.length === 0) return 0
    const currentInGroup = groupQuestions.findIndex(q => q.id === question.id) + 1
    return Math.round((currentInGroup / groupQuestions.length) * 100)
  }

  const groupProgress = getGroupProgress()

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({ ...prev, [question.id]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(prev => prev + 1)
  }

  const handlePrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1)
  }

  const handleSubmit = () => {
    localStorage.setItem('questionnaireAnswers', JSON.stringify(answers))
    localStorage.removeItem('questionnaireProgress') // 清除进度
    setShowCelebration(true)
  }

  const handleCelebrationComplete = () => {
    setShowCelebration(false)
    router.push('/dashboard')
  }

  const handleContinueFromSaved = () => {
    const savedData = localStorage.getItem('questionnaireProgress')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setCurrentQuestion(parsed.question)
        setAnswers(parsed.answers)
      } catch (e) {
        console.error('Failed to restore progress:', e)
      }
    }
    setShowContinuePrompt(false)
  }

  const handleRestart = () => {
    localStorage.removeItem('questionnaireProgress')
    setCurrentQuestion(0)
    setAnswers({})
    setShowContinuePrompt(false)
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option: any, index: number) => {
              const value = typeof option === 'string' ? option : option.value
              const label = typeof option === 'string' ? option : option.label
              const isSelected = answers[question.id] === value
              return (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(value)}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${isSelected ? 'border-rose-400 bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg shadow-rose-200/50' : 'border-white/50 bg-white/50 hover:border-rose-200 hover:bg-white/80'}`}
                  whileHover={{ scale: 1.01, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-rose-500 bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-300/50' : 'border-gray-300 bg-white'}`}>
                      {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="w-4 h-4 text-white" strokeWidth={3} /></motion.div>}
                    </div>
                    <span className="font-medium text-gray-700">{label}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )

      case 'multiple_choice':
        const selectedAnswers = answers[question.id] || []
        const maxSelect = question.maxSelect || 5
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">已选择 <span className="font-bold text-rose-500">{selectedAnswers.length}</span> / {maxSelect} 个</p>
              {selectedAnswers.length >= maxSelect && <Tag color="rose">已达上限</Tag>}
            </div>
            {question.options?.map((option: string, index: number) => {
              const isSelected = selectedAnswers.includes(option)
              const canSelect = selectedAnswers.length < maxSelect || isSelected
              return (
                <motion.button
                  key={index}
                  onClick={() => {
                    if (!canSelect) return
                    const newAnswers = isSelected ? selectedAnswers.filter((a: string) => a !== option) : [...selectedAnswers, option]
                    handleAnswer(newAnswers)
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${isSelected ? 'border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 shadow-lg shadow-pink-200/50' : canSelect ? 'border-white/50 bg-white/50 hover:border-pink-200 hover:bg-white/80' : 'border-gray-100 bg-gray-50/50 opacity-50 cursor-not-allowed'}`}
                  whileHover={canSelect ? { scale: 1.01, x: 4 } : {}}
                  whileTap={canSelect ? { scale: 0.99 } : {}}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'border-pink-500 bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-300/50' : 'border-gray-300 bg-white'}`}>
                      {isSelected && <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}><Check className="w-4 h-4 text-white" strokeWidth={3} /></motion.div>}
                    </div>
                    <span className="font-medium text-gray-700">{option}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )

      case 'open_text':
        return (
          <div className="space-y-4">
            <motion.textarea
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              placeholder={question.placeholder}
              maxLength={question.maxLength}
              rows={3}
              className="w-full p-5 rounded-2xl border-2 border-white/50 bg-white/60 focus:border-rose-300 focus:bg-white/80 focus:ring-4 focus:ring-rose-100 transition-all resize-none text-gray-700 placeholder-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            />
            <div className="flex justify-end">
              <span className="text-sm text-gray-400">{(answers[question.id]?.length || 0)} / {question.maxLength}</span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatedBackground variant="romance" showFloatingHearts>
      <div className="min-h-screen py-4 sm:py-6 md:py-10 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* 顶部导航 */}
          <FadeIn className="flex items-center justify-between mb-4 sm:mb-6">
            <button onClick={handlePrev} disabled={currentQuestion === 0} className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-500 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all bg-white/50 backdrop-blur-sm rounded-full text-sm sm:text-base">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /><span className="hidden sm:inline">上一题</span>
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-300/50">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-600">第 {groupIndex} 组 / 共 {groups.length} 组</span>
            </div>
            <div className="w-16 sm:w-20" />
          </FadeIn>

          {/* 进度组件 - 集成九大维度显示 */}
          <FadeIn delay={0.1} className="mb-4 sm:mb-6">
            <QuestionnaireProgress 
              currentQuestion={currentQuestion + 1} 
              totalQuestions={questions.length} 
              currentGroup={currentGroup} 
            />
          </FadeIn>

          {/* 问卷内容 */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion} variants={fadeInUp} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}>
              <GlassCard className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm text-rose-600 font-medium">{question.group}</span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 leading-relaxed">{question.question}</h2>
                {renderQuestion()}
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* 提示卡片 */}
          <FadeIn delay={0.2}>
            <GlassCard className="p-3 sm:p-4 mb-4 sm:mb-6 bg-gradient-to-r from-rose-50/80 to-pink-50/80 border-rose-200/50">
              <p className="text-xs sm:text-sm text-rose-700 flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" fill="currentColor" />
                了解你的{currentGroup.toLowerCase()}，帮助我们匹配更合适的人
              </p>
            </GlassCard>
          </FadeIn>

          {/* 底部按钮 */}
          <FadeIn delay={0.3} className="flex justify-between items-center">
            <motion.button 
              onClick={handlePrev} 
              disabled={currentQuestion === 0} 
              className="px-4 sm:px-6 py-2.5 sm:py-3 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-rose-500 transition-colors bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl text-sm sm:text-base" 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              ← 上一题
            </motion.button>
            {currentQuestion === questions.length - 1 ? (
              <GradientButton size="lg" onClick={handleSubmit}>
                <span className="flex items-center gap-2 text-sm sm:text-base"><Heart className="w-4 h-4 sm:w-5 sm:h-5" fill="white" />完成问卷</span>
              </GradientButton>
            ) : (
              <GradientButton size="lg" onClick={handleNext}>
                <span className="flex items-center gap-2 text-sm sm:text-base">下一题<ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" /></span>
              </GradientButton>
            )}
          </FadeIn>
        </div>
      </div>

      {/* 庆祝动画 */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay onComplete={handleCelebrationComplete} />
        )}
      </AnimatePresence>

      {/* 继续答题提示 */}
      <AnimatePresence>
        {showContinuePrompt && (
          <ContinuePrompt
            savedProgress={JSON.parse(localStorage.getItem('questionnaireProgress') || '{"question":0,"answers":{}}')}
            onContinue={handleContinueFromSaved}
            onRestart={handleRestart}
            onClose={() => setShowContinuePrompt(false)}
          />
        )}
      </AnimatePresence>
    </AnimatedBackground>
  )
}
