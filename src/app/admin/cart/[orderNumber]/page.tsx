'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { Tag } from 'lucide-react';
import { removeFromCart, updateCartItemQty, updateCartItemStock, setDiscount, setSelectedRetailer, setSelectedManager, setSelectedSalesRep } from '@/store/slices/cart/cartSlice';
import { fetchUsersByRole } from '@/store/slices/users/userThunks';
import { PageHeader } from '@/components/admin/PageHeader';
import { OrderModel } from '@/store/slices/order/OrderType';
import { updateOrder } from '@/store/slices/order/orderThunks';
import { toast } from 'sonner';
import OrderHydration from '@/components/order/OrderHydration';
import Ordercard from '@/components/order/Ordercard';

// New Components
import { CartHeader } from '@/components/cart/CartHeader';
import { CartStepper } from '@/components/cart/CartStepper';
import { CartTable } from '@/components/cart/CartTable';
import GetAllProducts from '@/components/products/GetAllProducts';
import { updateStockOgio } from '@/store/slices/ogioSlice/ogioSlice';
import { updateStockHardgoods } from '@/store/slices/hardgoodSlice/hardgoodSlice';
import { updateStockTravisMathew } from '@/store/slices/travisMathewSlice/travisMathewSlice';
import { updateStockSoftgoods } from '@/store/slices/softgoods/softgoodsSlice';

const STEPS = [
  { id: 1, label: 'Submit Order' },
  { id: 2, label: 'Check Availability' },
  { id: 3, label: 'Approve Order' },
  { id: 4, label: 'Complete Order' },
];

export default function CartPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const cart = useSelector((state: RootState) => state.cart);
  const { allRetailer, allManager, allSaleRep, isFetchedAllRetailer, isFetchedAllManager, isFetchedAllSaleRep } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const [activeStep] = useState(1);

  const [isEditingRetailer, setIsEditingRetailer] = useState(false);
  const [isEditingManager, setIsEditingManager] = useState(false);
  const [isEditingSalesRep, setIsEditingSalesRep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemErrors, setItemErrors] = useState<Record<string, boolean>>({});
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isFetchedAllRetailer) dispatch(fetchUsersByRole('retailer'));
    if (!isFetchedAllManager) dispatch(fetchUsersByRole('manager'));
    if (!isFetchedAllSaleRep) dispatch(fetchUsersByRole('sales_rep'));
  }, [dispatch, isFetchedAllRetailer, isFetchedAllManager, isFetchedAllSaleRep]);

  const summary = cart.items.reduce((acc: { subtotal: number, totalDiscount: number, finalTotal: number }, item) => {
    const qty = (item?.qty88 ?? 0) + (item?.qty90 ?? 0);
    const amount = (item.mrp ?? 0) * qty;
    const gstRate = item.gst ?? 0;
    const lessGst = amount / (1 + gstRate / 100);
    const discountAmount = lessGst * (cart.discountValue / 100);
    const netBilling = lessGst - discountAmount;
    const finalBillValue = netBilling * (1 + gstRate / 100);

    acc.subtotal += amount;
    acc.totalDiscount += discountAmount;
    acc.finalTotal += finalBillValue;
    return acc;
  }, { subtotal: 0, totalDiscount: 0, finalTotal: 0 });

  const {currentOrder} = useSelector((state: RootState) => state.order);

  const handleUpdateRetailer = async(retailerId: string) => {
    const data:OrderModel={
      ...currentOrder,
      retailer_id: retailerId,
    }
    const response=await dispatch(updateOrder({ id: currentOrder?._id??"", data: data })).unwrap();
    if(response){
      setIsEditingRetailer(false);
      toast.success("Retailer updated successfully");
    }
  }

  const handleUpdateManager = async(managerId: string) => {
    const data:OrderModel={
      ...currentOrder,
      manager_id: managerId,
    }
    const response=await dispatch(updateOrder({ id: currentOrder?._id??"", data: data })).unwrap();
    if(response){
      setIsEditingManager(false);
      toast.success("Manager updated successfully");
    }
  }

  const handleUpdateSalesRep = async(salesRepId: string) => {
    const data:OrderModel={
      ...currentOrder,
      salesrep_id: salesRepId,
    }
    const response=await dispatch(updateOrder({ id: currentOrder?._id??"", data: data })).unwrap();
    if(response){
      setIsEditingSalesRep(false);
      toast.success("Sales Representative updated successfully");
    }
  }

  const handleUpdateQty = async (itemId: string, field: 'qty88' | 'qty90', value: number, stock: number) => {
    const validatedValue = Math.max(0, Math.min(value, stock));
    
    // 1. Update Redux cart state immediately for UI responsiveness
    dispatch(updateCartItemQty({ id: itemId, sku: itemId, [field]: validatedValue }));

    if (itemErrors[itemId]) {
      const { [itemId]: _, ...rest } = itemErrors;
      setItemErrors(rest);
    }

    // 2. Debounce API Call
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      // Prepare updated items for API call using the LATEST state from store
      // We use a selector-like logic here, but since we are in a handler, 
      // we need to be careful about closure over 'cart'.
      // Redux state will have been updated by the dispatch above.
      // However, the 'cart' variable from useSelector might be stale in this tick.
      // But for simple cases, it works because we map over cart.items and replace the one we just updated.
      
      const updatedItems = cart.items.map(item => {
        if (item.id === itemId || item.sku === itemId) {
          return { ...item, [field]: validatedValue };
        }
        return item;
      });

      const data: OrderModel = {
        ...currentOrder,
        items: updatedItems,
      };

      // 3. Persist to API
      try {
        if (currentOrder?._id) {
          await dispatch(updateOrder({ id: currentOrder._id, data })).unwrap();
        }
      } catch (error) {
        console.error("Failed to update quantity in API:", error);
        toast.error("Failed to sync quantity with server");
      }
    }, 500);
  };

  const getBrandApi = (brand: string) => {
    const brandLower = brand?.toLowerCase() || "";
    if (brandLower.includes("travis")) return "/api/admin/products/travismethew";
    if (brandLower.includes("ogio")) return "/api/admin/products/ogio";
    if (brandLower.includes("hard")) return "/api/admin/products/hardgoods";
    if (brandLower.includes("soft")) return "/api/admin/products/softgoods";
    return "/api/admin/products";
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    const newErrors: Record<string, boolean> = {};
    const stockCheckPromises = cart.items.map(async (item) => {
      try {
        const api = getBrandApi(item.brand || "");
        const response = await fetch(`${api}?sku=${item.sku}`);
        const result = await response.json();
          console.log("result of stock submit--",result)
        if (result.success && result.data && result.data.length > 0) {
          const latestProduct = result.data[0];
          const latestStock88 = parseInt(latestProduct.stock_88 || latestProduct.stock88 || "0");
          const latestStock90 = parseInt(latestProduct.stock_90 || latestProduct.stock90 || "0");
          console.log("ietm.brand--",item.brand)
          
         if(item.brand==="Ogio"){
          dispatch(updateStockOgio({ 
            sku: item.sku || "", 
            stock88: latestStock88, 
            stock90: latestStock90 
          }));
        } if(item.brand==="Travis Mathew"){
          dispatch(updateStockTravisMathew({ 
            sku: item.sku || "", 
            stock88: latestStock88, 
            stock90: latestStock90 
          }));
        }
        if(item.brand==="Callaway Softgoods"){
          dispatch(updateStockSoftgoods({ 
            sku: item.sku || "", 
            stock88: latestStock88, 
            stock90: latestStock90 
          }));
        }
        if(item.brand==="Callaway Hardgoods"){
          dispatch(updateStockHardgoods({ 
            sku: item.sku || "", 
            stock88: latestStock88, 
            stock90: latestStock90 
          }));
        }
          if ((item.qty88 || 0) > latestStock88 || (item.qty90 || 0) > latestStock90) {
            newErrors[item.id || ""] = true;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch stock for ${item.sku}:`, error);
      }
    });

    await Promise.all(stockCheckPromises);
    setItemErrors(newErrors);
    setIsSubmitting(false);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Some products are out of stock or have insufficient quantity.");
    } else {
      try {
        if (currentOrder?._id) {
          const data: OrderModel = {
            ...currentOrder,
            items: cart.items,
            status: 'submitted',
          
          };
          await dispatch(updateOrder({ id: currentOrder._id, data })).unwrap();
          toast.success("Order submitted successfully!");
        }
      } catch (error) {
        toast.error("Failed to update order status");
      }
    }
  };

  return (
    <>
    <GetAllProducts/>
      <OrderHydration />
      <Ordercard/>
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <PageHeader
            title={!orderNumber || orderNumber === 'new' ? 'New Order' : `Order No: #${orderNumber}`}
            description=""
            backHref="/admin/products"
          />
          <button className="flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-2 text-sm font-bold text-foreground/70 shadow-sm">
            <Tag size={16} />
            Add a Note
          </button>
        </div>

        <CartHeader 
          selectedRetailer={cart.selectedRetailer}
          selectedManager={cart.selectedManager}
          selectedSalesRep={cart.selectedSalesRep}
          allRetailer={allRetailer}
          allManager={allManager}
          allSaleRep={allSaleRep}
          isEditingRetailer={isEditingRetailer}
          setIsEditingRetailer={setIsEditingRetailer}
          isEditingManager={isEditingManager}
          setIsEditingManager={setIsEditingManager}
          isEditingSalesRep={isEditingSalesRep}
          setIsEditingSalesRep={setIsEditingSalesRep}
          onUpdateRetailer={handleUpdateRetailer}
          onUpdateManager={handleUpdateManager}
          onUpdateSalesRep={handleUpdateSalesRep}
          setSelectedRetailer={(val) => dispatch(setSelectedRetailer(val))}
          setSelectedManager={(val) => dispatch(setSelectedManager(val))}
          setSelectedSalesRep={(val) => dispatch(setSelectedSalesRep(val))}
        />

        <CartStepper 
          steps={STEPS}
          activeStep={activeStep}
          isSubmitting={isSubmitting}
          onSubmitOrder={handleSubmitOrder}
        />

        <CartTable 
          items={cart.items}
          itemErrors={itemErrors}
          discountType={cart.discountType}
          discountValue={cart.discountValue}
          summary={summary}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={(id) => dispatch(removeFromCart(id))}
          onSetDiscount={(type, value) => dispatch(setDiscount({ type, value }))}
        />
      </div>
    </>
  );
}
