import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium leading-none whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary-active active:bg-primary-active disabled:bg-primary-disabled disabled:text-muted",
        outline:
          "border border-hairline bg-canvas text-ink hover:bg-surface-card hover:text-ink active:bg-surface-card",
        secondary:
          "bg-surface-card text-ink hover:bg-surface-cream-strong active:bg-surface-cream-strong",
        secondaryOnDark:
          "bg-surface-dark-elevated text-on-dark hover:bg-surface-dark-soft active:bg-surface-dark-soft",
        ghost:
          "text-ink hover:bg-surface-soft hover:text-ink active:bg-surface-soft dark:text-on-dark dark:hover:bg-surface-dark-elevated dark:hover:text-on-dark",
        destructive:
          "bg-error text-on-primary hover:bg-error/90 active:bg-error/90 focus-visible:ring-error/20",
        link: "text-primary underline underline-offset-4 hover:text-primary-active",
      },
      size: {
        default:
          "h-10 gap-1.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        lg: "h-11 gap-1.5 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        icon: "size-10 rounded-full",
        "icon-xs": "size-7 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 rounded-full",
        "icon-lg": "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
