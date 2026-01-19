import { Container } from "@mantine/core";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <Container size={"lg"}>{children}</Container>;
}
