'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import * as xlsx from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { ProductExcelData } from '../ProductType';
import { setTravisMathew } from '@/store/slices/travisMathewSlice/travisMathewSlice';
import { createTravisMathew } from '@/store/slices/travisMathewSlice/travisMathewThunks';
import ImportStatusPanel, { ImportSummary, ImportStatus, ImportIssue } from './ImportStatusPanel';

type Props={
    isOpen:boolean;
    onClose:()=>void;
    // setOpen:React.Dispatch<React.SetStateAction<boolean>>;  
}
export default function ImportFile({isOpen,onClose}:Props) {
  const [isHovering, setIsHovering] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const [importProduct, setImportProduct] = useState<ProductExcelData[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null);
   const {currentBrand}=useSelector((state:RootState)=>state.brand)
   const {currentAttribute}=useSelector((state:RootState)=>state.attribute)
   const { travismathew } = useSelector((state:RootState)=>state.travisMathew)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      console.log("file",e.target.files[0])
      processFile(e.target.files[0]);
    }
  };
  const dispatch= useDispatch<AppDispatch>()
  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setStatus('idle');
    setProgress(0);
    setProgressLabel('');
    setSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (data instanceof ArrayBuffer) {
          const workbook = xlsx.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0]; 
          const worksheet = workbook.Sheets[sheetName];
          const rawData = xlsx.utils.sheet_to_json(worksheet);
          const jsonData = rawData.map((item: any) => ({
            ...item,
            baseSku: item.baseSku || item.sku || item.style_code || item["style_code Code"] || "",
            attributeSetId: currentAttribute?._id,
            brandId: currentBrand?._id,
            createdAt: new Date().toISOString(),
            metaData: {
              section: ""
            }
          }));

          setImportProduct(jsonData)
          setSummary({
            totalRows: jsonData.length,
            insertedCount: 0,
            updatedCount: 0,
            failedCount: 0,
            savedCount: 0,
            rowErrors: [],
          });
        }
      } catch (error) {
        console.error("Error extracting excel data:", error);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleImport = () => {
    if (!file || !importProduct.length) return;
    setStatus('uploading');
    setProgress(0);
    setProgressLabel('Preparing import...');

    const chunkSize = 100;
    const totalRows = importProduct.length;
    let insertedCount = 0;
    let updatedCount = 0;
    let failedCount = 0;
    const rowErrors: ImportIssue[] = [];

    const runImport = async () => {
      try {
        for (let index = 0; index < importProduct.length; index += chunkSize) {
          const chunk = importProduct.slice(index, index + chunkSize);
          const chunkNumber = Math.floor(index / chunkSize) + 1;
          const totalChunks = Math.ceil(importProduct.length / chunkSize);
          setProgressLabel(`Importing chunk ${chunkNumber} of ${totalChunks}`);

          const action = await dispatch(createTravisMathew(chunk));
          const result = action.payload as any;
          const chunkSummary = result?.summary as ImportSummary | undefined;

          if (chunkSummary) {
            insertedCount += chunkSummary.insertedCount || 0;
            updatedCount += chunkSummary.updatedCount || 0;
            failedCount += chunkSummary.failedCount || 0;
            rowErrors.push(...(chunkSummary.rowErrors || []).map((issue) => ({
              ...issue,
              rowIndex: issue.rowIndex + index,
            })));
          } else if (createTravisMathew.rejected.match(action)) {
            failedCount += chunk.length;
            rowErrors.push(
              ...chunk.map((item, rowIndex) => ({
                rowIndex: index + rowIndex,
                sku: item.sku || '',
                reason: (action.payload as string) || 'Import failed',
              }))
            );
          }

          setProgress(Math.min(100, Math.round(((index + chunk.length) / totalRows) * 100)));
          setSummary({
            totalRows,
            insertedCount,
            updatedCount,
            failedCount,
            savedCount: insertedCount + updatedCount,
            rowErrors,
          });
        }

        const merged = [...travismathew];
        importProduct.forEach((item) => {
          const key = item.sku || '';
          const existingIndex = merged.findIndex((product) => product.sku === key);
          if (existingIndex >= 0) {
            merged[existingIndex] = item;
          } else {
            merged.push(item);
          }
        });
        dispatch(setTravisMathew(merged));

        if (insertedCount + updatedCount > 0 && failedCount === 0) {
          setStatus('success');
          setProgressLabel('Import completed successfully.');
        } else {
          setStatus(insertedCount + updatedCount > 0 ? 'success' : 'error');
          setProgressLabel(
            insertedCount + updatedCount > 0
              ? 'Import completed with some failed rows.'
              : 'No data was saved to the database.'
          );
        }
      } catch (error: any) {
        console.error('Import failed:', error);
        setStatus('error');
        setProgressLabel(error?.message || 'Import failed');
      }
    };

    void runImport();
  };

  return (
    <>
      {/* <button
        onClick={() => setIsOpen(true)}
        className="rounded-2xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76 transition-colors hover:bg-foreground/5"
      >
        Import file
      </button> */}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md overflow-hidden rounded-[28px] border border-border/70 bg-background shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Import Excel / CSV</h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-foreground/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {!file ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                    onDragLeave={() => setIsHovering(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed p-10 transition-colors ${
                      isHovering ? 'border-primary bg-primary/5' : 'border-border/70 bg-background hover:bg-foreground/2'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      className="hidden"
                    />
                    <div className="mb-4 rounded-full bg-foreground/5 p-4 text-foreground/60 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Upload className="h-8 w-8" />
                    </div>
                    <p className="mb-1 text-base font-semibold text-foreground">Click or drag file here</p>
                    <p className="text-sm text-foreground/50">Supports .xlsx, .xls, .csv</p>
                  </div>
                ) : (
                  <ImportStatusPanel
                    file={file}
                    status={status}
                    progress={progress}
                    progressLabel={progressLabel}
                    summary={summary}
                    onClear={() => {
                      setFile(null);
                      setImportProduct([]);
                      setSummary(null);
                      setProgress(0);
                      setProgressLabel('');
                      setStatus('idle');
                    }}
                    disableClear={status === 'uploading'}
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/60 bg-foreground/[0.02] px-6 py-4">
                <button
                  onClick={onClose}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:bg-foreground/5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || !importProduct.length || status === 'uploading'}
                  className="rounded-2xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(47,127,244,0.22)] transition-all hover:bg-primary/90 disabled:shadow-none disabled:opacity-50"
                >
                  {status === 'uploading' ? 'Importing...' : 'Import Data'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
