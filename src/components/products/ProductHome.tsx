"use client"

import { usePathname } from "next/navigation"
import TravisHome from "./travismethew/TravisHome";
import OgioHome from "./Ogio/OgioHome";
import HardgoodHome from "./callaway-hardgoods/HardgoodHome";
import SoftgoodHome from "./callaway-softgoods/SoftgoodHome";

export default function ProductHome() {

    const pathname= usePathname();
    const slug= pathname.split("/")[4];
    
    return (
       <>
       {slug==="travis-mathew" && <TravisHome/>}
       {slug==="ogio" && <OgioHome/>}
       {slug==="callaway-hardgoods" && <HardgoodHome/>}
       {slug==="callaway-softgoods" && <SoftgoodHome/>}
       </>
    );
}