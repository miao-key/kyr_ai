import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Field, Button, Notify } from 'react-vant'
import styles from './login.module.css'

const Login = () => {
  const { login, register, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  // 获取重定向路径，默认为首页
  const from = location.state?.from?.pathname || '/home'
  
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  // 表单验证
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.length < 2) {
      newErrors.username = '用户名至少2个字符'
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6个字符'
    }
    
    if (!isLoginMode) {
      if (formData.phone && !/^1[3-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = '请输入有效的手机号'
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码输入不一致'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // 处理登录
  const handleLogin = async () => {
    if (!validateForm()) return
    
    try {
      const result = await login({
        username: formData.username,
        password: formData.password
      })
      
      if (result.success) {
        Notify({ type: 'success', message: '登录成功！欢迎来到智旅' })
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          navigate(from, { replace: true })
        }, 1000)
      } else {
        Notify({ type: 'danger', message: result.error || '登录失败' })
      }
    } catch (error) {
      console.error('登录错误:', error)
      Notify({ type: 'danger', message: '登录失败，请稍后重试' })
    }
  }

  // 处理注册
  const handleRegister = async () => {
    if (!validateForm()) return
    
    try {
      const result = await register({
        username: formData.username,
        password: formData.password,
        phone: formData.phone
      })
      
      if (result.success) {
        Notify({ type: 'success', message: '注册成功！欢迎加入智旅' })
        setTimeout(() => {
          navigate(from, { replace: true })
        }, 1000)
      } else {
        Notify({ type: 'danger', message: result.error || '注册失败' })
      }
    } catch (error) {
      console.error('注册错误:', error)
      Notify({ type: 'danger', message: '注册失败，请稍后重试' })
    }
  }

  // 切换登录/注册模式
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode)
    setFormData({
      username: '',
      password: '',
      phone: '',
      confirmPassword: ''
    })
    setErrors({})
  }



  // 处理返回首页
  const handleBackToHome = () => {
    navigate('/home', { replace: true })
  }

  return (
    <div className={styles.loginContainer}>
      {/* 右上角退出图标 */}
      <div className={styles.exitButton} onClick={handleBackToHome} title="返回首页">
        <span className={styles.exitIcon}>✕</span>
      </div>

      {/* 背景装饰 */}
      <div className={styles.backgroundDecoration}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>

      {/* 主要内容 */}
      <div className={styles.loginContent}>
        {/* Logo和标题 */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>✈️</span>
            <span className={styles.logoText}>智旅</span>
          </div>
          <h1 className={styles.title}>
            {isLoginMode ? '欢迎回来' : '加入智旅'}
          </h1>
          <p className={styles.subtitle}>
            {isLoginMode ? '继续你的旅行探索之旅' : '开始你的智能旅行体验'}
          </p>
        </div>

        {/* 登录表单 */}
        <div className={styles.formContainer}>
          <Form>
            {/* 用户名 */}
            <Field
              name="username"
              label="用户名"
              placeholder="请输入用户名"
              value={formData.username}
              onChange={(value) => handleInputChange('username', value)}
              errorMessage={errors.username}
              leftIcon="contact"
            />

            {/* 注册模式下的手机号 */}
            {!isLoginMode && (
              <Field
                name="phone"
                label="手机号"
                placeholder="请输入手机号（可选）"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                errorMessage={errors.phone}
                leftIcon="phone-o"
              />
            )}

            {/* 密码 */}
            <Field
              type="password"
              name="password"
              label="密码"
              placeholder={isLoginMode ? '请输入密码' : '设置密码（至少6位）'}
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              errorMessage={errors.password}
              leftIcon="lock"
            />

            {/* 注册模式下的确认密码 */}
            {!isLoginMode && (
              <Field
                type="password"
                name="confirmPassword"
                label="确认密码"
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={(value) => handleInputChange('confirmPassword', value)}
                errorMessage={errors.confirmPassword}
                leftIcon="lock"
              />
            )}
          </Form>

          {/* 操作按钮 */}
          <div className={styles.buttonGroup}>
            <Button
              type="primary"
              size="large"
              block
              loading={isLoading}
              className={styles.primaryButton}
              onClick={isLoginMode ? handleLogin : handleRegister}
            >
              {isLoginMode ? '登录' : '注册'}
            </Button>

            <Button
              type="default"
              size="large"
              block
              className={styles.secondaryButton}
              onClick={toggleMode}
            >
              {isLoginMode ? '还没有账号？立即注册' : '已有账号？立即登录'}
            </Button>
          </div>

          {/* 底部提示 */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              {isLoginMode ? '登录即表示同意' : '注册即表示同意'}
              <span className={styles.link}>《用户协议》</span>
              和
              <span className={styles.link}>《隐私政策》</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login