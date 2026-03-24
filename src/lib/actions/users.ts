"use server";

import bcrypt from "bcryptjs";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import dbConnect from "@/lib/db/connection";
import {Role} from "@/lib/db/models/Role";
import {User} from "@/lib/db/models/User";

function parseObjectIds(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .map((value) => String(value))
    .filter(Boolean);
}

export async function saveUser(formData: FormData) {
  await dbConnect();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleId = String(formData.get("roleId") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!name || !email || !roleId) {
    throw new Error("Name, email, and role are required.");
  }

  const role = await Role.findById(roleId);
  if (!role) {
    throw new Error("Invalid role selected.");
  }

  const payload: Record<string, unknown> = {
    name,
    email,
    roleId,
    roleKey: role.key,
    phone: String(formData.get("phone") ?? "").trim(),
    phone2: String(formData.get("phone2") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim(),
    designation: String(formData.get("designation") ?? "").trim(),
    managerId: String(formData.get("managerId") ?? "").trim() || null,
    gstin: String(formData.get("gstin") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    secondaryEmail: String(formData.get("secondaryEmail") ?? "").trim(),
    assignedBrandIds: parseObjectIds(formData, "assignedBrandIds"),
    assignedWarehouseIds: parseObjectIds(formData, "assignedWarehouseIds"),
    status: formData.get("status") === "inactive" ? "inactive" : "active",
  };

  if (password) {
    payload.passwordHash = await bcrypt.hash(password, 10);
  }

  if (id) {
    await User.findByIdAndUpdate(id, payload, {runValidators: true});
  } else {
    if (!payload.passwordHash) {
      throw new Error("Password is required for new users.");
    }

    await User.create(payload);
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(formData: FormData) {
  await dbConnect();
  const id = String(formData.get("id") ?? "").trim();
  await User.findByIdAndDelete(id);
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
