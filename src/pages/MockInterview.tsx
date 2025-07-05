// frontend/src/pages/MockInterview.tsx
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MarkdownRender } from '@/components/ui/markdown-render';
import { conductMockInterview } from '@/services/ai-service';
import { Loader2, Send, Mic, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
  role: 'user' | 'interviewer';
  content: string;
}

const MockInterview: React.FC = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<'male' | 'female'>('male'); // New state for voice selection
  const speechSynthesis = typeof window !== 'undefined' ? window.speechSynthesis : null;
  
  // STT state
  const [isListening, setIsListening] = useState(false);
  const [sttEnabled, setSttEnabled] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setUserResponse(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Speech recognition error: ' + event.error);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setSttEnabled(false);
      console.warn('Speech Recognition API not supported in this browser');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesis) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speak the last interviewer message when it arrives
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (ttsEnabled && lastMessage && lastMessage.role === 'interviewer' && speechSynthesis) {
      // Strip markdown before speaking
      const plainText = lastMessage.content
        .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
        .replace(/\*(.+?)\*/g, '$1')     // Italic
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
        .replace(/#{1,6}\s?(.+?)$/gm, '$1') // Headers
        .replace(/```[\s\S]*?```/g, 'code block omitted') // Code blocks
        .replace(/`(.+?)`/g, '$1');      // Inline code
      
      speakText(plainText);
    }
  }, [messages, ttsEnabled, selectedVoice]); // Add selectedVoice to dependency array

  const speakText = (text: string) => {
    if (!speechSynthesis) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on selection
    const voices = speechSynthesis.getVoices();
    let voice = null;
    if (selectedVoice === 'male') {
      voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'));
    } else { // female
      voice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'));
    }

    // Fallback to a generic English voice if specific gender not found
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith('en'));
    }

    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error', event);
      setIsSpeaking(false);
      toast.error('Speech synthesis error occurred');
    };
    
    speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Listening... Speak clearly into your microphone');
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startInterview = async () => {
    if (!jobTitle.trim()) {
      toast.error('Please enter a job title');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    setIsLoading(true);

    try {
      const response = await conductMockInterview(jobTitle, jobDescription, '', 'true');

      if (response.error) {
        toast.error(response.error);
        return;
      }

      setMessages([
        {
          role: 'interviewer',
          content: response.text || 'Hello, shall we begin the interview?',
        },
      ]);

      setIsInterviewStarted(true);
    } catch (error) {
      console.error('Error starting mock interview:', error);
      toast.error('Failed to start the interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendResponse = async () => {
    if (!userResponse.trim()) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Stop speaking if active
    if (isSpeaking && speechSynthesis) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const newMessage: Message = {
      role: 'user',
      content: userResponse,
    };

    setMessages((prev) => [...prev, newMessage]);
    const currentResponse = userResponse;
    setUserResponse('');
    setIsLoading(true);

    try {
      const response = await conductMockInterview(jobTitle, jobDescription, currentResponse, 'false');

      if (response.error) {
        toast.error(response.error);
        return;
      }

      const interviewerResponse: Message = {
        role: 'interviewer',
        content: response.text || "I apologize, but I could not generate a response. Let's continue.",
      };

      setMessages((prev) => [...prev, interviewerResponse]);
    } catch (error) {
      console.error('Error in mock interview:', error);
      toast.error('Failed to process your response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mock Interview</h1>
            <p className="text-muted-foreground mt-2">
              Practice your interview skills with our AI interviewer. Enter a job title and description to get started.
            </p>
          </div>

          {!isInterviewStarted ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Enter job title, e.g., Data Scientist, Software Engineer"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste or type the job description here..."
                    className="min-h-[200px] w-full"
                    required
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="tts-toggle" 
                      checked={ttsEnabled} 
                      onCheckedChange={setTtsEnabled} 
                    />
                    <Label htmlFor="tts-toggle">Text-to-Speech (Hear interviewer)</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="stt-toggle" 
                      checked={sttEnabled} 
                      onCheckedChange={setSttEnabled} 
                      disabled={!recognitionRef.current}
                    />
                    <Label htmlFor="stt-toggle">Speech-to-Text (Voice responses)</Label>
                  </div>
                </div>

                {/* New: Voice Selection */}
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Select the Interviewer</Label>
                  <Select value={selectedVoice} onValueChange={(value: 'male' | 'female') => setSelectedVoice(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Mr. Musa </SelectItem>
                      <SelectItem value="female">Ms. Maria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={startInterview}
                  className="w-full sm:w-auto"
                  disabled={isLoading || !jobTitle.trim() || !jobDescription.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Interview...
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col space-y-4 h-[600px] sm:h-[70vh]">
              <div className="flex-1 overflow-y-auto px-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`py-4 ${message.role === 'user' ? 'pl-4 pr-12 sm:pr-16' : 'pr-4 pl-12 sm:pl-16'}`}
                  >
                    <div
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          <>
                            <MarkdownRender content={message.content} />
                            {ttsEnabled && message.role === 'interviewer' && (
                              <div className="flex justify-end mt-2">
                                {isSpeaking ? (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={stopSpeaking} 
                                    className="h-8 px-2"
                                  >
                                    <VolumeX className="h-4 w-4 mr-1" />
                                    Stop
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => speakText(message.content)}
                                    className="h-8 px-2"
                                  >
                                    <Volume2 className="h-4 w-4 mr-1" />
                                    Play
                                  </Button>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex flex-col space-y-2 px-2">
                <div className="relative">
                  <Textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Type your interview response or use the microphone..."
                    className="min-h-[100px] w-full resize-none pr-10"
                    disabled={isLoading}
                  />
                  {sttEnabled && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute right-2 bottom-2 ${isListening ? 'text-red-500' : ''}`}
                      onClick={toggleListening}
                      disabled={isLoading || !sttEnabled}
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsInterviewStarted(false);
                      setMessages([]);
                      setJobTitle('');
                      setJobDescription('');
                      stopSpeaking();
                      if (isListening && recognitionRef.current) {
                        recognitionRef.current.stop();
                        setIsListening(false);
                      }
                    }}
                    className="w-full sm:w-auto"
                  >
                    End Interview
                  </Button>
                  <Button
                    onClick={sendResponse}
                    disabled={isLoading || !userResponse.trim()}
                    className="w-full sm:w-auto flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Response <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MockInterview;