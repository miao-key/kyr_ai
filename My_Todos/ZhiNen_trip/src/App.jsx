import { lazy, Suspense } from 'react'
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { LoadingSpinner } from '@/components/UI'
import ZustandProvider from '@/components/Providers/ZustandProvider'
import { ProtectedRoute } from '@/components'
import ErrorBoundary from '@/components/ErrorBoundary'

import { useRoutePreloader } from '@/hooks/useRoutePreloader'
import './App.css'

// 页面组件懒加载
const MainLayout = lazy(() => import('@/components/Layout/MainLayout'))
const Login = lazy(() => import('@/pages/Login'))
const Home = lazy(() => import('@/pages/Home'))
const Article = lazy(() => import('@/pages/Article'))
const WriteArticle = lazy(() => import('@/pages/WriteArticle'))
const Trip = lazy(() => import('@/pages/Trip'))
const Account = lazy(() => import('@/pages/Account'))
const Search = lazy(() => import('@/pages/Search'))
const Hotel = lazy(() => import('@/pages/Hotel'))
const Flight = lazy(() => import('@/pages/Flight'))
const Train = lazy(() => import('@/pages/Train'))
const Taxi = lazy(() => import('@/pages/Taxi'))
const Tourism = lazy(() => import('@/pages/Tourism'))
const Coze = lazy(() => import('@/pages/AI_chat/coze'))

// 主应用组件包装器
const AppContent = () => {
  // 启用路由预加载（保持后台运行，但不暴露到全局）
  useRoutePreloader()

  return (
    <>
      <Suspense fallback={
        <LoadingSpinner 
          type="ball" 
          size="medium"
          text="正在加载..."
          fullScreen={true}
        />
      }>
        <Routes>
          {/* 登录页面 - 不需要认证 */}
          <Route path='/login' element={<Login />} />
          
          {/* 主应用布局 - 混合权限控制 */}
          <Route element={<MainLayout />}>
            <Route path='/' element={<Navigate to="/home" />} />
            {/* 首页和旅记页 - 未登录也可访问 */}
            <Route path='/home' element={<Home />} />
            <Route path='/article' element={<Article />} />
            {/* 行程页和我的页 - 需要认证 */}
            <Route path='/trip' element={
              <ProtectedRoute>
                <Trip />
              </ProtectedRoute>
            } />
            <Route path='/account' element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 独立页面 - 需要认证 */}
          <Route path='/write-article' element={
            <ProtectedRoute>
              <WriteArticle />
            </ProtectedRoute>
          } />
          <Route path='/search' element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } />
          <Route path='/hotel' element={
            <ProtectedRoute>
              <Hotel />
            </ProtectedRoute>
          } />
          <Route path='/flight' element={
            <ProtectedRoute>
              <Flight />
            </ProtectedRoute>
          } />
          <Route path='/train' element={
            <ProtectedRoute>
              <Train />
            </ProtectedRoute>
          } />
          <Route path='/taxi' element={
            <ProtectedRoute>
              <Taxi />
            </ProtectedRoute>
          } />
          <Route path='/tourism' element={
            <ProtectedRoute>
              <Tourism />
            </ProtectedRoute>
          } />
          <Route path='/coze' element={
            <ProtectedRoute>
              <Coze />
            </ProtectedRoute>
          } />
          
          {/* 404页面重定向到首页 */}
          <Route path='*' element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <ErrorBoundary fallbackMessage="智旅应用遇到了问题，我们正在努力修复">
      <ZustandProvider>
        <AppContent />
      </ZustandProvider>
    </ErrorBoundary>
  )
}

export default App
