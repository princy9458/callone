
"use client"
import { AppDispatch, RootState } from '@/store'
import { fetchOrders } from '@/store/slices/order/orderThunks'
import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const GetAllOrders = () => {
    const isApiCall=useRef(false)
    const dispatch= useDispatch<AppDispatch>()

    const {allOrders,isFetchedOrders}=useSelector((state:RootState)=>state.order)
     const{user}=useSelector((state:RootState)=>state.user)
    useEffect(() => {
        if(!isFetchedOrders && 
            user && 
            user?.role == "super_admin"){
            dispatch(fetchOrders())
        }
    }, [isFetchedOrders, user, dispatch])


  return (
 null
  )
}

export default GetAllOrders