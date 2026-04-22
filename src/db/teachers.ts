import { db } from "@/lib/firebase";
import { Teacher } from "@/modals/teacher";
import { currentUser } from "@clerk/nextjs/server";
import { doc, getDoc } from "firebase/firestore";

export default async function getTeacherById() {
    const user = await currentUser()

    if (!user) {
        return Response.json({ "error": "unauthorized" }, { status: 401 })
    }
    const teacherId = user.id;
    const docRef = await getDoc(doc(db, "teachers", teacherId)); 

    if (!docRef.exists()) { 
        return Response.json({ "error": "invalid query" }, { status: 402 })
    }

    const teacher: Teacher = {
        id: docRef.id,
        name: docRef.get("name") as string, 
        sections: docRef.get("sections") as string[]
    };

    return Response.json(teacher);  
}