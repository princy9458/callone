"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import dbConnect from "@/lib/db/connection";
import {Role} from "@/lib/db/models/Role";

function normalizePermissions(input: string) {
  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function saveRole(formData: FormData) {
  await dbConnect();

  const id = String(formData.get("id") ?? "").trim();
  const key = String(formData.get("key") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!key || !name) {
    throw new Error("Role key and name are required.");
  }

  const payload = {
    key,
    name,
    description: String(formData.get("description") ?? "").trim(),
    permissions: normalizePermissions(String(formData.get("permissions") ?? "")),
    isActive: formData.get("isActive") === "on",
  };

  if (id) {
    await Role.findByIdAndUpdate(id, payload, {runValidators: true});
  } else {
    await Role.create({...payload, isSystem: false});
  }

  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}

export async function deleteRole(formData: FormData) {
  await dbConnect();
  const id = String(formData.get("id") ?? "");
  const role = await Role.findById(id);

  if (!role || role.isSystem) {
    redirect("/admin/roles");
  }

  await Role.findByIdAndDelete(id);
  revalidatePath("/admin/roles");
  redirect("/admin/roles");
}
