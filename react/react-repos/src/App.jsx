import {
   useState,
   useEffect,
   Suspense,
   lazy
   } from 'react'
import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import Loading from './components/Loading'
const RepoList = lazy(() => import('./pages/RepoList.jsx'))

function App() {
  
  return (
    <Suspense fallback={<Loading/>}>
      <Routes>
        <Route path="/users/:id/repos" element={<RepoList />} />
        <Route path="*" element= {<Navigate to="/users/miao-key/repos"  />} />
      </Routes>
    </Suspense>
  )
}

export default App
