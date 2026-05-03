import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import WorkoutLogForm from './WorkoutLogForm';
import AnalyticsSummary from './AnalyticsSummary';

const ChatMessage = ({ messageId, role, content, timestamp, isStreaming, isThinking }) => {
  const isAI = role === 'AI' || role === 'Assistant';
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const markdownComponents = {
    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="marker:text-primary">{children}</li>,
    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-primary">{children}</h1>,
    h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-primary-container">{children}</h2>,
    code: ({ children }) => <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-primary-container font-mono text-[13px]">{children}</code>,
    pre: ({ children }) => <pre className="bg-surface-container-highest p-3 rounded-xl overflow-x-auto mb-3 border border-white/5 shadow-inner">{children}</pre>,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-3">
        <table className="w-full border-collapse border border-white/10 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => <th className="bg-surface-container-highest p-2 text-left text-xs font-bold border border-white/10">{children}</th>,
    td: ({ children }) => <td className="p-2 text-xs border border-white/10">{children}</td>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-primary pl-4 italic opacity-80 mb-3 bg-primary/5 py-1">{children}</blockquote>,
  };
  
  // Render Thinking State
  if (isThinking) {
    return (
      <div className="flex justify-start w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1 px-1">
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-[10px]">robot</span>
            </div>
            <span className="text-secondary text-[9px] font-black uppercase tracking-[0.2em]">Kinetic Core</span>
          </div>
          <div className="bg-surface-container p-4 rounded-2xl rounded-tl-none border border-white/5 shadow-xl flex items-center gap-3 min-w-[140px]">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
            <span className="text-xs text-on-surface-variant font-medium italic opacity-70">AI is thinking...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      data-message-id={messageId}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'} w-full animate-in fade-in slide-in-from-bottom-3 duration-500`}
    >
      <div className={`flex flex-col gap-1 max-w-[85%] md:max-w-[80%]`}>
        {isAI && (
          <div className="flex items-center gap-2 mb-1 px-1">
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
              <span className="material-symbols-outlined text-secondary text-[10px]">robot</span>
            </div>
            <span className="text-secondary text-[9px] font-black uppercase tracking-[0.2em]">Kinetic Core</span>
            {isStreaming && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            )}
          </div>
        )}
        
        <div className={`relative p-4 rounded-2xl shadow-xl transition-all duration-300 ${
          isAI 
            ? 'bg-surface-container text-on-surface rounded-tl-none border border-white/5' 
            : 'bg-surface-container-highest text-on-surface rounded-tr-none border border-primary/10'
        }`}>
          {isAI && <div className="absolute inset-0 bg-surface-container-low/20 backdrop-blur-sm pointer-events-none rounded-2xl"></div>}
          
          <div className="relative z-10 font-body text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
            {(() => {
              if (!isAI) {
                return <div className="whitespace-pre-wrap">{content}</div>;
              }

              const actionRegex = /(\[UI_ACTION:(?:SHOW_ANALYTICS|DETAILED_LOG\|[^\]]+)\])/g;
              const parts = content.split(actionRegex);
              
              if (parts.length === 1) {
                let cleanContent = content;
                if (isStreaming) {
                  cleanContent = cleanContent.replace(/\[UI_ACTION:[^\]]*$/, '');
                }
                
                return (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {cleanContent}
                  </ReactMarkdown>
                );
              }

              return (
                <div className="flex flex-col gap-4">
                  {parts.map((part, index) => {
                    if (!part || part.trim() === '') return null;

                    // Check for SHOW_ANALYTICS
                    if (part === '[UI_ACTION:SHOW_ANALYTICS]') {
                      return (
                        <div key={index} className="my-2">
                          <AnalyticsSummary />
                        </div>
                      );
                    }

                    // Check for DETAILED_LOG
                    if (part.startsWith('[UI_ACTION:DETAILED_LOG|')) {
                      // Parse: [UI_ACTION:DETAILED_LOG|planId|dayId|date]
                      const logMatch = part.match(/\[UI_ACTION:DETAILED_LOG\|([^|]+)\|([^|]+)\|([^\]]+)\]/);
                      if (logMatch) {
                        return (
                          <div key={index} className="my-2">
                            <WorkoutLogForm 
                              planId={logMatch[1]} 
                              dayId={logMatch[2]} 
                              scheduledDate={logMatch[3]} 
                            />
                          </div>
                        );
                      }
                    }

                    // Render normal markdown text
                    return (
                      <ReactMarkdown key={index} remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {part}
                      </ReactMarkdown>
                    );
                  })}
                </div>
              );
            })()}
            
            {isStreaming && (
              <span className="inline-block w-1.5 h-4 bg-primary ml-1 animate-pulse align-middle"></span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3 opacity-60">
             <span className="text-[9px] uppercase tracking-widest font-bold opacity-40">
              {timestamp || 'Just now'}
            </span>
            {isAI && !isStreaming && (
              <div className="flex items-center gap-3 relative">
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-highest text-primary text-[10px] py-1 px-2 rounded border border-primary/20 animate-in fade-in slide-in-from-bottom-1 duration-200">
                    Copied!
                  </span>
                )}
                
                <button 
                  onClick={handleCopy}
                  className={`hover:text-primary transition-all active:scale-90 flex items-center gap-1 ${copied ? 'text-primary' : ''}`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                </button>
                
                <button 
                  onClick={handleLike}
                  className={`hover:text-primary transition-all active:scale-90 flex items-center gap-1 ${liked ? 'text-primary' : ''}`}
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
                    thumb_up
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
