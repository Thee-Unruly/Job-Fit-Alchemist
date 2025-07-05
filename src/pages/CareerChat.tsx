
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { getCareerAdvice } from '@/services/ai-service';
import { MarkdownRender } from '@/components/ui/markdown-render';
import { toast } from 'sonner';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const CareerChat: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I'm Amira, your career advisor AI assistant. How can I help you with your career today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await getCareerAdvice(inputValue);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      const aiResponse: Message = {
        sender: 'ai',
        text: response.text || 'I apologize, but I could not generate a response at this time. Please try again later.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in career chat:', error);
      toast.error('Failed to get career advice. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Career Advice Chat</h1>
            <p className="text-muted-foreground">
              Chat with our AI assistant to get personalized career advice, interview tips, and more.
            </p>
          </div>
          
          <div className="flex flex-col space-y-4 h-[600px]">
            <div className="flex-1 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`py-4 ${
                    message.sender === 'user' ? 'pl-4 pr-12' : 'pr-4 pl-12'
                  }`}
                >
                  <div
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground rounded-lg'
                          : 'text-foreground'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      ) : (
                        <MarkdownRender content={message.text} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask for career advice..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CareerChat;
