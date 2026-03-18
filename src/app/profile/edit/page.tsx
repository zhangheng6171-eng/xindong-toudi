'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Camera, Heart, MapPin, Briefcase, GraduationCap,
  ChevronRight, Sparkles, Save, X
} from 'lucide-react'

export default function EditProfilePage() {
  const [profile, setProfile] = useState({
    nickname: '小明',
    age: 28,
    gender: 'male',
    city: '北京',
    occupation: '产品经理',
    education: '硕士',
    height: 175,
    bio: '热爱生活，喜欢探索新事物，周末喜欢骑行和看电影～',
    interests: ['旅行', '美食', '摄影', '电影', '骑行', '阅读'],
    lookingFor: {
      minAge: 24,
      maxAge: 30,
      cities: ['北京'],
      relationship: 'serious' // serious, casual, not_sure
    }
  })

  const [activeSection, setActiveSection] = useState<string | null>(null)

  const interestOptions = [
    '旅行', '美食', '摄影', '电影', '音乐', '阅读',
    '运动', '健身', '瑜伽', '骑行', '游泳', '滑雪',
    '游戏', '动漫', '绘画', '书法', '舞蹈', '烹饪',
    '投资', '创业', '科技', '汽车', '宠物', '园艺'
  ]

  const handleSave = () => {
    // TODO: 保存到后端
    console.log('Saving profile:', profile)
    alert('保存成功！')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button className="text-gray-600 hover:text-gray-900">
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">编辑资料</h1>
          <button 
            onClick={handleSave}
            className="flex items-center text-rose-500 font-medium hover:text-rose-600"
          >
            <Save className="w-4 h-4 mr-1" />
            保存
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* 头像 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-sm p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                {profile.nickname[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="ml-6 flex-1">
              <h2 className="text-xl font-bold text-gray-900">{profile.nickname}</h2>
              <p className="text-gray-500">{profile.age}岁 · {profile.city}</p>
            </div>
          </div>
        </motion.div>

        {/* 基本信息 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => setActiveSection(activeSection === 'basic' ? null : 'basic')}
          >
            <div className="flex items-center">
              <User className="w-5 h-5 text-rose-500 mr-3" />
              <span className="font-medium text-gray-900">基本信息</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${activeSection === 'basic' ? 'rotate-90' : ''}`} />
          </div>

          {activeSection === 'basic' && (
            <motion.div 
              className="px-4 pb-4 space-y-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">昵称</label>
                  <input 
                    type="text"
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">年龄</label>
                  <input 
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">性别</label>
                  <select 
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">城市</label>
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-xl">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <input 
                      type="text"
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="flex-1 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">职业</label>
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-xl">
                    <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                    <input 
                      type="text"
                      value={profile.occupation}
                      onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                      className="flex-1 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">学历</label>
                  <div className="flex items-center px-3 py-2 bg-gray-50 rounded-xl">
                    <GraduationCap className="w-4 h-4 text-gray-400 mr-2" />
                    <input 
                      type="text"
                      value={profile.education}
                      onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                      className="flex-1 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1">身高 (cm)</label>
                <input 
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 个人简介 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => setActiveSection(activeSection === 'bio' ? null : 'bio')}
          >
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-purple-500 mr-3" />
              <span className="font-medium text-gray-900">个人简介</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${activeSection === 'bio' ? 'rotate-90' : ''}`} />
          </div>

          {activeSection === 'bio' && (
            <motion.div 
              className="px-4 pb-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
            >
              <textarea 
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="写点有趣的自我介绍..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              />
              <p className="text-xs text-gray-400 mt-2 text-right">
                {profile.bio.length}/200
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* 兴趣爱好 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => setActiveSection(activeSection === 'interests' ? null : 'interests')}
          >
            <div className="flex items-center">
              <Heart className="w-5 h-5 text-pink-500 mr-3" />
              <span className="font-medium text-gray-900">兴趣爱好</span>
              <span className="ml-2 text-xs text-gray-400">已选 {profile.interests.length}/10</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${activeSection === 'interests' ? 'rotate-90' : ''}`} />
          </div>

          {activeSection === 'interests' && (
            <motion.div 
              className="px-4 pb-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
            >
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      if (profile.interests.includes(interest)) {
                        setProfile({ 
                          ...profile, 
                          interests: profile.interests.filter(i => i !== interest) 
                        })
                      } else if (profile.interests.length < 10) {
                        setProfile({ 
                          ...profile, 
                          interests: [...profile.interests, interest] 
                        })
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      profile.interests.includes(interest)
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 匹配偏好 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => setActiveSection(activeSection === 'preferences' ? null : 'preferences')}
          >
            <div className="flex items-center">
              <Heart className="w-5 h-5 text-rose-500 mr-3" />
              <span className="font-medium text-gray-900">匹配偏好</span>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${activeSection === 'preferences' ? 'rotate-90' : ''}`} />
          </div>

          {activeSection === 'preferences' && (
            <motion.div 
              className="px-4 pb-4 space-y-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
            >
              <div>
                <label className="block text-sm text-gray-500 mb-2">年龄范围</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="number"
                    value={profile.lookingFor.minAge}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      lookingFor: { ...profile.lookingFor, minAge: parseInt(e.target.value) || 18 } 
                    })}
                    className="w-20 px-3 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 text-center"
                  />
                  <span className="text-gray-400">—</span>
                  <input 
                    type="number"
                    value={profile.lookingFor.maxAge}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      lookingFor: { ...profile.lookingFor, maxAge: parseInt(e.target.value) || 50 } 
                    })}
                    className="w-20 px-3 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 text-center"
                  />
                  <span className="text-gray-500">岁</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">期望关系</label>
                <div className="flex space-x-2">
                  {[
                    { value: 'serious', label: '认真恋爱' },
                    { value: 'casual', label: '轻松交往' },
                    { value: 'not_sure', label: '随缘' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setProfile({ 
                        ...profile, 
                        lookingFor: { ...profile.lookingFor, relationship: option.value } 
                      })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                        profile.lookingFor.relationship === option.value
                          ? 'bg-rose-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* 完成按钮 */}
        <motion.button
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          保存修改
        </motion.button>
      </div>
    </div>
  )
}
