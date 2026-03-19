import React, { ReactElement } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MetatronTipseenProps {
  children: React.ReactNode
  content: ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function MetatronTipseen({ children, content, position = 'bottom' }: MetatronTipseenProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="inline-block">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent side={position} className="bg-popover/90 backdrop-blur-md border-celestial-neon/30 text-foreground">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
