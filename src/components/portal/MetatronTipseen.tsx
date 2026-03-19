import React from "react";
import { Tipseen } from "@vibe/core";
import { Sparkles } from "lucide-react";

interface MetatronTipseenProps {
  children: React.ReactNode;
  content: string;
  title?: string;
}

const MetatronTipseen: React.FC<MetatronTipseenProps> = ({ children, content, title }) => {
  return (
    <Tipseen
      content={
        <div className="p-2 bg-celestial-void/90 backdrop-blur-md border border-celestial-neon/30 rounded-lg shadow-glow-neon">
          {title && (
            <div className="flex items-center gap-2 mb-2 border-b border-celestial-neon/20 pb-1">
              <Sparkles className="w-4 h-4 text-celestial-neon animate-pulse" />
              <h4 className="text-sm font-bold text-celestial-neon uppercase tracking-widest leading-none">
                {title}
              </h4>
            </div>
          )}
          <p className="text-xs text-foreground/80 leading-relaxed italic">
            {content}
          </p>
        </div>
      }
      position="right"
      animationType="expand"
    >
      <span className="inline-block">{children}</span>
    </Tipseen>
  );
};

export default MetatronTipseen;
