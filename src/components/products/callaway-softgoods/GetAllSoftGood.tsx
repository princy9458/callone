"use client "

import React, { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { fetchSoftGoods } from '@/store/slices/softgoods/softgoodsThunks'
import { AppDispatch } from '@/store'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

const GetAllSoftGood = () => {
  const dispatch = useDispatch<AppDispatch>()
  const isApiCall = useRef<boolean>(false)
  const { isFetchedSoftGoods } = useSelector((state: RootState) => state.softgoods)
  useEffect(() => {
    if (!isApiCall.current && !isFetchedSoftGoods) {
      dispatch(fetchSoftGoods())
      isApiCall.current = true
    } else {
      isApiCall.current = false
    }
  }, [dispatch, isFetchedSoftGoods])
  return (
    null
  )
}

export default GetAllSoftGood