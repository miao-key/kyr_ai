import { lazy, Suspense } from 'react'
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { LoadingSpinner } from '@/components/UI'
import { AuthProvider } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import './App.css'



// 页面组件懒加载
const MainLayout = lazy(() => import('@/components/MainLayout'))
const Login = lazy(() => import('@/pages/Login'))
const Home = lazy(() => import('@/pages/Home'))
const Article = lazy(() => import('@/pages/Article'))
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
