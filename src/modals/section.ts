export interface Section {
    sectionId: string; 
    strength: number; 
    students: string[]; 
    teacherID: string; 
    timeTable: TimeTable[]  
}

export interface TimeTable { 
    subjectCode: string;
    timing: string; 
    date: string; 
    sectionName: string;
}