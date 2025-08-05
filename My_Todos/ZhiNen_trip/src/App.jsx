import { useState, lazy, Suspense } from 'react'
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { LoadingSpinner } from '@/components/UI'
import './App.css'

const MainLayout = lazy(() => import('@/components/MainLayout'))
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

function App() {
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
          <Route element={<MainLayout />}>
              <Route path='/' element={<Navigate to="/home" />} />
              <Route path='/home' element={<Home />} />
              <Route path='/article' element={<Article />} />
              <Route path='/trip' element={<Trip />} />
              <Route path='/account' element={<Account />} />
            </Route>
            <Route path='/search' element={<Search />} />
            <Route path='/hotel' element={<Hotel />} />
            <Route path='/flight' element={<Flight />} />
            <Route path='/train' element={<Train />} />
            <Route path='/taxi' element={<Taxi />} />
            <Route path='/tourism' element={<Tourism />} />
            <Route path='/coze' element={<Coze />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
