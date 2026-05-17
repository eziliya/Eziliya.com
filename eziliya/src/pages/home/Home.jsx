import React, { useEffect, useState } from 'react'
import styles from './Home.module.css'

import Bankname from '../components/bankname'
import Navbar from '../../components/nav/Navbar.jsx'
import { useNavigate } from 'react-router-dom'
import Login from '../../auth/Login.jsx'
import Signup from '../../auth/Signup.jsx'

export default function Home() {
  const navigate=useNavigate()
  const [user,setUser]=useState(null)
  useEffect(()=>{
    const user=JSON.parse(localStorage.getItem('user'))
    setUser(user)
    const token=localStorage.getItem('token')
    if(!token){
      navigate('/login')
    }
  },[])
  return (
    <>
    <Reports/>
    </>
  )
}
