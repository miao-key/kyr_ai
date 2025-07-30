import useTitle from '@/hooks/useTitle'
import {
  Button
} from 'react-vant';
import { showToast } from '@/components/Toast/toastController';

const Home = () => {
    useTitle('精英首页')
  return (
    <>
        Home
        <Button 
        type='primary'
        onClick={() => showToast(3,2,5)}>
        showToast
        </Button>
    </>
  )
}

export default Home