import { format } from "date-fns";
import { type NextRequest, NextResponse } from "next/server";
import { hasPermission } from "~/lib/sUtils";
import { api } from "~/trpc/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ day?: string }> }) {
	if (!(await hasPermission("viewLogbook"))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const searchParams = req.nextUrl.searchParams;
	const day = searchParams.get("day") ?? format(new Date(), "dd.MM.yyyy");

	const pdfData = await api.logbook.generatePdf({ date: day });

	return new NextResponse(pdfData, {
		headers: {
			"Content-Type": "application/pdf",
		},
		status: 200,
	});
}
