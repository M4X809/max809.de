import { redirect, RedirectType } from "next/navigation";

export default async function NoteMarkRedirect() {
    redirect("/note-mark", RedirectType.replace)
}