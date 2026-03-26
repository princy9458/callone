"use client"
import { AppDispatch, RootState } from '@/store'
import { fetchBrands } from '@/store/slices/brandSlice/brandThunks'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const GetAllBrands = () => {

  const isApi= useRef<boolean>(false)
    const dispatch=useDispatch<AppDispatch>()
  const {isFetchedBrand}= useSelector((state:RootState)=>state.brand)

  useEffect(()=>{
    if(!isFetchedBrand && !isApi.current){
      isApi.current=true
      dispatch(fetchBrands())
    }else{
        isApi.current=false
    }
  },[isFetchedBrand, dispatch])

    
  return (
  null
  )
}

export default GetAllBrands