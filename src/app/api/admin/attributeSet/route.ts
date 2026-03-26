import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth/options";
import dbConnect from "@/lib/db/connection";
import {AttributeSet} from "@/lib/db/models/AttributeSet";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    await dbConnect();
    
    const attributeSets = await AttributeSet.find().sort({ createdAt: -1 });

    return NextResponse.json({data: attributeSets, success: true});
  } catch (error: any) {
    console.error("Error fetching attribute sets:", error);
    return NextResponse.json(
      {error: error.message || "Failed to fetch attribute sets", success: false},
      {status: 500}
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    await dbConnect();
    const body = await request.json();
    
    const attributeSet = await AttributeSet.create(body);

    return NextResponse.json({data: attributeSet, success: true}, {status: 201});
  } catch (error: any) {
    console.error("Error creating attribute set:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        {error: "An attribute set with this key already exists", success: false},
        {status: 409}
      );
    }
    
    return NextResponse.json(
      {error: error.message || "Failed to create attribute set", success: false},
      {status: 500}
    );
  }
}
