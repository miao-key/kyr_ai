import { 
  useEffect
 } from 'react'

 import {
  useParams
 } from 'react-router-dom'

const UserProfile = () => {
  const {id} = useParams();
  useEffect(()=>{
    
    console.log(window.location);
  },[])
  return (
    <>
      UserProfile{id}
    </>
  )
}

export default UserProfile