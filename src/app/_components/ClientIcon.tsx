"use client";
import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { useMounted } from "@mantine/hooks";

const ClientIcon = ({ ...props }: FontAwesomeIconProps) => {
	const mounted = useMounted();
	if (!mounted) return null;

	return <FontAwesomeIcon {...props} />;
};

export default ClientIcon;
