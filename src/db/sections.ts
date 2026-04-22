import { Section, TimeTable } from "@/modals/section";

type SectionRaw = Omit<Section, "timeTable"> & { timeTableRaw: string };
export function getSectionFromJSON(raw: any): Section {    

    const parsed: SectionRaw = JSON.parse(raw);

    const timeTable: TimeTable[] = parsed.timeTableRaw
        .split(/","/)
        .map(entry => {
            const cleanEntry = entry.replace(/^"|"$/g, "");
            const [subjectCode, rest] = cleanEntry.split('":"');
            const [timing, afterTiming] = rest.split("::");
            const [date, sectionName] = afterTiming.split("??");

            return { subjectCode, timing, date, sectionName };
        });

    const section: Section = {
        sectionId: parsed.sectionId,
        strength: parsed.strength,
        students: parsed.students,
        teacherID: parsed.teacherID,
        timeTable
    };
    
    return section; 
}