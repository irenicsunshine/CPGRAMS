import { NextRequest, NextResponse } from "next/server";
import { GrievanceResponse } from "@/utils/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");

  const userId = process.env.USER_ID;
  const apiUrl = process.env.GRM_API_URL;

  try {
    // Fetch all grievances for the user
    const response = await fetch(`${apiUrl}/grievances/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.GRM_API_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data: GrievanceResponse = await response.json();
    let grievances = data.grievances || [];

    // Sort by created_at date (newest first)
    grievances = grievances.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Apply status filter if provided
    if (status && status !== "all") {
      grievances = grievances.filter(
        (g) => g.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Calculate pagination
    const totalItems = grievances.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalItems);
    const paginatedGrievances = grievances.slice(startIndex, endIndex);

    return NextResponse.json({
      grievances: paginatedGrievances,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Failed to fetch grievances:", error);
    return NextResponse.json(
      { error: "Failed to fetch grievances" },
      { status: 500 }
    );
  }
}