
import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRenderProps {
  content: string;
  className?: string;
}

export function MarkdownRender({ content, className }: MarkdownRenderProps) {
  // Basic Markdown rendering with regex
  // In a real app, you'd use a proper markdown library like remark or marked
  const processMarkdown = (text: string) => {
    let processed = text;
    
    // Headers
    processed = processed.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    processed = processed.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    processed = processed.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Lists
    processed = processed.replace(/^\s*\-\s*(.*$)/gm, '<li>$1</li>');
    processed = processed.replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Numbered lists
    processed = processed.replace(/^\s*\d+\.\s*(.*$)/gm, '<li>$1</li>');
    processed = processed.replace(/(<li>.*<\/li>\n)+/g, '<ol>$&</ol>');
    
    // Line breaks
    processed = processed.replace(/\n/g, '<br />');
    
    return processed;
  };

  return (
    <div 
      className={cn("prose prose-sm md:prose-base max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: processMarkdown(content) }}
    />
  );
}
