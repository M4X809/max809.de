"use server"
import { Box, Card, Container, Grid, GridCol, Group, Stack, Text, Title } from "@mantine/core"
import { getServerAuthSession } from "~/server/auth"
import { api } from "~/trpc/server"
import QrCodePreview from "./QrCodePreview"
import QrCodePreviewContainer from "./QrCodePreviewContainer"




export default async function SavedCodes() {
    const session = await getServerAuthSession()
    if (!session?.user.id) return <div>Please sign in to see your saved codes</div>
    const codes = await api.codes.getQrCodes()


    return <QrCodePreviewContainer initialData={codes} userId={session?.user?.id} />



}