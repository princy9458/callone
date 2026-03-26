"use client"
import { AppDispatch, RootState } from '@/store';
import { setCurrentAttribute } from '@/store/slices/attributeSlice/attributeSlice';
import { setCurrentBrand } from '@/store/slices/brandSlice/brandSlice';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'


const UpdateBrandAttribute = () => {

    const dispatch=useDispatch<AppDispatch>();
   const pathname=usePathname();
   const brandCode=pathname.split("/")[4];
   console.log("pathname",pathname)
   console.log("brandCode",brandCode)

   const {allBrand}=useSelector((state:RootState)=>state.brand)
   const {allAttribute}= useSelector((state:RootState)=>state.attribute)


    useEffect(() => {
        if(allAttribute &&
            allAttribute.length>0 &&
             allBrand && 
             allBrand.length>0 &&
             brandCode){
            const brand=allBrand.find((brand)=>brand.slug===brandCode)
             const attributeset=allAttribute.find((attributeSet)=>attributeSet.key===brandCode)
            console.log("brand",brand)
            console.log("attributeset",attributeset)
           if(brand){
            dispatch(setCurrentBrand(brand))
           }
           if(attributeset){
            dispatch(setCurrentAttribute(attributeset))
           }
            
        }
    },[brandCode,allBrand,allAttribute,dispatch])
  return (
   null
  )
}

export default UpdateBrandAttribute