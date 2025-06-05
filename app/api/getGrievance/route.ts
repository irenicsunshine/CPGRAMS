import { NextRequest, NextResponse } from "next/server";
import { Grievance } from "@/utils/types";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const grievanceId = body.id;

    if (!grievanceId) {
      return NextResponse.json(
        { error: "Grievance ID is required", success: false },
        { status: 400 }
      );
    }

    const apiUrl = process.env.GRM_API_URL;

    // Fetch the specific grievance by ID from the external API
    const response = await fetch(`${apiUrl}/grievances/${grievanceId}`, {
      headers: {
        Authorization: `Bearer ${process.env.GRM_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Grievance not found", success: false },
          { status: 404 }
        );
      }
      throw new Error(`Error: ${response.status}`);
    }
    const grievance: Grievance = await response.json();
    return NextResponse.json({
      grievance,
      success: true,
    });
  } catch (error) {
    console.error(`Failed to fetch grievance:`, error);
    return NextResponse.json(
      { error: "Failed to fetch grievance details", success: false },
      { status: 500 }
    );
  }
}
