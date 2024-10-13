"use client"

import * as React from "react"
import type { DialogProps } from "@radix-ui/react-dialog"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "~/lib/cUtils"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui/dialog"
import type { IconProp } from "@fortawesome/fontawesome-svg-core"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import type { SessionType } from "next-auth"

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-transparent text-whit focus-visible:outline-none ",
      className
    )}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

interface CommandDialogProps extends DialogProps { }

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 border-none bg-[rgba(0,0,0,0.3)] backdrop-blur-xl">
        <DialogTitle className="hidden" > Command</DialogTitle>
        <DialogDescription className="hidden" > Press F1 to open the command palette.</DialogDescription>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-1.5 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b bg-transparent text-white" cmdk-input-wrapper="">
    <MagnifyingGlassIcon className="mr-2 h-4 w-4  opacity-50 ml-2" />
    <CommandPrimitive.Input

      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden focus-visible:outline-none", className)}
    {...props}
  />
))

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-white "
    {...props}
  />
))

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    style={{ paddingTop: "0px !important", paddingBottom: "0px !important" }}
    className={cn(
      "text-white",
      "relative flex cursor-default select-none items-center rounded-sm px-2  text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-[rgba(255,255,255,0.1)] data-[selected=true]:text-white data-[disabled=true]:opacity-50",
      className,
    )}
    {...props}
  />
))

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"


type CommandItemSeparator = {
  key: string;
  type: "separator";
  permission?: string[];
  alwaysRender?: boolean;
  requireAdmin?: boolean;
  requireStaff?: boolean;
  onlyOnPath?: string[];

}

type CommandItemGroup = {
  type: "group";
  permission?: string[];
  requireAdmin?: boolean;
  requireStaff?: boolean;

  heading?: string;
  commands: Commands[];
  onlyOnPath?: string[];
}
export type CommandGroups = CommandItemGroup | CommandItemSeparator


type CommandsObject = {
  key: string;
  label: string;
  onSelect: ({ val, close, router, saveUserFunc }: { val: string, close: () => void, router: AppRouterInstance, saveUserFunc?: () => void }) => void;
  keywords?: string[];
  icon: IconProp;
  permission?: string | string[];
  disabled?: boolean | (({ val, saveDisabled }: { val: string, saveDisabled: boolean }) => boolean);
  requireAdmin?: boolean;
  requireStaff?: boolean;
  onlyOnPath?: string[];
  className?: string;
}

type CommandsFunction = (props: { close: () => void, router: AppRouterInstance, session: SessionType, setLoading: React.Dispatch<React.SetStateAction<string | undefined>> }) => CommandsObject | undefined | null

type Commands = CommandsObject | CommandsFunction


// interface Commands {
//   key: string;
//   label: string;
//   onSelect: ({ val, close, router, saveUserFunc }: { val: string, close: () => void, router: AppRouterInstance, saveUserFunc?: () => void }) => void;
//   keywords?: string[];
//   icon: IconProp;
//   permission?: string | string[];
//   disabled?: boolean | (({ val, saveDisabled }: { val: string, saveDisabled: boolean }) => boolean);
//   requireAdmin?: boolean;
//   requireStaff?: boolean;
//   onlyOnPath?: string[];
//   className?: string;

// }




export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
