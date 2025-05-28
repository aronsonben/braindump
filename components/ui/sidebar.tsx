'use client' 
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, HamburgerIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/** Instructions on how to make a sidebar using radix-ui Dialog component:
 * - Dialog Portal with custom container
 * - Dialog Content with modal=false
 *    - onInteractOutside={e => e.preventDefault()}
 *    - onPointerDownOutside={e => e.preventDefault()}
 */
const SidebarTrigger = DialogPrimitive.Trigger
const SidebarClose = DialogPrimitive.Close

const SidebarOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    id="overlay"
    ref={ref}
    className={cn(
      "flex fixed inset-0 z-20 bg-black/20  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SidebarOverlay.displayName = DialogPrimitive.Overlay.displayName

const SidebarPortal = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Portal>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>
>(({ children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <SidebarOverlay />
    <DialogPrimitive.Content
      id="dialog-content"
      ref={ref}
      onInteractOutside={e => e.preventDefault()}
      onPointerDownOutside={e => e.preventDefault()}
      className={cn("bg-pink-200")}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SidebarPortal.displayName = DialogPrimitive.Portal.displayName

const Sidebar = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>
>(({ children, ...props }, ref) => (
  <DialogPrimitive.Root
    modal={false}
    {...props}
  >
    <SidebarTrigger asChild>
      {children}
    </SidebarTrigger>
    <SidebarPortal />
  </DialogPrimitive.Root>
))
Sidebar.displayName = DialogPrimitive.Root.displayName


export {
  Sidebar,
  SidebarPortal,
  SidebarOverlay
}
