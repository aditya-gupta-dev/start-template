import { TimeTable } from "@/modals/section"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeTableFromJSON(json: string): TimeTable[] {
  const entries = json.split(/","/);

  const timetableArray: TimeTable[] = entries.map(entry => {
    const cleanEntry = entry.replace(/^"|"$/g, "");

    const [subjectCode, rest] = cleanEntry.split('":"');

    const [timing, afterTiming] = rest.split("::");

    const [date, sectionName] = afterTiming.split("??");

    return {
      subjectCode,
      timing,
      date,
      sectionName
    };
  });

  return timetableArray
}