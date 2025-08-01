import { useState, lazy, Suspense } from 'react'
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import { Flex, Loading } from 'react-vant'
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

function App() {
  return (
    <>
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <Flex.Item span={8}>
            <Loading type="ball" />
          </Flex.Item>
        </div>
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
        </Routes>
      </Suspense>
    </>
  )
}

export default App
