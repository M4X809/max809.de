// "use client";

// import { Card, Grid, GridCol, Stack } from "@mantine/core";
// import { MainTimer } from "./MainTimer";
// import CubeTimerHistory from "./CubeTimerHistory";
// import CubeScrambleBox from "./CubeScrambleBox";

// import { useAppStore } from "~/providers/app-store-provider";
// import { twMerge } from "tailwind-merge";
// import { useViewportSize } from "@mantine/hooks";
// import type { Session } from "next-auth";

// const CubeTimerContainer = ({ session }: { session: Session | null | undefined }) => {
//     const hideHeader = useAppStore((state) => state.hideHeader)
//     const { height, width } = useViewportSize();


//     if (width < 1000 && width > 10) {
//         return (
//             <Card withBorder className="h-[calc(100dvh-100px)] w-full bg-[rgba(255,255,255,0.1)] rounded-xl " mt={20}>
//                 <Stack>
//                     <MainTimer className="h-auto" />
//                     <CubeScrambleBox className="h-auto bg-transparent" />
//                     {!!session?.user.id && <CubeTimerHistory
//                         className="h-auto bg-transparent" />}
//                 </Stack>
//             </Card>
//         )
//     }

//     return (
//         <Grid columns={9} mt={20}>
//             <GridCol span={2.75} className={twMerge("transition-opacity duration-500", hideHeader && "opacity-0")}>
//                 {!!session?.user.id && <CubeTimerHistory
//                     className="h-auto bg-transparent" />}
//             </GridCol>
//             <GridCol span={3.5}>
//                 <Stack>

//                     <MainTimer />

//                 </Stack>
//             </GridCol>
//             <GridCol span={2.75} className={twMerge("transition-opacity duration-500", hideHeader && "opacity-0")}>
//                 <CubeScrambleBox />
//             </GridCol>
//         </Grid>
//     )
// }

// export default CubeTimerContainer