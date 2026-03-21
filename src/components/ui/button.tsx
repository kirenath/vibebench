import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:scale-105 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary/95 hover:shadow-deep",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline:
          "border-2 border-secondary bg-transparent text-secondary hover:bg-secondary/5",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80",
        ghost: "bg-transparent text-primary hover:bg-primary/10 hover:shadow-none font-semibold",
        link: "text-primary underline-offset-4 hover:underline shadow-none hover:scale-100 active:scale-100",
      },
      size: {
        default: "h-12 px-8 text-base",
        sm: "h-10 px-6 text-sm",
        lg: "h-14 px-10 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // We fall back to standard button if not using Slot, otherwise Radix Slot
    // Since we don't have Radix slot installed yet, let's just use standard 'button' if asChild is missing or we could install it.
    // For MVP, we won't use Slot right now to keep it lightweight unless necessary. Let's just use regular 'button' element or mock Slot if asChild is true.
    // Wait, let's just import and use standard `<button>` if asChild is false. We'll install @radix-ui/react-slot.
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
