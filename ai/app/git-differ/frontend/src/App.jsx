import {
  useEffect
} from 'react';
import {
  chat
} from './api/index';
import { useGitDiff } from './hooks/useGitDiff.js';

export default function App() {
  // console.log(useGitDiff);
  const {loading, content} = useGitDiff();
  
  return (
    <div className="flex">
      {loading ? 'loading...' : content}
    </div>
  )
}