import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {Role} from "@/lib/db/models/Role";
import {User} from "@/lib/db/models/User";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {ROLE_PERMISSIONS, type RoleKey} from "@/lib/auth/permissions";
import {slugify} from "@/lib/utils/slugify";

const ROLE_LABELS: Record<RoleKey, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  sales_rep: "Sales Representative",
  retailer: "Retailer",
};

export async function ensureSystemBootstrap() {
  await dbConnect();

  for (const [key, permissions] of Object.entries(ROLE_PERMISSIONS) as Array<
    [RoleKey, string[]]
  >) {
    await Role.findOneAndUpdate(
      {key},
      {
        $setOnInsert: {
          name: ROLE_LABELS[key],
          description: `${ROLE_LABELS[key]} role for CallawayOne`,
          permissions,
          isSystem: true,
          isActive: true,
        },
      },
      {returnDocument: "after", upsert: true}
    );
  }

  const adminEmail =
    process.env.CALLONE_BOOTSTRAP_ADMIN_EMAIL ?? "admin@callone.local";
  const adminPassword =
    process.env.CALLONE_BOOTSTRAP_ADMIN_PASSWORD ?? "CalloneAdmin@123";

  const existingUser = await User.findOne({email: adminEmail.toLowerCase()});
  const superAdminRole = await Role.findOne({key: "super_admin"});
  if (!superAdminRole) {
    throw new Error("Missing super_admin role during bootstrap.");
  }

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await User.create({
      name: "CallawayOne Super Admin",
      email: adminEmail.toLowerCase(),
      passwordHash,
      roleId: superAdminRole._id,
      roleKey: superAdminRole.key,
      designation: "Bootstrap Admin",
      status: "active",
    });
  }

  const defaultBrands = [
    {name: "Callaway Hardgoods", code: "CG-HW"},
    {name: "Callaway Apparel", code: "CG-APP"},
    {name: "Travis Mathew", code: "TM"},
    {name: "Ogio", code: "OG"},
  ];

  for (const brand of defaultBrands) {
    await Brand.findOneAndUpdate(
      {code: brand.code},
      {
        $setOnInsert: {
          name: brand.name,
          slug: slugify(brand.name),
          description: `${brand.name} imported bootstrap brand`,
          media: {
            logoPath: "",
            thumbnailPath: "",
            sliderPaths: [],
          },
          isActive: true,
        },
      },
      {upsert: true, returnDocument: "after"}
    );
  }

  const defaultWarehouses = [
    {code: "WH88", name: "Warehouse 88", location: "Legacy WH 88", priority: 10, isDefault: true},
    {code: "WH90", name: "Warehouse 90", location: "Legacy WH 90", priority: 20, isDefault: false},
  ];

  for (const warehouse of defaultWarehouses) {
    await Warehouse.findOneAndUpdate(
      {code: warehouse.code},
      {
        $setOnInsert: {
          ...warehouse,
          isActive: true,
        },
      },
      {upsert: true, returnDocument: "after"}
    );
  }

  const managerRole = await Role.findOne({key: "manager"});
  const salesRepRole = await Role.findOne({key: "sales_rep"});
  const retailerRole = await Role.findOne({key: "retailer"});

  const seedUsers = [
    {
      email: "manager@callone.local",
      name: "Regional Manager",
      role: managerRole,
      designation: "Regional Sales Manager",
    },
    {
      email: "sales@callone.local",
      name: "Field Sales Rep",
      role: salesRepRole,
      designation: "Sales Executive",
    },
    {
      email: "retailer@callone.local",
      name: "Partner Retailer",
      role: retailerRole,
      designation: "Retail Partner",
    },
  ];

  for (const candidate of seedUsers) {
    if (!candidate.role) {
      continue;
    }

    const present = await User.findOne({email: candidate.email});
    if (present) {
      continue;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: candidate.name,
      email: candidate.email,
      passwordHash,
      roleId: candidate.role._id,
      roleKey: candidate.role.key,
      designation: candidate.designation,
      status: "active",
    });
  }
}
