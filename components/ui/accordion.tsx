import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Track as TrackInterface } from "@/lib/interface";
import Track from "../synthesia/track";
import "./styles.css";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const rootVariants = cva(
  "mw-full w-full mb-4",
  {
    variants: {
      variant: {
        default: "",
        tight: "mb-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const itemVariants = cva(
  "overflow-hidden mt-1 first:mt-0",
  {
    variants: {
      variant: {
        default: "first:rounded-t-lg last:rounded-b-lg",
        tight: "bg-pink-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const triggerVariants = cva(
  "flex items-center justify-between gap-2 flex-1 h-4 w-full box-border bg-slate-200 dark:bg-slate-700 p-6 leading-none text-lg",
  {
    variants: {
      variant: {
        default: "hover:bg-blue-50 rounded-lg shadow-md",
        tight: "p-4 h-3 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type AccordionProps = React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
  trackTitle?: string;
  track: TrackInterface;
  onEditTrack: (track: TrackInterface) => Promise<void>;
  rootVariant?: VariantProps<typeof rootVariants>["variant"];
  triggerVariant?: VariantProps<typeof triggerVariants>["variant"];
};

const Accordion = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Root>, AccordionProps>(
  ({ className, trackTitle, track, onEditTrack, rootVariant, triggerVariant, ...props }, ref) => (
    <AccordionPrimitive.Root 
      ref={ref} {...props} 
      className={cn(rootVariants({ variant: rootVariant }), className)}
    >
      <AccordionPrimitive.Item 
        value={String(track?.id)} 
        className={cn(itemVariants({ variant: "tight" }), className)}
      >
        <AccordionPrimitive.Header className={cn("w-full", className)}>
          <AccordionPrimitive.Trigger
            className={cn(triggerVariants({ variant: triggerVariant }), className)}
          >
            {trackTitle}
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className="AccordionContent">
          <Track track={track} onEditTrack={onEditTrack} />
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  )
);

export default Accordion;
