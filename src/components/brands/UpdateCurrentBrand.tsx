"use client"
import { AppDispatch, RootState } from "@/store"
import { setCurrentBrand } from "@/store/slices/brandSlice/brandSlice"
import { updateBrand } from "@/store/slices/brandSlice/brandThunks"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"

const UpdateCurrentBrand = () => {

    const isApi = useRef<boolean>(false)
    const dispatch = useDispatch<AppDispatch>()
    const { isFetchedBrand, allBrand } = useSelector((state: RootState) => state.brand)
    const pathanme = usePathname()
    const brandName = pathanme.split("/")[4]

    useEffect(() => {
        if (allBrand && !isApi.current && brandName) {
            if (brandName === "travis-mathew") {
                const brand = allBrand.find((brand) => brand?.name === "Travis Mathew")
                if (brand) {
                    dispatch(setCurrentBrand(brand))
                }

                isApi.current = true
            } else if (brandName === "ogio") {
                const brand = allBrand.find((brand) => brand?.name === "Ogio")
                if (brand) {
                    dispatch(setCurrentBrand(brand))
                }

                isApi.current = true
            } else if (brandName === "callaway-hardgoods") {
                const brand = allBrand.find((brand) => brand?.name === "Callaway Hardgoods")
                if (brand) {
                    dispatch(setCurrentBrand(brand))
                }

                isApi.current = true
            } else if (brandName === "callaway-softgoods") {
                const brand = allBrand.find((brand) => brand?.name === "Callaway Softgoods")
                if (brand) {
                    dispatch(setCurrentBrand(brand))
                }

                isApi.current = true
            }

            //   dispatch(updateBrand())
        } else {
            isApi.current = false
        }
    }, [allBrand, brandName, dispatch])


    return (
        null
    )
}

export default UpdateCurrentBrand