import * as React from "react"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

const ResizablePanel = ({
  defaultSize = 50,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  defaultSize?: number
}) => {
  return (
    <div
      className={cn("relative", className)}
      style={{ "--default-size": `${defaultSize}%` } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  )
}

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  withHandle?: boolean
}) => {
  return (
    <div
      className={cn(
        "relative w-px bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="absolute left-1/2 top-1/2 z-10 h-4 w-3 -translate-x-1/2 rounded-sm border bg-border shadow transition-colors hover:bg-muted">
          <GripVertical className="h-4 w-3" />
        </div>
      )}
    </div>
  )
}

const ResizablePanelGroup = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex h-full max-h-[800px] w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanelResizeHandle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative w-px bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      className
    )}
    {...props}
  />
)

export {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
  ResizablePanelResizeHandle,
}
