"use client";

import { ActionIcon, Autocomplete } from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { useDebouncedCallback } from "@mantine/hooks";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-duotone-svg-icons";
import { useRefreshState } from "~/lib/cUtils";

export function Search({
	streetNames,
	initialValues,
}: {
	streetNames: string[];
	initialValues: string;
}) {
	const [search, setSearch] = useQueryState(
		"s",
		parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
	);

	const [isLoading, setIsLoading] = useState(false);

	const { handleRefresh, isPending } = useRefreshState({
		withToast: false,
	});

	const form = useForm({
		initialValues: {
			streetName: initialValues,
		},
	});

	const debouncedSetSearch = useDebouncedCallback((value: string) => {
		setSearch(value);
	}, 500);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (initialValues) {
			form.setFieldValue("streetName", initialValues);
		}
	}, [initialValues]);

	useEffect(() => {
		if (!isPending) {
			setIsLoading(false);
		}
	}, [isPending]);

	return (
		<Form
			form={form}
			onSubmit={async () => {
				setIsLoading(true);
				await setSearch(form.values.streetName);
				handleRefresh();
				await new Promise<void>((resolve) => {
					if (!isPending) resolve();
					const checkPending = () => {
						if (!isPending) resolve();
						else setTimeout(checkPending, 100);
					};
					checkPending();
				});
				setIsLoading(false);
			}}
		>
			<Autocomplete
				disabled={isLoading}
				withAsterisk
				comboboxProps={{
					position: "bottom",
				}}
				pt={10}
				label="Name oder Tätigkeit"
				data={streetNames}
				{...form.getInputProps("streetName")}
				onChange={async (value) => {
					if (streetNames.includes(value)) {
						form.setFieldValue("streetName", value);
						setIsLoading(true);
						await setSearch(value);
						handleRefresh();

						return;
					}

					debouncedSetSearch(value);
					form.getInputProps("streetName").onChange(value);
				}}
				rightSection={
					<ActionIcon
						disabled={isLoading}
						loading={isLoading}
						type="submit"
						variant="transparent"
						color="gray.2"
					>
						{<FontAwesomeIcon swapOpacity icon={faSearch} />}
					</ActionIcon>
				}
			/>
		</Form>
	);
}
