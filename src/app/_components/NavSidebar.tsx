"use client"
import { faChevronsRight, faX } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Center, Divider, Grid, NavLink, ScrollArea, Stack, Tooltip } from '@mantine/core'
import { useDisclosure, useHover, useLocalStorage, useMediaQuery, useMounted } from '@mantine/hooks';
import React from 'react'
import { twMerge } from 'tailwind-merge';


import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useIsAdmin, useIsStaff, usePermission } from '~/lib/cUtils';
import type { Session } from 'next-auth';
import { useAppStore } from '~/providers/app-store-provider';

type multi = {
    type: "multi";
    label: string;
    icon: IconProp;
    onClick?: () => void;
    tooltip?: string;
    depth?: number;
    children: childItem[];
    version?: string;
    disabled?: boolean;
    permissions?: string[];
    requireAdmin?: boolean;
    requireStaff?: boolean;
};

type item = {
    type: "item";
    label: string;
    to: string;
    icon: IconProp;
    onClick?: () => void;
    tooltip?: string;
    version?: string;
    disabled?: boolean;
    depth?: number;
    permission?: string;
    requireAdmin?: boolean;
    requireStaff?: boolean;
};
type divider = {
    type: "divider";

    label: string;
    icon: IconProp;
    /**
     * Position of the divider label
    ```ts
    default = "center" 
    ```
    */
    pos?: "center" | "left" | "right";
    permissions?: string[];
    requireAdmin?: boolean;
    requireStaff?: boolean;
};
type childItem = {
    type?: "item";
    label: string;
    to: string;
    icon: IconProp;
    onClick?: () => void
    tooltip?: string;
    version?: string;
    disabled?: boolean;
    permission?: string;
    requireAdmin?: boolean;
    requireStaff?: boolean;
};

export type NavMenuItemProps = item | divider | multi;

export type NavItem = childItem | item | multi;

export interface Elements {
    title: string
    icon: string
    href: string

}

interface NavMenuProps {
    session: Session | null | undefined;
    nameSpace: string;
    inputData: NavMenuItemProps[];
    inputParams?: { [key: string]: any };
    close?: {
        close: () => void;
        isMobile?: boolean;
    }
}

const onClickHandler = (item: NavItem, closeMenu: { close: () => void, isMobile?: boolean; } | undefined) => {
    if (item.type === "item" && item.onClick) {
        item.onClick();
    }

    if (closeMenu?.isMobile) closeMenu.close();

};




const NavMenu: React.FC<NavMenuProps> = ({ inputData, nameSpace, close, inputParams, session }) => {
    const data = inputData
    const pathname = usePathname();
    const hasPermission = usePermission(session);
    const isAdmin = useIsAdmin(session);
    const isStaff = useIsStaff(session);



    const [openStates, setOpenStates] = useLocalStorage<{
        [key: string]: boolean;
    }>({ key: nameSpace, defaultValue: {} });

    const openState = (item: NavMenuItemProps, ignoreStorage?: boolean) => {
        if (item.type === "item") return false;
        if (item.type === "divider") return false;

        const open = openStates[item.label] || false;
        if (open && !ignoreStorage) return true;

        return false;
    };

    const content = data.map((item, index) => {
        if (item.type === "divider") {
            if (item?.permissions?.length && !hasPermission(item.permissions)) return null;
            if (item?.requireAdmin && !isAdmin()) return null;
            if (item?.requireStaff && !isStaff()) return null;

            return (
                <Divider
                    color={"#f0f0f0"}
                    // mb={0}
                    mt={index === 0 ? 0 : undefined}
                    labelPosition={item.pos}
                    key={Math.floor(index * 1.5)}
                    label={
                        <Grid columns={5} gutter={5}>
                            <Grid.Col fz={16} span={"auto"}>
                                <FontAwesomeIcon icon={item.icon} />
                            </Grid.Col>
                            <Grid.Col fz={16} span={"auto"} c={"white"}>
                                {item.label}
                            </Grid.Col>
                        </Grid>
                    }
                    my={12}
                />
            );
        }
        if (item.type === "item") {
            if (item?.permission && !hasPermission(item.permission)) return null;
            if (item?.requireAdmin && !isAdmin()) return null;
            if (item?.requireStaff && !isStaff()) return null;


            const currentPath = pathname
            const itemPath = item.to
            const isActive = itemPath === currentPath;
            return (
                <React.Fragment key={item.label}>
                    <Tooltip label={item.tooltip} hidden={!item.tooltip}>
                        <NavLink
                            className={twMerge("backdrop-blur-lg bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(0,0,0,0.2)] rounded-md text-white", isActive && "bg-[rgba(255,255,255, 0.2)] hover:bg-[rgba(255,255,255, 00.25)] text-white ")}// key={Math.floor(index * 1.5)}
                            label={item.label}
                            component={Link}
                            href={item?.to ?? ""}
                            onClick={() => onClickHandler(item, close)}
                            active={itemPath === currentPath}
                            leftSection={!!item.icon && <FontAwesomeIcon icon={item.icon} />}
                        />
                    </Tooltip>
                </React.Fragment>
            );
        }
        if (item.type === "multi") {
            const children = item.children.map((child) => {
                if (child.permission && !hasPermission(child.permission)) return null;
                if (child?.requireAdmin && !isAdmin()) return null;
                if (child?.requireStaff && !isStaff()) return null;

                const currentPath = pathname
                const childPath = child.to
                const isActive = childPath === currentPath;

                return (
                    <React.Fragment key={child.label}>
                        <Tooltip label={child.tooltip} hidden={!item.tooltip}>
                            <NavLink
                                className={twMerge("backdrop-blur-lg bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(0,0,0,0.2)] rounded-md text-white", isActive && "bg-[rgba(255,255,255, 0.2)] hover:bg-[rgba(255,255,255, 00.25)] text-white ")}
                                label={child.label}
                                leftSection={!!child.icon && <FontAwesomeIcon icon={child.icon} />}
                                component={Link}
                                href={child?.to ?? ""}
                                active={childPath === currentPath}
                                onClick={() => onClickHandler(child, close)}
                            />
                        </Tooltip>
                    </React.Fragment>
                );
            });

            if (item?.permissions?.length && !hasPermission(item.permissions)) return null
            if (item?.requireAdmin && !isAdmin()) return null;
            if (item?.requireStaff && !isStaff()) return null;


            const isAnyChildActive = item.children.some((child) => {
                const childPath = child.to

                return (
                    childPath ===
                    pathname

                );
            });

            const isActive = isAnyChildActive && !openState(item) && !item.disabled;

            return (
                <React.Fragment key={item.label}>
                    <Tooltip label={item.tooltip} hidden={!item.tooltip}>
                        <NavLink
                            className={twMerge("backdrop-blur-lg bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(0,0,0,0.2)] rounded-md text-white", isActive && "bg-[rgba(255,255,255, 0.2)] hover:bg-[rgba(255,255,255, 00.25)] text-white ")}
                            label={item.label}
                            leftSection={!!item.icon && <FontAwesomeIcon icon={item.icon} />}
                            active={isActive}
                            defaultOpened={openState(item) && !item.disabled}
                            opened={openState(item) && !item.disabled}
                            onClick={() => {
                                setOpenStates({ ...openStates, [item.label]: !openState(item) });
                            }}>
                            <Stack gap={5}>

                                {children}
                            </Stack>
                        </NavLink>
                    </Tooltip>
                </React.Fragment>
            );
        }
    });

    return (
        <Stack gap={5} p={15}>
            {content}
        </Stack>
    );
};



const NavSidebar = ({ elements, session }: { elements: NavMenuItemProps[], session: Session | null | undefined; }) => {
    const mounted = useMounted()

    const { hovered: triggerHovered, ref: triggerRef } = useHover();
    const { hovered: contentHovered, ref: contentRef } = useHover();

    const [opened, { toggle, close }] = useDisclosure(false);

    const os = useAppStore((state) => state.os)

    const _isMobile = useMediaQuery('(max-width: 40em)', true, {
        getInitialValueInEffect: false,
    })

    const isMobile = _isMobile || os === "ios" || os === "android"


    // console.log("isMobile", isMobile)

    const open = !isMobile ? triggerHovered || contentHovered : opened

    return (
        <>
            <Box
                ref={triggerRef}
                className="fixed left-0 bottom-0 h-[calc(100%-100px)]  w-[100px]  ">
            </Box>
            <Box
                ref={contentRef}
                className={twMerge("fixed left-0 top-1/2 transform -translate-y-1/2 -translate-x-[100%]  w-full  xs:w-[300px] h-2/3 transition-transform ease-in-out duration-300 z-[1000] ", open && "-translate-x-0")}>
                <Box
                    className="fixed   right-0 top-1/2 transform -translate-y-1/2 h-5 w-5 translate-x-full bg-[rgba(0,0,0,0.04)] backdrop-blur-lg rounded-md p-3"
                >
                    <Center className={twMerge('h-full transition-transform ease-in-out duration-300 ', open && "rotate-180")}>
                        <FontAwesomeIcon icon={faChevronsRight} />
                    </Center>
                </Box>
                <Box
                    onClick={() => toggle()}
                    className="fixed  border-red-400  right-0 top-1/2 transform -translate-y-1/2 h-16 w-10 translate-x-full" />
                <ScrollArea className='bg-[rgba(0,0,0,0.04)] h-full rounded-md backdrop-blur-lg  border border-slate-700/20 '>
                    {mounted && <Box
                        onClick={() => toggle()}
                        className={twMerge("absolute  border-red-400 right-0 top-0 h-10 w-10", !isMobile && "hidden")} >
                        <FontAwesomeIcon icon={faX} fixedWidth className='absolute  right-1 text-lg w-6 h-6' />
                    </Box>}
                    <NavMenu
                        close={{
                            close: close,
                            isMobile: isMobile,
                        }}

                        session={session}
                        nameSpace='staff-dashboard'
                        inputData={elements}
                    />
                </ScrollArea>
            </Box>
        </>
    )
}

export default NavSidebar