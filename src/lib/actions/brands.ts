"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {slugify} from "@/lib/utils/slugify";

export async function saveBrand(formData: FormData) {
  await dbConnect();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();

  if (!name || !code) {
    throw new Error("Brand name and code are required.");
  }

  const payload = {
    name,
    slug: slugify(String(formData.get("slug") ?? "") || name),
    code,
    description: String(formData.get("description") ?? "").trim(),
    websiteUrl: String(formData.get("websiteUrl") ?? "").trim(),
    media: {
      logoPath: String(formData.get("logoPath") ?? "").trim(),
      thumbnailPath: String(formData.get("thumbnailPath") ?? "").trim(),
      sliderPaths: String(formData.get("sliderPaths") ?? "")
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
    },
    isActive: formData.get("isActive") === "on",
  };

  if (id) {
    await Brand.findByIdAndUpdate(id, payload, {runValidators: true});
  } else {
    await Brand.create(payload);
  }

  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}

export async function deleteBrand(formData: FormData) {
  await dbConnect();
  const id = String(formData.get("id") ?? "").trim();
  await Brand.findByIdAndDelete(id);
  revalidatePath("/admin/brands");
  redirect("/admin/brands");
}
