import useTitle from '@/hooks/useTitle'
import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../../stores'
import { useNavigate } from 'react-router-dom'
import { Image, ActionSheet, Cell, CellGroup, Badge, Progress, Grid, GridItem, Popup, Button, Space, Tag, Notify, Field, Form, Dialog } from 'react-vant'
import { UserAvatar } from '@/components/UI'
import {
    LikeO,
    Star,
    ChatO,
    Location,
    PhotoO,
    CartO,
    CouponO,
    Setting,
    Share,
    Service,
    Fire,
    Award,
    UserO,
    Edit
} from '@react-vant/icons'
import { generateTravelAvatar } from '@/api'
import { formatUserDisplayName, generateAvatarUrl } from '@/utils/auth'
import styles from './account.module.css'

// 旅行足迹数据
const travelStats = [
    { icon: <Location />, label: '城市', count: 28, color: '#FF6B6B' },
    { icon: <Location />, label: '国家', count: 8, color: '#4ECDC4' },
    { icon: <PhotoO />, label: '照片', count: 1200, color: '#FFD93D' },
    { icon: <ChatO />, label: '游记', count: 23, color: '#A29BFE' }
]

// 旅行成就
const travelAchievements = [
    { icon: '🏆', title: '旅行达人', desc: '已访问20+城市', level: 'gold', progress: 85 },
    { icon: '📸', title: '摄影师', desc: '上传1000+照片', level: 'silver', progress: 70 },
    { icon: '✍️', title: '游记作家', desc: '发布20+游记', level: 'bronze', progress: 60 },
    { icon: '🌟', title: '探索者', desc: '足迹遍布5大洲', level: 'diamond', progress: 40 }
]

// 快捷功能
const quickActions = [
    { icon: <Location />, text: '足迹地图', color: '#FF6B6B', desc: '查看我的旅行足迹' },
    { icon: <Star />, text: '收藏夹', color: '#4ECDC4', desc: '我的心愿清单' },
    { icon: <ChatO />, text: '攻略', color: '#FFD93D', desc: '我的旅行攻略' },
    { icon: <UserO />, text: '旅伴', color: '#A29BFE', desc: '寻找旅行伙伴' }
]

// 我的服务
const myServices = [
    { 
        icon: <CartO />, 
        text: '我的订单', 
        badge: { count: 2, type: 'danger' }, 
        desc: '查看预订记录',
        color: '#FF6B6B' 
    },
    { 
        icon: <CouponO />, 
        text: '优惠券', 
        badge: { count: 5, type: 'warning' }, 
        desc: '专属旅行优惠',
        color: '#FFD93D' 
    },
    { 
        icon: <Award />, 
        text: '会员权益', 
        badge: { count: 'VIP', type: 'primary' }, 
        desc: '专享会员福利',
        color: '#7C3AED' 
    },
    { 
        icon: <Fire />, 
        text: '限时活动', 
        badge: { count: 'HOT', type: 'success' }, 
        desc: '热门活动推荐',
        color: '#FF6B6B' 
    },
    { 
        icon: <Service />, 
        text: '客服中心', 
        desc: '24小时在线服务',
        color: '#4ECDC4' 
    },
    { 
        icon: <Setting />, 
        text: '设置', 
        desc: '个人偏好设置',
        color: '#64748B' 
    },
    { 
        icon: <span style={{ fontSize: '18px' }}>🚪</span>, 
        text: '退出登录', 
        desc: '安全退出账户',
        color: '#FF6B6B',
        isLogout: true
    }
]

// 近期活动
const recentActivities = [
    { type: 'photo', content: '在巴厘岛上传了8张照片', time: '2小时前', avatar: '🏖️' },
    { type: 'review', content: '为"三亚亚龙湾"写了评价', time: '1天前', avatar: '⭐' },
    { type: 'plan', content: '制定了"日本7日游"计划', time: '3天前', avatar: '📅' }
]

const Account = () => {
    const { user, logout, updateUser, generateAvatar, isAuthenticated, isLoading } = useAuthStore()
    const navigate = useNavigate()
    
    // 调试日志 - 显示当前认证状态
    useEffect(() => {
        console.log('🔍 Account页面 - 认证状态检查:')
        console.log('  - isLoading:', isLoading)
        console.log('  - isAuthenticated:', isAuthenticated)
        console.log('  - user:', user)
    }, [isLoading, isAuthenticated, user])
    
    // 如果正在加载认证状态，显示加载界面
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{ fontSize: '24px' }}>🔄</div>
                <div>验证登录状态...</div>
            </div>
        )
    }
    
    // 如果未认证，显示提示信息
    if (!isAuthenticated || !user) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                gap: '16px',
                padding: '20px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '48px' }}>🔐</div>
                <h2>需要登录</h2>
                <p>请先登录以访问个人中心</p>
                <button 
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '12px 24px',
                        background: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                    }}
                >
                    去登录
                </button>
            </div>
        )
    }
    
    // 合并认证系统用户信息和旅行相关扩展信息
    const [extendedUserInfo, setExtendedUserInfo] = useState(() => {
        // 从localStorage获取扩展的旅行信息
        const savedExtendedInfo = localStorage.getItem('userExtendedInfo')
        const defaultExtended = {
            level: '黄金旅行家',
            levelProgress: 75,
            nextLevel: '钻石旅行家',
            travelDays: 365,
            joinDate: '2023.06',
            location: '上海',
            followers: 1024,
            following: 256
        }
        
        try {
            return savedExtendedInfo ? JSON.parse(savedExtendedInfo) : defaultExtended
        } catch (error) {
            console.warn('解析扩展用户信息失败:', error)
            return defaultExtended
        }
    })
    
    // 合并用户信息 - 添加安全检查
    const userInfo = {
        nickname: user ? formatUserDisplayName(user) : '未登录用户',
        signature: user?.preferences?.travelMotto || '世界那么大，我想去看看 ✈️',
        avatar: user?.avatar || (user ? generateAvatarUrl(user) : 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'),
        ...extendedUserInfo
    }
    
    // 调试日志 - 显示头像信息
    console.log('🏠 Account页面 - 用户头像信息:', {
        userAvatar: user?.avatar,
        userInfoAvatar: userInfo.avatar,
        user: user
    })

    // 页面调试信息
    const debugInfo = {
        isAuthenticated,
        userExists: !!user,
        userAvatar: user?.avatar,
        userInfoAvatar: userInfo.avatar,
        avatarType: user?.avatar && typeof user.avatar === 'string' ? 
            (user.avatar.includes('dicebear') ? 'DiceBear' : 
             user.avatar.includes('pexels') ? 'Pexels' : 'Other') : 'None'
    }
    
    useTitle('智旅-我的')
    const [showAvatarSheet, setShowAvatarSheet] = useState(false)
    const [showAchievementDetail, setShowAchievementDetail] = useState(false)
    const [selectedAchievement, setSelectedAchievement] = useState(null)
    const [showEditProfile, setShowEditProfile] = useState(false)
    const [editForm, setEditForm] = useState({
        nickname: userInfo.nickname,
        signature: userInfo.signature
    })
    
    // 用于文件上传的ref
    const fileInputRef = useRef(null)
    // 用于跟踪组件是否已卸载
    const isMountedRef = useRef(true)
    
    // 初始化扩展用户信息
    useEffect(() => {
        // 确保localStorage中有扩展用户信息
        if (!localStorage.getItem('userExtendedInfo')) {
            localStorage.setItem('userExtendedInfo', JSON.stringify(extendedUserInfo))
        }
    }, [])
    
    // 安全的提示函数 - 使用Notify替代Toast避免reactRender错误
    // 多重降级保护：Notify -> console -> 静默忽略
    const safeNotify = {
        success: (message) => {
            if (!isMountedRef.current) return
            
            try {
                // 第一级：尝试使用Notify
                Notify({ type: 'success', message, duration: 2000 })
                console.log('✅ 成功:', message)
            } catch (error) {
                console.warn('Notify调用失败，使用控制台输出:', error)
                // 第二级：降级为增强的控制台输出
                console.log(`%c✅ 成功: ${message}`, 'color: #52c41a; font-weight: bold;')
                
                try {
                    // 第三级：尝试使用原生alert作为最后手段（仅在重要操作时）
                    if (message.includes('成功') || message.includes('完成')) {
                        // 对重要的成功消息使用原生提示
                        setTimeout(() => {
                            if (isMountedRef.current && confirm(`${message}\n\n点击确定继续`)) {
                                // 用户确认
                            }
                        }, 100)
                    }
                } catch (e) {
                    // 完全静默，避免任何可能的错误
                    console.log('所有提示方式都失败，静默处理:', message)
                }
            }
        },
        fail: (message) => {
            if (!isMountedRef.current) return
            
            try {
                Notify({ type: 'danger', message, duration: 3000 })
                console.log('❌ 错误:', message)
            } catch (error) {
                console.warn('Notify调用失败，使用控制台输出:', error)
                console.log(`%c❌ 错误: ${message}`, 'color: #ff4d4f; font-weight: bold;')
                
                try {
                    // 错误消息更重要，尝试alert
                    if (message.includes('失败') || message.includes('错误')) {
                        setTimeout(() => {
                            if (isMountedRef.current) {
                                alert(`⚠️ ${message}`)
                            }
                        }, 100)
                    }
                } catch (e) {
                    console.log('所有错误提示方式都失败，静默处理:', message)
                }
            }
        },
        loading: (message) => {
            if (!isMountedRef.current) return { clear: () => {} }
            
            try {
                Notify({ type: 'primary', message, duration: 0 })
                console.log('⏳ 加载:', message)
                return {
                    clear: () => {
                        try {
                            Notify.clear()
                        } catch (e) {
                            console.warn('Notify清除失败:', e)
                        }
                    }
                }
            } catch (error) {
                console.warn('Notify loading调用失败，使用控制台输出:', error)
                console.log(`%c⏳ 加载: ${message}`, 'color: #1890ff; font-weight: bold;')
                return { 
                    clear: () => {
                        console.log('%c⏳ 加载完成', 'color: #52c41a; font-weight: bold;')
                    } 
                }
            }
        }
    }

    const avatarActions = [
        { name: 'AI生成旅行头像', color: '#FF6B6B', type: 1 },
        { name: '从相册选择', color: '#4ECDC4', type: 2 }
    ]

    // 组件卸载时的清理
    useEffect(() => {
        return () => {
            isMountedRef.current = false
        }
    }, [])



    const handleAvatarAction = async (action) => {
        // 检查组件是否仍然挂载
        if (!isMountedRef.current) return
        
        // 立即关闭ActionSheet避免状态冲突
        setShowAvatarSheet(false)
        
        if (action.type === 1) {
            // AI生成头像逻辑
            let loadingToast = null
            
            try {
                // 显示加载提示
                loadingToast = safeNotify.loading('正在生成专属旅行头像...')
                
                // 使用认证系统的generateAvatar功能
                const result = await generateAvatar()
                
                // 检查组件是否仍然挂载
                if (!isMountedRef.current) {
                    if (loadingToast) loadingToast.clear()
                    return
                }
                
                // 关闭加载提示
                if (loadingToast) {
                    loadingToast.clear()
                    loadingToast = null
                }
                
                if (result.success) {
                    // 头像生成成功
                    console.log('AI头像生成成功:', result.avatar)
                } else {
                    throw new Error(result.error || '头像生成失败')
                }
                
                // 显示成功提示
                setTimeout(() => {
                    safeNotify.success('🎉 专属旅行头像生成成功！')
                }, 100)
                
            } catch (error) {
                console.error('头像生成失败:', error)
                
                // 检查组件是否仍然挂载
                if (!isMountedRef.current) {
                    if (loadingToast) loadingToast.clear()
                    return
                }
                
                // 关闭加载提示
                if (loadingToast) {
                    loadingToast.clear()
                    loadingToast = null
                }
                
                // 显示错误提示
                setTimeout(() => {
                    safeNotify.fail('头像生成失败，已为您创建备用头像')
                }, 100)
            }
        } else if (action.type === 2) {
            // 从相册选择图片
            setTimeout(() => {
                if (isMountedRef.current && fileInputRef.current) {
                    fileInputRef.current.click()
                }
            }, 100)
        }
    }

    // 处理文件选择
    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (!file || !isMountedRef.current) return

        // 验证文件类型 - 只允许图片
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            safeNotify.fail('只能上传图片文件（JPG、PNG、GIF、WebP格式）')
            return
        }

        // 验证文件大小 (5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            safeNotify.fail('图片大小不能超过5MB')
            return
        }

        // 读取文件并更新头像
        const reader = new FileReader()
        reader.onload = (e) => {
            if (isMountedRef.current) {
                // 使用认证系统更新用户头像
                const result = updateUser({ avatar: e.target.result })
                if (result.success) {
                    setTimeout(() => {
                        safeNotify.success('头像更新成功！')
                    }, 100)
                } else {
                    safeNotify.fail('头像更新失败')
                }
            }
        }
        reader.onerror = () => {
            safeNotify.fail('图片读取失败，请重试')
        }
        reader.readAsDataURL(file)

        // 清空input值，允许重复选择同一文件
        event.target.value = ''
    }

    const handleAchievementClick = (achievement) => {
        setSelectedAchievement(achievement)
        setShowAchievementDetail(true)
    }

    const handleQuickAction = (action) => {
        switch(action.text) {
            case '足迹地图':
                safeNotify.success('跳转到足迹地图页面')
                // navigate('/footprint-map')
                break
            case '收藏夹':
                safeNotify.success('查看我的收藏')
                // navigate('/favorites')
                break
            case '攻略':
                safeNotify.success('查看旅行攻略')
                // navigate('/guides')
                break
            case '旅伴':
                safeNotify.success('寻找旅行伙伴')
                // navigate('/travel-partners')
                break
            default:
                safeNotify.success(`点击了: ${action.text}`)
        }
    }

    const handleStatClick = (stat) => {
        safeNotify.success(`查看${stat.label}详情`)
        // 这里可以跳转到对应的详情页面
    }

    const handleServiceClick = (service) => {
        if (service.text === '我的订单') {
            safeNotify.success('查看订单列表')
        } else if (service.text === '优惠券') {
            safeNotify.success('查看优惠券')
        } else if (service.text === '会员权益') {
            safeNotify.success('查看VIP权益')
        } else if (service.text === '限时活动') {
            if (isMountedRef.current) {
                try {
                    Notify({ type: 'primary', message: '发现热门活动！' })
                } catch (error) {
                    console.warn('Notify调用失败:', error)
                    safeNotify.success('发现热门活动！')
                }
            }
        } else if (service.text === '客服中心') {
            safeNotify.success('联系客服')
        } else if (service.text === '设置') {
            safeNotify.success('进入设置页面')
        } else if (service.text === '退出登录') {
            handleLogout()
        }
    }

    // 直接退出登录（不需要确认）
    const handleDirectLogout = () => {
        console.log('🚪 退出登录按钮被点击 - 直接退出')
        performLogout()
    }

    // 处理登出（保留原有的确认退出逻辑供其他地方使用）
    const handleLogout = () => {
        console.log('🚪 退出登录按钮被点击')
        
        try {
            // 尝试使用Dialog.confirm
            Dialog.confirm({
                title: '确认退出',
                message: '确定要退出登录吗？',
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            }).then(() => {
                console.log('✅ 用户确认退出')
                performLogout()
            }).catch(() => {
                console.log('❌ 用户取消退出')
            })
        } catch (error) {
            console.warn('Dialog.confirm失败，使用原生confirm:', error)
            // 降级到原生confirm
            if (window.confirm('确定要退出登录吗？')) {
                console.log('✅ 用户确认退出（原生确认）')
                performLogout()
            } else {
                console.log('❌ 用户取消退出（原生确认）')
            }
        }
    }

    // 执行退出登录的逻辑
    const performLogout = () => {
        try {
            console.log('🔄 开始执行退出登录')
            console.log('🔄 退出前状态 - isAuthenticated:', isAuthenticated)
            console.log('🔄 退出前状态 - user:', user)
            
            logout()
            
            console.log('✅ 退出登录成功，即将跳转')
            safeNotify.success('已安全退出')
            
            // 立即跳转到登录页面
            setTimeout(() => {
                console.log('🔄 跳转到登录页面')
                console.log('🔄 退出后状态 - isAuthenticated:', isAuthenticated)
                console.log('🔄 退出后状态 - user:', user)
                
                // 直接跳转到登录页面
                navigate('/login', { replace: true })
            }, 100)
        } catch (error) {
            console.error('退出登录过程中出错:', error)
            safeNotify.fail('退出失败，请重试')
        }
    }

    // 编辑个人信息
    const handleEditClick = () => {
        setEditForm({
            nickname: userInfo.nickname,
            signature: userInfo.signature
        })
        setShowEditProfile(true)
    }

    // 保存编辑
    const handleSaveProfile = () => {
        if (!isMountedRef.current) return
        
        if (!editForm.nickname.trim()) {
            safeNotify.fail('昵称不能为空')
            return
        }
        if (!editForm.signature.trim()) {
            safeNotify.fail('签名不能为空')
            return
        }
        
        // 使用认证系统更新用户信息
        const result = updateUser({ 
            nickname: editForm.nickname.trim(),
            preferences: {
                ...user?.preferences,
                travelMotto: editForm.signature.trim()
            }
        })
        
        if (result.success) {
            setShowEditProfile(false)
            setTimeout(() => {
                safeNotify.success('个人信息更新成功！')
            }, 100)
        } else {
            safeNotify.fail('更新失败，请重试')
        }
    }



    // 分享个人档案
    const handleShareProfile = () => {
        if (navigator.share) {
            navigator.share({
                title: `${userInfo.nickname}的旅行档案`,
                text: userInfo.signature,
                url: window.location.href
            })
        } else {
            // 复制链接到剪贴板
            navigator.clipboard.writeText(window.location.href)
            Toast.success('链接已复制到剪贴板')
        }
    }

    return (
        <div className={styles.travelAccountPage}>

            
            {/* 旅行档案头部 */}
            <div className={styles.travelProfileHeader}>
                <div className={styles.headerBackground}>
                    <div className={styles.headerOverlay}></div>
                </div>
                
                <div className={styles.profileContent}>
                    {/* 顶部操作按钮 */}
                    <div className={styles.topActions}>
                        <div className={styles.actionButton} onClick={handleShareProfile}>
                            <Share size={18} />
                        </div>
                        <div className={styles.actionButton} onClick={() => safeNotify.success('进入设置')}>
                            <Setting size={18} />
                        </div>
                        <div className={styles.actionButton} onClick={handleDirectLogout} title="退出登录">
                            <span style={{ fontSize: '16px' }}>🚪</span>
                        </div>
                    </div>



                    {/* 头像和基本信息 */}
                    <div className={styles.avatarSection}>
                        <div className={styles.travelAvatar}>
                            <UserAvatar
                                size={90}
                                round={true}
                                onClick={() => setShowAvatarSheet(true)}
                                className={styles.avatarImage}
                                userInfo={userInfo}
                            />
                            <div className={styles.cameraIcon}>
                                <PhotoO size={16} />
                            </div>
                        </div>
                        <div className={styles.userBasicInfo}>
                            <h2 className={styles.userName}>{userInfo.nickname}</h2>
                            <div className={styles.signatureContainer}>
                                <p className={styles.userSignature}>{userInfo.signature}</p>
                                <div className={styles.editIcon} onClick={handleEditClick}>
                                    <Edit size={14} />
                                </div>
                            </div>
                            <div className={styles.userMeta}>
                                <span className={styles.location}><Location size={12} /> {userInfo.location}</span>
                                <span className={styles.joinDate}>加入于 {userInfo.joinDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* 等级进度 */}
                    <div className={styles.levelSection}>
                        <div className={styles.levelInfo}>
                            <span className={styles.currentLevel}>{userInfo.level}</span>
                            <span className={styles.levelProgress}>距离{userInfo.nextLevel}还差{100 - userInfo.levelProgress}%</span>
                        </div>
                        <Progress 
                            percentage={userInfo.levelProgress} 
                            strokeWidth="8px"
                            color="linear-gradient(90deg, #FFD93D, #FF6B6B)"
                            trackColor="rgba(255,255,255,0.2)"
                        />
                    </div>

                    {/* 社交数据 */}
                    <div className={styles.socialStats}>
                        <div className={styles.socialItem}>
                            <div className={styles.socialNumber}>{userInfo.followers}</div>
                            <div className={styles.socialLabel}>粉丝</div>
                        </div>
                        <div className={styles.socialItem}>
                            <div className={styles.socialNumber}>{userInfo.following}</div>
                            <div className={styles.socialLabel}>关注</div>
                        </div>
                        <div className={styles.socialItem}>
                            <div className={styles.socialNumber}>{userInfo.travelDays}</div>
                            <div className={styles.socialLabel}>旅行天数</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 旅行数据统计 */}
            <div className={styles.travelStatsSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>我的足迹</h3>
                    <span className={styles.viewAll}>查看地图 →</span>
                </div>
                <div className={styles.statsGrid}>
                    {travelStats.map((stat, index) => (
                        <div 
                            key={index} 
                            className={styles.statCard}
                            onClick={() => handleStatClick(stat)}
                        >
                            <div className={styles.statIcon} style={{ color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className={styles.statNumber}>{stat.count}</div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* 快捷功能 */}
            <div className={styles.quickActionsSection}>
                <h3 className={styles.sectionTitle}>快捷功能</h3>
                <Grid className={styles.actionsGrid} columnNum={2} gutter={12}>
                    {quickActions.map((action, index) => (
                        <GridItem key={index} onClick={() => handleQuickAction(action)}>
                            <div className={styles.actionCard}>
                                <div className={styles.actionIcon} style={{ color: action.color }}>
                                    {action.icon}
                                </div>
                                <div className={styles.actionContent}>
                                    <div className={styles.actionTitle}>{action.text}</div>
                                    <div className={styles.actionDesc}>{action.desc}</div>
                                </div>
                            </div>
                        </GridItem>
                    ))}
                </Grid>
            </div>

            {/* 旅行成就 */}
            <div className={styles.achievementsSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>旅行成就</h3>
                    <span className={styles.viewAll}>查看全部 →</span>
                </div>
                <div className={styles.achievementsList}>
                    {travelAchievements.map((achievement, index) => (
                        <div 
                            key={index} 
                            className={styles.achievementCard}
                            onClick={() => handleAchievementClick(achievement)}
                        >
                            <div className={styles.achievementIcon}>{achievement.icon}</div>
                            <div className={styles.achievementInfo}>
                                <div className={styles.achievementTitle}>{achievement.title}</div>
                                <div className={styles.achievementDesc}>{achievement.desc}</div>
                                <Progress 
                                    percentage={achievement.progress} 
                                    strokeWidth="4px"
                                    color="#FFD93D"
                                    trackColor="#f5f5f5"
                                    showPivot={false}
                                />
                            </div>
                            <div className={`${styles.achievementLevel} ${styles[achievement.level]}`}>
                                <Award size={16} />
                            </div>
                        </div>
                    ))}
                    </div>
                    </div>

            {/* 近期动态 */}
            <div className={styles.activitiesSection}>
                <h3 className={styles.sectionTitle}>近期动态</h3>
                <div className={styles.activitiesList}>
                    {recentActivities.map((activity, index) => (
                        <div key={index} className={styles.activityItem}>
                            <div className={styles.activityAvatar}>{activity.avatar}</div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityText}>{activity.content}</div>
                                <div className={styles.activityTime}>{activity.time}</div>
                    </div>
                    </div>
                    ))}
                </div>
            </div>
            
            {/* 我的服务 */}
            <div className={styles.servicesSection}>
                <h3 className={styles.sectionTitle}>我的服务</h3>
                <CellGroup className={styles.servicesList} border={false}>
                    {myServices.map((service, index) => (
                        <Cell
                            key={index}
                            icon={
                                <div 
                                    className={styles.serviceIcon} 
                                    style={{ color: service.color }}
                                >
                                    {service.icon}
                                </div>
                            }
                            title={service.text}
                            label={service.desc}
                            rightIcon={
                                service.badge && (
                                    <div className={`${styles.customBadge} ${styles[service.badge.type]}`}>
                                        {service.badge.count}
                                    </div>
                                )
                            }
                            isLink
                            onClick={() => handleServiceClick(service)}
                        />
                    ))}
                </CellGroup>
            </div>
            
            {/* 退出登录区域 */}
            <div className={styles.logoutSection}>
                <div className={styles.logoutContainer}>
                    <div className={styles.logoutInfo}>
                        <div className={styles.logoutIcon}>
                            <span>🚪</span>
                        </div>
                        <div className={styles.logoutText}>
                            <h4>退出当前账户</h4>
                            <p>退出后将清除本地登录信息</p>
                        </div>
                    </div>
                    <Button 
                        type="danger" 
                        size="large"
                        round
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        安全退出
                    </Button>
                </div>
            </div>
            
            {/* 头像更换弹窗 */}
            <ActionSheet
                visible={showAvatarSheet}
                actions={avatarActions}
                cancelText="取消"
                onCancel={() => setShowAvatarSheet(false)}
                onSelect={handleAvatarAction}
            />

            {/* 成就详情弹窗 */}
            <Popup
                visible={showAchievementDetail}
                position="bottom"
                round
                onClose={() => setShowAchievementDetail(false)}
            >
                {selectedAchievement && (
                    <div className={styles.achievementDetail}>
                        <div className={styles.detailHeader}>
                            <div className={styles.detailIcon}>{selectedAchievement.icon}</div>
                            <div className={styles.detailTitle}>{selectedAchievement.title}</div>
                            <div className={styles.detailDesc}>{selectedAchievement.desc}</div>
                        </div>
                        <div className={styles.detailProgress}>
                            <div className={styles.progressLabel}>
                                进度: {selectedAchievement.progress}%
                            </div>
                            <Progress 
                                percentage={selectedAchievement.progress} 
                                strokeWidth="8px"
                                color="#FFD93D"
                            />
                        </div>
                        <div className={styles.detailActions}>
                            <Button 
                                type="primary" 
                                block 
                                round
                                onClick={() => setShowAchievementDetail(false)}
                            >
                                继续努力
                            </Button>
                        </div>
                    </div>
                )}
            </Popup>

            {/* 编辑个人信息弹窗 */}
            <Popup
                visible={showEditProfile}
                position="bottom"
                round
                onClose={() => setShowEditProfile(false)}
            >
                <div className={styles.editProfileModal}>
                    <div className={styles.editHeader}>
                        <h3 className={styles.editTitle}>编辑个人信息</h3>
                        <div className={styles.editSubtitle}>完善你的旅行档案</div>
                    </div>
                    
                    <Form className={styles.editForm}>
                        <div className={styles.editField}>
                            <label className={styles.fieldLabel}>
                                <UserO size={16} />
                                <span>昵称</span>
                            </label>
                            <Field
                                value={editForm.nickname}
                                onChange={(value) => setEditForm(prev => ({...prev, nickname: value}))}
                                placeholder="请输入昵称"
                                maxLength={10}
                                showWordLimit
                                className={styles.customField}
                            />
                        </div>
                        
                        <div className={styles.editField}>
                            <label className={styles.fieldLabel}>
                                <Edit size={16} />
                                <span>个性签名</span>
                            </label>
                            <Field
                                value={editForm.signature}
                                onChange={(value) => setEditForm(prev => ({...prev, signature: value}))}
                                placeholder="世界那么大，我想去看看..."
                                type="textarea"
                                rows={2}
                                maxLength={20}
                                showWordLimit
                                className={styles.customField}
                            />
                        </div>
                    </Form>
                    
                    <div className={styles.editActions}>
                        <Button 
                            className={styles.cancelBtn}
                            onClick={() => setShowEditProfile(false)}
                        >
                            取消
                        </Button>
                        <Button 
                            type="primary" 
                            className={styles.saveBtn}
                            onClick={handleSaveProfile}
                        >
                            保存
                        </Button>
                    </div>
                </div>
            </Popup>

            {/* 隐藏的文件输入元素 */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />
        </div>
    )
}

export default Account
