"use client"
import { AppDispatch, RootState } from '@/store'
import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { calculateValues } from './util/OrderUtil'


const Ordercard = () => {

    const dispatch=useDispatch<AppDispatch>()
    const {items,selectedRetailer,selectedManager,selectedSalesRep,discountType,discountValue}=useSelector((state:RootState)=>state.cart)
 
    const orderData=useMemo(()=>{
      
        if(items && items.length>0 &&
        
             discountType &&
             discountValue
        ){
            const data=items.map((item)=>calculateValues(item,discountValue,discountType))
            console.log("updsated card orrder",data)
        }
        
    },[items, discountType, discountValue])
    return (
  null
  )
}

export default Ordercard