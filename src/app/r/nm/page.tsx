import { permanentRedirect, RedirectType } from "next/navigation";

export default async function NoteMarkRedirect() {
    permanentRedirect("/note-mark", RedirectType.replace)
}