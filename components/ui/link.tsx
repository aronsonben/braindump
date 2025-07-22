import * as React from "react";
import Link from "next/link";
import { LinkProps } from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const linkVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        test: "bg-pink-500 text-xs p-10",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        active: "border border-white border-input bg-[#307DA5] text-white hover:bg-accent hover:text-accent-foreground",
        inline: "inline bg-none underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        synth: "h-6 rounded-md px-2",
        icon: "h-10 w-10",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface CustomLinkProps extends LinkProps ,VariantProps<typeof linkVariants> {
  className?: string;
  children?: React.ReactNode | string | undefined;
}

const CustomLink = React.forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ href, variant, size, className = "", children = "Link", ...props }, ref) => {
    return (
      <Link
        className={cn(linkVariants({ variant, size, className }))}
        ref={ref}
        href={href}
        {...props}
      >
        {children}
      </Link>
    );
  },
);
CustomLink.displayName = "CustomLink";

export { CustomLink, linkVariants };
