"use server";
import { faGit } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, VisuallyHidden } from "@mantine/core";
import Link from "next/link";
import React from "react";
import { onPageAllowed } from "~/lib/sUtils";

const ClearGhCache = async () => {
	await onPageAllowed();

	return (
		// <Affix position={{ bottom: 10, right: 10 }} >
		<Link href="/api/gh-stats/clear-cache" prefetch={false} rel="external">
			<ActionIcon
				variant="light"
				className="self-center"
				size="sm"
				title="Clear GitHub Stats Cache"
			>
				<VisuallyHidden>Clear GitHub Stats Cache</VisuallyHidden>
				<FontAwesomeIcon icon={faGit} />
			</ActionIcon>
		</Link>
		// {/* </Affix> */}
	);
};

export default ClearGhCache;
