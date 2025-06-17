import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const SidebarTrigger = DialogPrimitive.Trigger

const SidebarPortal = DialogPrimitive.Portal

const SidebarClose = DialogPrimitive.Close

const Sidebar = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>
>(({ children, ...props }, ref) => (
  <DialogPrimitive.Root
    modal={true}
    {...props}
  >
    {children}
  </DialogPrimitive.Root>
))
Sidebar.displayName = DialogPrimitive.Root.displayName

const SidebarOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    id="overlay"
    ref={ref}
    className={cn(
      "fixed inset-0 z-20 bg-black/60  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SidebarOverlay.displayName = DialogPrimitive.Overlay.displayName

const SidebarContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SidebarPortal>
    <SidebarOverlay />
    <DialogPrimitive.Content
      id="dialog-content"
      ref={ref}
      className={cn(
        // Sidebar: fixed to left, full height, fixed width, no centering transforms
        "fixed left-0 top-0 z-30 h-full w-64 max-w-full flex flex-col gap-4 border-r bg-[hsl(var(--card))] shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2 sm:rounded-none",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </SidebarPortal>
))
SidebarContent.displayName = DialogPrimitive.Content.displayName

const SidebarHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
SidebarFooter.displayName = "SidebarFooter"

const SidebarTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
SidebarTitle.displayName = DialogPrimitive.Title.displayName

const SidebarDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SidebarDescription.displayName = DialogPrimitive.Description.displayName

export {
  Sidebar,
  SidebarPortal,
  SidebarOverlay,
  SidebarClose,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTitle,
  SidebarDescription,
}
