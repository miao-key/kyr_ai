import React, { useState, useEffect } from 'react'
import { Button, Space, Card, Image } from 'react-vant'
import { useAuthStore } from '../../stores'
import { getRandomAvatar } from '../../api/pexels'
import UserAvatar from '../../components/UI/UserAvatar'

const AvatarTest = () => {
  const { user, isAuthenticated, login } = useAuthStore()
  const [testAvatar, setTestAvatar] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  const testGetRandomAvatar = async () => {
    setLoading(true)
    try {
      console.log('🧪 测试调用getRandomAvatar...')
      const avatar = await getRandomAvatar()
      console.log('🧪 getRandomAvatar返回:', avatar)
      setTestAvatar(avatar || '获取失败')
    } catch (error) {
      console.error('🧪 getRandomAvatar错误:', error)
      setTestAvatar('获取失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoginLoading(true)
    try {
      console.log('🧪 测试登录流程...')
      const result = await login({ username: 'testuser', password: 'password' })
      console.log('🧪 登录结果:', result)
    } catch (error) {
      console.error('🧪 登录错误:', error)
    } finally {
      setLoginLoading(false)
    }
  }

    useEffect(() => {
        console.log('🧪 测试页面 - 当前用户信息:', user)
    }, [user])

  return (
    <div style={{ padding: '20px' }}>
      <h2>头像测试页面</h2>
      
      <Card title="当前用户信息" style={{ marginBottom: '20px' }}>
        <p>登录状态: {isAuthenticated ? '已登录' : '未登录'}</p>
        <p>用户: {user ? user.username : '未登录'}</p>
        <p>头像URL: {user?.avatar || '无'}</p>
        <UserAvatar size={80} />
      </Card>

      <Card title="登录测试" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            loading={loginLoading}
            onClick={testLogin}
          >
            测试登录流程（观察头像获取）
          </Button>
          <p style={{ fontSize: '12px', color: '#666' }}>
            点击后会执行完整的登录流程，包括头像获取，请查看控制台日志
          </p>
        </Space>
      </Card>

      <Card title="API测试" style={{ marginBottom: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="primary" 
            loading={loading}
            onClick={testGetRandomAvatar}
          >
            直接测试获取随机头像API
          </Button>
          
          {testAvatar && (
            <div>
              <p>获取到的头像URL: {testAvatar}</p>
              {testAvatar.startsWith('http') && (
                <Image src={testAvatar} width={80} height={80} round />
              )}
            </div>
          )}
        </Space>
      </Card>

      <Card title="UserAvatar组件测试">
        <Space direction="vertical">
          <div>
            <p>有头像URL的情况:</p>
            <UserAvatar 
              size={80} 
              userInfo={{ 
                nickname: '测试用户', 
                avatar: testAvatar || 'https://images.pexels.com/photos/1000445/pexels-photo-1000445.jpeg' 
              }} 
            />
          </div>
          
          <div>
            <p>无头像URL的情况:</p>
            <UserAvatar 
              size={80} 
              userInfo={{ 
                nickname: '无头像用户', 
                avatar: null 
              }} 
            />
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default AvatarTest