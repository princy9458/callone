import {NextRequest, NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/options";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {Order} from "@/lib/db/models/Order";
import {Product} from "@/lib/db/models/Product";
import {Role} from "@/lib/db/models/Role";
import {User} from "@/lib/db/models/User";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {toCsv} from "@/lib/utils/csv";

export async function GET(
  _request: NextRequest,
  {params}: {params: {entity: string}}
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  await dbConnect();

  const datasets: Record<string, () => Promise<Record<string, unknown>[]>> = {
    brands: async () =>
      (await Brand.find().lean()).map((brand) => ({
        id: brand._id.toString(),
        name: brand.name,
        code: brand.code,
        slug: brand.slug,
        active: brand.isActive,
      })),
    warehouses: async () =>
      (await Warehouse.find().lean()).map((warehouse) => ({
        id: warehouse._id.toString(),
        code: warehouse.code,
        name: warehouse.name,
        location: warehouse.location,
        priority: warehouse.priority,
        active: warehouse.isActive,
      })),
    roles: async () =>
      (await Role.find().lean()).map((role) => ({
        id: role._id.toString(),
        key: role.key,
        name: role.name,
        permissions: role.permissions,
        active: role.isActive,
      })),
    users: async () =>
      (await User.find().lean()).map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.roleKey,
        status: user.status,
      })),
    products: async () =>
      (await Product.find().lean()).map((product) => ({
        id: product._id.toString(),
        name: product.name,
        baseSku: product.baseSku,
        category: product.category,
        status: product.status,
      })),
    orders: async () =>
      (await Order.find().lean()).map((order) => ({
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        workflowStatus: order.workflowStatus,
        finalTotal: order.pricing.finalTotal,
        itemCount: order.items.length,
      })),
  };

  const exporter = datasets[params.entity];
  if (!exporter) {
    return NextResponse.json({error: "Unsupported export entity"}, {status: 404});
  }

  const csv = toCsv(await exporter());

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${params.entity}.csv"`,
    },
  });
}
