"use client"

import GetAllTravisMethew from "./travismethew/GetAllTravisMethew"
import GetAllBrands from "../brands/GetAllBrands"
import GetAllAtributeSet from "../attributeSet/GetAllAtributeSet"
import GetAllOgio from "./Ogio/GetAllOgio"


const GetAllProducts = () => {
   
    return (
        <>
        <GetAllAtributeSet/>
        <GetAllBrands/>
        <GetAllTravisMethew/>
        <GetAllOgio/>
        </>
    )
}

export default GetAllProducts