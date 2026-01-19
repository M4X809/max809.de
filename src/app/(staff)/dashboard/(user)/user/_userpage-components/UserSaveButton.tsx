"use client";
import { faArrowsRotate, faSave } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionIcon, Box, Group, Stack, Text, VisuallyHidden } from "@mantine/core";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useManagementStore } from "~/providers/management-store-provider";
import { api } from "~/trpc/react";

import { refreshAction } from "../../../../../RefreshAction";
import { SubmitButton } from "~/app/_components/SubmitButton";
import { useMounted } from "@mantine/hooks";
import { toast } from "sonner";
import { DismissButton } from "~/components/ui/sonner";

const UserSaveButton = () => {
	const { id }: { id: string } = useParams();
	const router = useRouter();
	const mounted = useMounted();

	const userPermissions = useManagementStore((state) => state.userPermissions);
	const permissionsChanged = useManagementStore((state) => state.permissionsChanged);
	const setPermissionsChanged = useManagementStore((state) => state.setPermissionsChanged);

	const staffChanged = useManagementStore((state) => state.staffChanged);
	const setStaffChanged = useManagementStore((state) => state.setStaffChanged);

	const adminChanged = useManagementStore((state) => state.adminChanged);
	const setAdminChanged = useManagementStore((state) => state.setAdminChanged);

	const staff = useManagementStore((state) => state.staff);
	const admin = useManagementStore((state) => state.admin);

	const limit = useManagementStore((state) => state.limit);
	const limitChanged = useManagementStore((state) => state.limitChanged);
	const setLimitChanged = useManagementStore((state) => state.setLimitChanged);

	const loginWithEmail = useManagementStore((state) => state.loginWithEmail);
	const loginWithEmailChanged = useManagementStore((state) => state.loginWithEmailChanged);
	const setLoginWithEmailChanged = useManagementStore((state) => state.setLoginWithEmailChanged);

	const openCommandKey = useManagementStore((state) => state.openCommandKey);
	const openCommandKeyChanged = useManagementStore((state) => state.openCommandKeyChanged);
	const setOpenCommandKeyChanged = useManagementStore((state) => state.setOpenCommandKeyChanged);

	const saveUserCounter = useManagementStore((state) => state.saveUserCounter);
	const setSaveDisabled = useManagementStore((state) => state.setSaveDisabled);

	const [errorOject, setErrorOject] = useState<{
		updateError?: any;
		updateErrorAdmin?: any;
		updateErrorLimit?: any;
		updateErrorStaff?: any;
	}>({});

	const {
		mutate: updatePermissions,
		isPending: isUpdating,
		isSuccess: isUpdated,
		error: updateError,
		reset: resetPermissionsMutation,
		isError: isPermissionsError,
	} = api.management.updatePermissions.useMutation();
	const {
		mutate: updateStaff,
		isPending: isUpdatingStaff,
		isSuccess: isUpdatedStaff,
		error: updateErrorStaff,
		reset: resetStaffMutation,
		isError: isStaffError,
	} = api.management.updateStaffRole.useMutation();
	const {
		mutate: updateAdmin,
		isPending: isUpdatingAdmin,
		isSuccess: isUpdatedAdmin,
		error: updateErrorAdmin,
		reset: resetAdminMutation,
		isError: isAdminError,
	} = api.management.updateAdminRole.useMutation();
	const {
		mutate: updateLimit,
		isPending: isUpdatingLimit,
		isSuccess: isUpdatedLimit,
		error: updateErrorLimit,
		reset: resetLimitMutation,
		isError: isLimitError,
	} = api.management.updateQrLimit.useMutation();
	const {
		mutate: updateLoginWithEmail,
		isPending: isUpdatingLoginWithEmail,
		isSuccess: isUpdatedLoginWithEmail,
		error: updateErrorLoginWithEmail,
		reset: resetLoginWithEmailMutation,
		isError: isLoginWithEmailError,
	} = api.management.updateLoginWithEmail.useMutation();

	const {
		mutate: setConfig,
		isPending: isUpdatingConfig,
		isSuccess: isUpdatedConfig,
		error: updateErrorConfig,
		reset: resetConfigMutation,
		isError: isConfigError,
	} = api.management.setConfig.useMutation();

	const unsavedChanges =
		permissionsChanged || staffChanged || adminChanged || limitChanged || loginWithEmailChanged || openCommandKeyChanged;
	const loading =
		(isUpdating ||
			isUpdatingStaff ||
			isUpdatingAdmin ||
			isUpdatingLimit ||
			isUpdatingLoginWithEmail ||
			isUpdatingConfig) &&
		!(
			updateError ||
			updateErrorStaff ||
			updateErrorAdmin ||
			updateErrorLimit ||
			updateErrorLoginWithEmail ||
			updateErrorConfig
		);
	const hasError =
		(isPermissionsError || isStaffError || isAdminError || isLimitError || isLoginWithEmailError || isConfigError) &&
		!loading;

	const errorKeys = {
		updateError: "Update Permissions",
		updateErrorAdmin: "Update Role",
		updateErrorLimit: "Update Qr Limit ",
		updateErrorStaff: "Update Role",
		updateErrorConfig: "Update Config",
		updateErrorLoginWithEmail: "Update Login With Email",
	};

	useEffect(() => {
		return () => {
			toast.dismiss("saving-failed");
		};
	}, []);

	const handleSave = () => {
		if (loading || !unsavedChanges) return;
		toast.dismiss("saving-failed");
		resetPermissionsMutation();
		resetStaffMutation();
		resetAdminMutation();
		resetLimitMutation();
		resetLoginWithEmailMutation();
		resetConfigMutation();

		if (permissionsChanged) {
			updatePermissions({ permissions: userPermissions, id: id });
		}
		if (staffChanged) {
			updateStaff({ staff: !!staff, id: id });
		}
		if (adminChanged) {
			updateAdmin({ admin: !!admin, id: id });
		}
		if (limitChanged && limit) {
			updateLimit({ limit: typeof limit === "string" ? Number.parseInt(limit) : limit, id: id });
		}
		if (loginWithEmailChanged) {
			updateLoginWithEmail({ allowSigninWithEmail: loginWithEmail, userId: id });
		}
		if (openCommandKeyChanged) {
			setConfig({ path: "global.openCommandKey", value: openCommandKey, userId: id });
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!mounted) return;
		if (saveUserCounter > 0) {
			handleSave();
		}
	}, [mounted, saveUserCounter]);

	useEffect(() => {
		setSaveDisabled(!unsavedChanges || loading);
	}, [unsavedChanges, setSaveDisabled, loading]);

	useEffect(() => {
		if (loading || !hasError) return;

		const errObj = {
			updateError: updateError ? updateError : undefined,
			updateErrorAdmin: updateErrorAdmin ? updateErrorAdmin : undefined,
			updateErrorLimit: updateErrorLimit ? updateErrorLimit : undefined,
			updateErrorStaff: updateErrorStaff ? updateErrorStaff : undefined,
			updateErrorLoginWithEmail: updateErrorLoginWithEmail ? updateErrorLoginWithEmail : undefined,
			updateErrorConfig: updateErrorConfig ? updateErrorConfig : undefined,
		};

		const filteredObject = Object.fromEntries(Object.entries(errObj).filter(([key, value]) => value !== undefined));
		// console.log("filteredObject", filteredObject)
		if (Object.keys(filteredObject).length === 0) return setErrorOject({});

		const errorStack = Object.fromEntries(
			Object.entries(filteredObject).map(([key, value]) => {
				if (value?.message.toLowerCase().includes("max809")) {
					setTimeout(() => {
						router.refresh();
					}, 3000);
					return [key, value?.message];
				}
				if (value?.message.toLowerCase().includes("admin")) {
					return [key, "Can't edit Admins."];
				}

				if (value?.message.toLowerCase().includes("self")) {
					return [key, "Can't edit Self."];
				}
				return [key, value?.message];
			}),
		);
		setErrorOject(errorStack);
	}, [
		updateError,
		updateErrorAdmin,
		updateErrorLimit,
		updateErrorStaff,
		loading,
		hasError,
		router,
		updateErrorLoginWithEmail,
		updateErrorConfig,
	]);

	useEffect(() => {
		if (Object.keys(errorOject).length === 0 || loading) return;
		if (!hasError) return;

		// console.log("TOAST", errorOject)
		toast.error("Saving Failed.", {
			id: "saving-failed",
			cancel: <DismissButton id="saving-failed" />,
			description: (
				<Box>
					{Object.keys(errorOject).map((key) => {
						if (!errorOject[key as keyof typeof errorOject]) return;

						return (
							<Stack key={key} gap={0}>
								<Text c={"inherit"} fz={15}>
									{errorKeys[key as keyof typeof errorKeys]}
								</Text>
								<Text c={"inherit"} fz={13}>
									{errorOject[key as keyof typeof errorOject]}
								</Text>
							</Stack>
						);
					})}
				</Box>
			),

			duration: 15 * 1000,
		});
	}, [errorOject, loading, hasError]);

	useEffect(() => {
		if (isUpdated) {
			setPermissionsChanged(false);
			setErrorOject((state) => ({ ...state, updateError: undefined }));
		}

		if (isUpdatedStaff) {
			setStaffChanged(false);
			setErrorOject((state) => ({ ...state, updateErrorStaff: undefined }));
		}

		if (isUpdatedAdmin) {
			setAdminChanged(false);
			setErrorOject((state) => ({ ...state, updateErrorAdmin: undefined }));
		}
		if (isUpdatedLimit) {
			setLimitChanged(false);
			setErrorOject((state) => ({ ...state, updateErrorLimit: undefined }));
		}

		if (isUpdatedLoginWithEmail) {
			setLoginWithEmailChanged(false);
			setErrorOject((state) => ({ ...state, updateErrorLoginWithEmail: undefined }));
		}

		if (isUpdatedConfig) {
			setOpenCommandKeyChanged(false);
			setErrorOject((state) => ({ ...state, updateErrorConfig: undefined }));
		}
	}, [
		isUpdated,
		setPermissionsChanged,
		isUpdatedStaff,
		setStaffChanged,
		isUpdatedAdmin,
		setAdminChanged,
		isUpdatedLimit,
		setLimitChanged,
		isUpdatedLoginWithEmail,
		setLoginWithEmailChanged,
		isUpdatedConfig,
		setOpenCommandKeyChanged,
	]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!loading && mounted && !hasError) {
			console.log("refreshing");
			router.refresh();
			toast.dismiss("saving-failed");
		}
	}, [loading, router]);

	const refreshActionWithId = refreshAction.bind(null, `/dashboard/user/${id}`);
	return (
		<Group gap={5}>
			<ActionIcon
				className="data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-[rgba(0,0,0,0.15)] data-[disabled=true]:backdrop-blur-lg"
				loading={loading}
				onClick={handleSave}
				disabled={!unsavedChanges}
			>
				<FontAwesomeIcon icon={faSave} />
			</ActionIcon>
			<form action={refreshActionWithId}>
				<SubmitButton
					variant="light"
					className="data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-[rgba(0,0,0,0.15)] data-[disabled=true]:backdrop-blur-lg"
				>
					<VisuallyHidden>Refresh</VisuallyHidden>
					<FontAwesomeIcon icon={faArrowsRotate} />
				</SubmitButton>
			</form>
		</Group>
	);
};

export default UserSaveButton;
