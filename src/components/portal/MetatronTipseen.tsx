import React, { ReactElement } from 'react'
import { Tipseen } from '@vibe/core'

interface MetatronTipseenProps {
  children: React.ReactNode
  content: ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function MetatronTipseen({ children, content, position = 'bottom' }: MetatronTipseenProps) {
  return (
    <Tipseen
      content={content}
      position={position}
      animationType="expand"
      hideDelay={100}
      showDelay={200}
    >
      <span className="inline-block">
        {children}
      </span>
    </Tipseen>
  )
}
