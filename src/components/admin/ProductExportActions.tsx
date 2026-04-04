'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { buildExportRows, downloadCsv } from '../products/utils/ProductExcel';
import TravisPdf, { OtherSku, TravisPdfPrint } from './pdf/TravisPdf';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { BrandType } from '@/store/slices/brandSlice/brandType';
import { HardGoodType } from '../products/HardGood/HardGoodType';
import { OgioType } from '../products/Ogio/OgioType';
import { TravisMathewType } from '../products/travismethew/TravisMethewType';

interface ProductExportActionsProps {
  selectedProducts: any[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  viewMode: 'product' | 'sku';
  brandName?: string;
}

export function ProductExportActions({
  selectedProducts,
  selectedIds,
  setSelectedIds,
  viewMode,
  brandName
}: ProductExportActionsProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [showTravisPdf, setShowTravisPdf] = useState(false);
   const {travismathew}=useSelector((state:RootState)=>state.travisMathew)
    const {ogio}=useSelector((state:RootState)=>state.ogio)
    const {hardgoods}=useSelector((state:RootState)=>state.hardgoods)
    const {currentBrand}=useSelector((state:RootState)=>state.brand)

    const [travisPdf, setTravisPdf] = useState<TravisMathewType[]>([]);
      // const fam = record.primary_image_url.replace(/_[^_]*$/, '');
      console.log("selectedIds---->",selectedIds)
    const allTravisItems=useMemo(()=>{
      if(currentBrand?.name==="Travis Mathew" && viewMode==="product" && selectedIds.length>0){
        const result = selectedIds.map(item => item.split(':')[1]);

        const filteredTravis = travismathew.filter((item: TravisMathewType) => result.includes(item?.style_code??""));
        console.log("filteredTravis---->",filteredTravis)
        return filteredTravis
      }else if(viewMode==="sku" && selectedIds.length>0 && currentBrand?.name==="Travis Mathew" && selectedIds.length>0){
         const data:TravisPdfPrint[]=[]
        const filteredTravis = travismathew.filter((item: TravisMathewType) => selectedIds.includes(item?._id??""));
        // console.log("filteredTravis----> sku mode",filteredTravis)
        //    filteredTravis.map(fliteredItem=>{
        //     const filterOther:OtherSku[]=[]
        //     const variationSku= fliteredItem.variation_sku;
        //         variationSku?.map((fliteredSku:string)=>{
        //             const data= travismathew.find((item:TravisMathewType)=>item.sku===fliteredSku)
        //             const datas={
        //               sku:data?.sku,
        //               qty:data?.stock_88 +data?.stock_90,
        //             }
                    
        //         })
        //    })
        setTravisPdf(filteredTravis)
        return filteredTravis
      }
    },[currentBrand,travismathew,viewMode,selectedIds])

  const handleExportExcel = () => {
    downloadCsv("products-selected.csv", buildExportRows(selectedProducts as any));
    setExportMenuOpen(false);
  };

  const handleExportPdf = () => {
    if (brandName === "Travis Mathew") {
      setShowTravisPdf(true);
    } else {
      // Placeholder for general PDF export
      console.log("General PDF export not implemented yet");
      alert("PDF export is currently optimized for Travis Mathew. General export coming soon.");
    }
    setExportMenuOpen(false);
  };

  const handleExportPpt = () => {
    // Placeholder for PPT export
    console.log("PPT export not implemented yet");
    alert("PPT export coming soon.");
    setExportMenuOpen(false);
  };
   
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setExportMenuOpen(!exportMenuOpen)}
          className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          Export selected
          <ChevronDown className={`h-4 w-4 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {exportMenuOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1A] p-1 shadow-2xl z-50">
            <button
              onClick={handleExportPdf}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <FileText className="h-4 w-4 text-primary" />
              Export to PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
              Export to Excel
            </button>
            <button
              onClick={handleExportPpt}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Presentation className="h-4 w-4 text-amber-500" />
              Export to PPT
            </button>
          </div>
        )}
      </div>

      {showTravisPdf && currentBrand?.name==="Travis Mathew" && (
        <TravisPdf 
          selectedRow={travisPdf}
          isduplicateMrp={false} // Default to false or pass as prop
          resetSelectedRow={() => {
            setShowTravisPdf(false);
            setSelectedIds([]);
          }}
          cancelRowSelected={() => setShowTravisPdf(false)}
        />
      )}
    </div>
  );
}


