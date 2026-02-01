"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = DropdownMenuPrimitive.Content;
const DropdownMenuItem = DropdownMenuPrimitive.Item;
const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;
const DropdownMenuLabel = DropdownMenuPrimitive.Label;

const DropdownMenuContentInner = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-gray-100 bg-white p-1.5 text-gray-900 shadow-lg animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContentInner.displayName =
  DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItemInner = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none transition-colors focus:bg-gray-50 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4',
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuItemInner.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuLabelInner = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider",
      inset && "pl-8",
      className,
    )}
    {...props}
  />
));
DropdownMenuLabelInner.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparatorInner = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-100", className)}
    {...props}
  />
));
DropdownMenuSeparatorInner.displayName =
  DropdownMenuPrimitive.Separator.displayName;

// Custom dropdown button component
interface DropdownButtonProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    danger?: boolean;
  }>;
  align?: "start" | "center" | "end";
}

export function DropdownButton({
  trigger,
  items,
  align = "end",
}: DropdownButtonProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContentInner align={align} className="w-48">
        {items.map((item, index) =>
          item.href ? (
            <DropdownMenuItemInner key={index} asChild>
              <a href={item.href} className={cn(item.danger && "text-red-600")}>
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </a>
            </DropdownMenuItemInner>
          ) : (
            <DropdownMenuItemInner
              key={index}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(item.danger && "text-red-600")}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </DropdownMenuItemInner>
          ),
        )}
      </DropdownMenuContentInner>
    </DropdownMenu>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuContentInner,
  DropdownMenuItemInner,
  DropdownMenuLabelInner,
  DropdownMenuSeparatorInner,
};
