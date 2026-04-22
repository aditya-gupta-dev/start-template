import { db } from "@/lib/firebase";
import { getTimeTableFromJSON } from "@/lib/utils";
import { Section, TimeTable } from "@/modals/section";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req: Request) {
    const sectionName = req.headers.get("sectionName")    

    if (!sectionName) {
        return Response.json({ "error": "invalid query" }, { status: 402 })
    }

    const sectionQuery = await getDoc(doc(db, "sections", sectionName as string));

    if (!sectionQuery.exists()) {
        return Response.json({ "error": "section not found" }, { status: 404 });
    }

    const section: Section = {
        sectionId: sectionQuery.id,
        strength: sectionQuery.get("strength") as number,
        students: sectionQuery.get("students") as string[],
        teacherID: sectionQuery.get("teacherID") as string,
        timeTable: getTimeTableFromJSON(sectionQuery.get("timeTable") as string)
    };

    return Response.json(section);
} 