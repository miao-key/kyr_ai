import React, { useState, useEffect } from 'react'
import { Settings, User, Palette, Zap } from 'lucide-react'
import { getAvatarPreferences, setAvatarPreferences, getAvatarOptions } from '../api/pexels'

interface AvatarPreferencesProps {
  onPreferencesChange?: (preferences: any) => void
  showPreview?: boolean
}

const AvatarPreferences: React.FC<AvatarPreferencesProps> = ({ 
  onPreferencesChange, 
  showPreview = true 
}) => {
  const [preferences, setPreferences] = useState({
    type: 'mixed',
    quality: 'high',
    style: 'professional',
    autoUpdate: true
  })
  
  const [previewAvatars, setPreviewAvatars] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // 加载用户偏好设置
  useEffect(() => {
    const userPrefs = getAvatarPreferences()
    setPreferences(userPrefs)
  }, [])

  // 当偏好设置改变时，更新预览
  useEffect(() => {
    if (showPreview && isOpen) {
      loadPreviewAvatars()
    }
  }, [preferences, showPreview, isOpen])

  // 加载预览头像
  const loadPreviewAvatars = async () => {
    setIsLoading(true)
    try {
      const avatars = await getAvatarOptions(4, preferences)
      setPreviewAvatars(avatars)
    } catch (error) {
      console.error('加载预览头像失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 更新偏好设置
  const updatePreference = (key: string, value: any) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    setAvatarPreferences(newPrefs)
    onPreferencesChange?.(newPrefs)
  }

  const typeOptions = [
    { value: 'mixed', label: '混合头像', icon: Zap, desc: '智能混合真人照片和卡通头像' },
    { value: 'pexels', label: '真人照片', icon: User, desc: '使用高质量的真人肖像照片' },
    { value: 'dicebear', label: '卡通头像', icon: Palette, desc: '使用可爱的AI生成卡通头像' }
  ]

  const qualityOptions = [
    { value: 'high', label: '高质量', desc: '最佳画质，加载稍慢' },
    { value: 'medium', label: '中等质量', desc: '平衡画质与速度' },
    { value: 'low', label: '低质量', desc: '快速加载，画质一般' }
  ]

  const styleOptions = [
    { value: 'professional', label: '专业风格', desc: '商务、正式的头像风格' },
    { value: 'casual', label: '休闲风格', desc: '轻松、友好的头像风格' },
    { value: 'artistic', label: '艺术风格', desc: '创意、个性的头像风格' }
  ]

  return (
    <div className="relative">
      {/* 设置按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm font-medium">头像设置</span>
      </button>

      {/* 设置面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">头像偏好设置</h3>
            </div>

            {/* 头像类型选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                头像类型
              </label>
              <div className="space-y-2">
                {typeOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        preferences.type === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="avatarType"
                        value={option.value}
                        checked={preferences.type === option.value}
                        onChange={(e) => updatePreference('type', e.target.value)}
                        className="mt-1"
                      />
                      <IconComponent className="w-5 h-5 text-gray-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* 质量选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                图片质量
              </label>
              <div className="space-y-2">
                {qualityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      preferences.quality === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="avatarQuality"
                      value={option.value}
                      checked={preferences.quality === option.value}
                      onChange={(e) => updatePreference('quality', e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 风格选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                头像风格
              </label>
              <div className="space-y-2">
                {styleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      preferences.style === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="avatarStyle"
                      value={option.value}
                      checked={preferences.style === option.value}
                      onChange={(e) => updatePreference('style', e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 自动更新选项 */}
            <div className="mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.autoUpdate}
                  onChange={(e) => updatePreference('autoUpdate', e.target.checked)}
                  className="rounded"
                />
                <div>
                  <div className="font-medium text-gray-900">自动更新头像</div>
                  <div className="text-sm text-gray-500">定期自动更换新的头像</div>
                </div>
              </label>
            </div>

            {/* 预览区域 */}
            {showPreview && (
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">预览效果</h4>
                  <button
                    onClick={loadPreviewAvatars}
                    disabled={isLoading}
                    className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? '加载中...' : '刷新预览'}
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {previewAvatars.map((avatar, index) => (
                    <div key={avatar.metadata?.id || index} className="relative group">
                      <img
                        src={avatar.avatar}
                        alt={`预览头像 ${index + 1}`}
                        className="w-full aspect-square rounded-lg object-cover border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback-${index}`
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          {avatar.source === 'pexels' ? '真人' : '卡通'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {previewAvatars.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无预览</p>
                  </div>
                )}
              </div>
            )}

            {/* 关闭按钮 */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                完成设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 背景遮罩 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default AvatarPreferences