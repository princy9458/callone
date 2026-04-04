'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Card } from 'react-bootstrap';
import { RootState } from '@/store';
import PrimaryImage from './PrimaryImage';
import SecondaryImage from './SecondaryImage';
import VarationSkuInfo from './VarationSkuInfo';
import './TravisPdf.css';

export interface OtherSku{
  sku?:string;
  qty?:number;
  
}
// Local interface definition based on provided code
export interface TravisPdfPrint {
  sku?: string;
  primary_image_url?: string;
  gallery_images_url?: string;
  name?: string;
  description?: string;

  category?:string;
  gender?:string;
  season?:string;
  color?:string;
  style_code?:string;
  mrp?:number;
  otherSku?:OtherSku[];
}

type Props = {
  selectedRow: any[]; // Generalized to accept any product row
  resetSelectedRow: () => void;
  cancelRowSelected: () => void;
  isduplicateMrp: boolean;
};

const TravisPdf: React.FC<Props> = ({ 
  selectedRow, 
  isduplicateMrp, 
  resetSelectedRow, 
  cancelRowSelected 
}) => {
  const [travisPdf, setTravisPdf] = useState<TravisPdfPrint[]>([]);
  const dispatch = useDispatch();
  
  // Get all products from Redux store
  const getProduct = useSelector((state: RootState) => state.travisMathew.travismathew);

  // useEffect(() => {
  //   if (selectedRow && selectedRow.length > 0 && getProduct && getProduct.length > 0) {
  //     if (isduplicateMrp) {
  //       const allp: TravisPdfPrint[] = [];
  //       selectedRow.forEach((callout) => {
  //         // In this project, 'family' or 'sku' or 'baseSku' might be what matches
  //         // Based on provided code, callout.family === product.sku
  //         getProduct.forEach((product: any) => {
  //           if (callout.family === product.sku || callout.sku === product.sku) {
  //             const data: TravisPdfPrint = {
  //               family: callout.family || product.sku,
  //               primary_image_url: callout.primary_image_url || product.primary_image_url,
  //               gallery_images_url: callout.gallery_images_url || product.gallery_images_url,
  //               name: callout.name || product.name || product.description,
  //               description: callout.description || product.description,
  //               variation_sku: callout.variation_sku || product.variation_sku,
  //               otherInfo: {
  //                 color: callout.otherInfo?.color || product.color,
  //                 style_code: callout.otherInfo?.style_code || product.style_code,
  //                 category: callout.otherInfo?.category || product.category,
  //                 gender: callout.otherInfo?.gender || product.gender,
  //                 season: callout.otherInfo?.season || product.season || product.season_code,
  //                 isShowDublicateMrp: product?.isShowDublicateMrp || false,
  //                 dublicateMrp: product?.dublicateMrp || 0,
  //                 mrp: callout.otherInfo?.mrp || product.mrp,
  //               },
  //               variation_sku_data: callout.variation_sku_data || [], // Map if possible
  //             };
  //             allp.push(data);
  //           }
  //         });
  //       });
  //       setTravisPdf(allp);
  //     } else {
  //       // Map selectedRow to TravisPdfPrint if not in duplicate mode
  //       const mapped = selectedRow.map(row => ({
  //           family: row.family || row.sku,
  //           primary_image_url: row.primary_image_url || row.image_url,
  //           gallery_images_url: row.gallery_images_url || "",
  //           name: row.name || row.description,
  //           description: row.description,
  //           variation_sku: row.variation_sku,
  //           otherInfo: {
  //               color: row.color,
  //               style_code: row.style_code,
  //               category: row.category,
  //               gender: row.gender,
  //               season: row.season,
  //               mrp: row.mrp
  //           },
  //           variation_sku_data: []
  //       } as TravisPdfPrint));
  //       setTravisPdf(mapped);
  //     }
  //   }
  // }, [selectedRow, getProduct, isduplicateMrp]);

  useEffect(() => {
    if (travisPdf.length > 0) {
      const timer = setTimeout(() => {
        // dispatch(LoadingStop()) // Skip if LoadingSlice is missing
        handlePrint();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [travisPdf]);

  const contentToPrint = useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef: contentToPrint,
    documentTitle: "TravisMathewPdf",
    onBeforePrint: async () => {
      if (isduplicateMrp) {
        cancelRowSelected();
      }
    },
    onAfterPrint: async () => {
      setTravisPdf([]);
      resetSelectedRow();
    },
  });

  return (
    <div style={{ display: 'none' }}>
      <div className='pdf-info'>
        <Row>
          <Col xs={24}>
            <Card id="catelog" ref={contentToPrint}>
              <div className="pro_bra_section bg-black d-flex flex-column justify-content-center text-center py-5">
                <div className="bra_logo">
                  {/* Placeholder for Travis Logo */}
                  <h1 className="text-white">TRAVIS MATHEW</h1>
                </div>
                <h2 className="bra_title mt-3 text-white">Catalog</h2>
              </div>

              {travisPdf.map((callout, index) => (
                <div key={index} className='pro_sec'>
                  <div className="pro_cont">
                    <div className='p_title'>
                      <h2 className='fs-1 my-4'> {callout?.description}</h2>
                    </div>

                    <div className='row'>
                      <div className='col-7'>
                        <div className='p_img'>
                          <PrimaryImage record={callout} />
                        </div>
                      </div>

                      <div className='col-5'>
                        {/* <VarationSkuInfo variation_sku_data={callout.variation_sku_data || []} />

                        <table className='pro-data-table mt-3'>
                          <tbody>
                            <tr>
                              <th>Category</th>
                              <td className='ps-4'>{callout?.otherInfo?.category}</td>
                            </tr>
                            <tr>
                              <th>Season</th>
                              <td className='ps-4'>{callout.otherInfo.season}</td>
                            </tr>
                            <tr>
                              <th>Color</th>
                              <td className='ps-4'>{callout.otherInfo.color}</td>
                            </tr>
                            <tr>
                              <th>Style Code</th>
                              <td className='ps-4'>{callout.otherInfo.style_code}</td>
                            </tr>
                            <tr>
                              <th>MRP</th>
                              <td className='ps-4'>₹{callout.otherInfo.mrp}</td>
                            </tr>
                            {callout.otherInfo.isShowDublicateMrp && (
                              <tr>
                                <th>Offer Price</th>
                                <td className='ps-4'>₹{callout.otherInfo.dublicateMrp}</td>
                              </tr>
                            )}
                          </tbody>
                        </table> */}
                      </div>
                    </div>

                    <div className="prodect_img_pdf d-flex mt-5">
                      <SecondaryImage record={callout} />
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default TravisPdf;
