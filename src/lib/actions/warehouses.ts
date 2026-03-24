"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import dbConnect from "@/lib/db/connection";
import {Warehouse} from "@/lib/db/models/Warehouse";

export async function saveWarehouse(formData: FormData) {
  await dbConnect();

  const id = String(formData.get("id") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!code || !name) {
    throw new Error("Warehouse code and name are required.");
  }

  const payload = {
    code,
    name,
    location: String(formData.get("location") ?? "").trim(),
    priority: Number(formData.get("priority") ?? 100),
    isDefault: formData.get("isDefault") === "on",
    isActive: formData.get("isActive") === "on",
  };

  if (payload.isDefault) {
    await Warehouse.updateMany({}, {$set: {isDefault: false}});
  }

  if (id) {
    await Warehouse.findByIdAndUpdate(id, payload, {runValidators: true});
  } else {
    await Warehouse.create(payload);
  }

  revalidatePath("/admin/warehouses");
  redirect("/admin/warehouses");
}

export async function deleteWarehouse(formData: FormData) {
  await dbConnect();
  const id = String(formData.get("id") ?? "").trim();
  await Warehouse.findByIdAndDelete(id);
  revalidatePath("/admin/warehouses");
  redirect("/admin/warehouses");
}
