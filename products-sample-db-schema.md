# CallawayOne Sample Mongo Documents

This file captures canonical document shapes for the current admin rebuild. These are reference examples, not strict JSON Schema definitions.

## 1. Brand

```json
{
  "_id": "brand_callaway_apparel",
  "name": "Callaway Apparel",
  "slug": "callaway-apparel",
  "code": "CG-APP",
  "description": "Performance apparel catalog for Callaway India.",
  "websiteUrl": "https://www.callawaygolf.com",
  "media": {
    "logoPath": "/images/brands/callaway/logo.png",
    "thumbnailPath": "/images/brands/callaway/thumb.png",
    "sliderPaths": [
      "/images/brands/callaway/slide-1.jpg",
      "/images/brands/callaway/slide-2.jpg"
    ]
  },
  "isActive": true
}
```

## 2. Role

```json
{
  "_id": "role_sales_rep",
  "key": "sales_rep",
  "name": "Sales Representative",
  "description": "Can manage orders, customers, and assigned catalog records.",
  "permissions": [
    "dashboard.view",
    "orders.view",
    "orders.create",
    "orders.update",
    "products.view",
    "brands.view"
  ],
  "isSystem": true,
  "isActive": true
}
```

## 3. User

```json
{
  "_id": "user_sales_01",
  "name": "Field Sales Rep",
  "email": "sales@callone.local",
  "passwordHash": "$2b$10$example",
  "roleId": "role_sales_rep",
  "roleKey": "sales_rep",
  "designation": "Sales Executive",
  "managerId": "user_manager_01",
  "assignedBrandIds": [
    "brand_callaway_apparel",
    "brand_callaway_hardgoods"
  ],
  "assignedWarehouseIds": [
    "warehouse_wh88",
    "warehouse_wh90"
  ],
  "code": "SR-12",
  "phone": "9876543210",
  "gstin": "",
  "address": "Jaipur, Rajasthan",
  "status": "active"
}
```

## 4. Warehouse

```json
{
  "_id": "warehouse_wh88",
  "code": "WH88",
  "name": "Warehouse 88",
  "location": "Legacy WH 88",
  "priority": 10,
  "isDefault": true,
  "isActive": true
}
```

## 5. Product

```json
{
  "_id": "product_tour_performance_polo",
  "name": "Tour Performance Polo",
  "slug": "tour-performance-polo",
  "baseSku": "CGAPP-POLO-001",
  "brandId": "brand_callaway_apparel",
  "category": "Polos",
  "subcategory": "Mens",
  "productType": "apparel",
  "description": "Moisture-wicking tournament polo with stretch finish.",
  "status": "active",
  "taxRate": 18,
  "listPrice": 2999,
  "optionDefinitions": [
    {
      "key": "color",
      "label": "Color",
      "values": ["Blue", "White", "Black"],
      "useForVariants": true
    },
    {
      "key": "size",
      "label": "Size",
      "values": ["S", "M", "L", "XL"],
      "useForVariants": true
    }
  ],
  "media": {
    "primaryImagePath": "/images/products/callaway/polo/main.jpg",
    "galleryPaths": [
      "/images/products/callaway/polo/detail-1.jpg",
      "/images/products/callaway/polo/detail-2.jpg"
    ]
  },
  "metadata": {
    "legacyTable": "callaway_apparel",
    "legacyStyleId": "92431"
  }
}
```

## 6. Variant

```json
{
  "_id": "variant_tour_performance_polo_blue_s",
  "productId": "product_tour_performance_polo",
  "sku": "CGAPP-POLO-001-BLU-S",
  "title": "Blue / S",
  "optionValues": {
    "color": "Blue",
    "size": "S"
  },
  "mrp": 2999,
  "gstRate": 18,
  "cost": 0,
  "imagePath": "/images/products/callaway/polo/blue.jpg",
  "status": "active",
  "legacyWarehouseHint": ""
}
```

## 7. Inventory Level

```json
{
  "_id": "inventory_variant_blue_s_wh88",
  "variantId": "variant_tour_performance_polo_blue_s",
  "warehouseId": "warehouse_wh88",
  "onHand": 120,
  "reserved": 12,
  "blocked": 5,
  "available": 103
}
```

## 8. Inventory Movement

```json
{
  "_id": "movement_01",
  "variantId": "variant_tour_performance_polo_blue_s",
  "warehouseId": "warehouse_wh88",
  "type": "reservation",
  "delta": 4,
  "reason": "Order reservation",
  "referenceType": "order",
  "referenceId": "order_01",
  "notes": "Reserved 4 units for CO-12451245."
}
```

## 9. Blocked Stock

### Warehouse-specific

```json
{
  "_id": "blocked_01",
  "sku": "CGAPP-POLO-001-BLU-S",
  "variantId": "variant_tour_performance_polo_blue_s",
  "warehouseId": "warehouse_wh88",
  "brand": "Callaway Apparel",
  "category": "Polos",
  "blockedUnder": "Tournament Allocation",
  "description": "Reserved for event dispatch.",
  "quantity": 6,
  "source": "manual"
}
```

### Global legacy block

```json
{
  "_id": "blocked_legacy_01",
  "sku": "CGAPP-POLO-001-BLU-S",
  "variantId": "variant_tour_performance_polo_blue_s",
  "warehouseId": null,
  "brand": "Callaway Apparel",
  "category": "Polos",
  "blockedUnder": "Legacy Blocked Qty",
  "description": "Imported from MySQL blocked quantity table.",
  "quantity": 9,
  "source": "legacy"
}
```

## 10. Order

```json
{
  "_id": "order_01",
  "orderNumber": "CO-12451245",
  "createdById": "user_sales_01",
  "retailerId": "user_retailer_01",
  "managerId": "user_manager_01",
  "salesRepId": "user_sales_01",
  "brandId": "brand_callaway_apparel",
  "workflowStatus": "submitted",
  "sourceStatus": "",
  "participantSnapshots": {
    "retailer": {
      "legacyId": 0,
      "name": "Partner Retailer",
      "email": "retailer@callone.local",
      "phone": "9988776655",
      "role": "retailer",
      "code": "RET-09",
      "gstin": "08ABCDE1234F1Z5",
      "address": "Jaipur, Rajasthan"
    },
    "manager": {
      "name": "Regional Manager",
      "email": "manager@callone.local",
      "role": "manager"
    },
    "salesRep": {
      "name": "Field Sales Rep",
      "email": "sales@callone.local",
      "role": "sales_rep"
    }
  },
  "items": [
    {
      "variantId": "variant_tour_performance_polo_blue_s",
      "sku": "CGAPP-POLO-001-BLU-S",
      "name": "Tour Performance Polo / Blue / S",
      "brandId": "brand_callaway_apparel",
      "brandName": "Callaway Apparel",
      "warehouseId": "warehouse_wh88",
      "warehouseCode": "WH88",
      "quantity": 4,
      "mrp": 2999,
      "gstRate": 18,
      "lineDiscountValue": 22,
      "lineDiscountAmount": 2639.12,
      "grossAmount": 11996,
      "taxableAmount": 7889.56,
      "taxAmount": 1420.12,
      "finalAmount": 9309.68
    }
  ],
  "pricing": {
    "discountType": "inclusive",
    "discountValue": 22,
    "discountAmount": 2639.12,
    "subtotal": 11996,
    "taxableAmount": 7889.56,
    "taxAmount": 1420.12,
    "finalTotal": 9309.68
  },
  "notesTimeline": [
    {
      "message": "Order Initiated",
      "name": "CallawayOne Admin",
      "access": "all",
      "type": "system",
      "createdAt": "2026-03-24T08:45:12.100Z"
    },
    {
      "message": "CGAPP-POLO-001-BLU-S auto-assigned to WH88 with 14 units available.",
      "name": "CallawayOne Admin",
      "access": "all",
      "type": "system",
      "createdAt": "2026-03-24T08:45:12.102Z"
    }
  ],
  "attachments": []
}
```

## 11. Import Job

Planned collection shape:

```json
{
  "_id": "import_01",
  "type": "products_csv",
  "status": "queued",
  "filePath": "/uploads/imports/products-2026-03-24.xlsx",
  "startedAt": null,
  "completedAt": null,
  "createdById": "user_admin_01",
  "summary": {
    "totalRows": 0,
    "created": 0,
    "updated": 0,
    "failed": 0
  }
}
```

## 12. Export Job

Planned collection shape:

```json
{
  "_id": "export_01",
  "type": "catalog_pdf",
  "status": "completed",
  "filePath": "/images/catalogs/callaway-apparel-summer-2026.pdf",
  "createdById": "user_admin_01",
  "createdAt": "2026-03-24T10:00:00.000Z"
}
```
