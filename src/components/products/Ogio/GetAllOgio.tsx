"use client"
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/store'
import { fetchOgio } from '@/store/slices/ogioSlice/ogioThunks'

const GetAllOgio = () => {
    const dispatch = useDispatch<AppDispatch>()
    const isApiCall = useRef<boolean>(false)

    const { isFetchedOgio } = useSelector((state: RootState) => state.ogio)

    useEffect(() => {
      if (!isApiCall.current && !isFetchedOgio) {
        dispatch(fetchOgio())
        isApiCall.current = true
      } else {
        isApiCall.current = false
      }
    }, [dispatch, isFetchedOgio])

    return null
}

export default GetAllOgio
