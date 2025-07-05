import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRender } from '@/components/ui/markdown-render';
import { generateSkillsMap } from '@/services/ai-service';
import { Loader2, FileText, ClipboardList } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const SkillsMap: React.FC = () => {
  const [cv, setCV] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [inputMethod, setInputMethod] = useState<'upload' | 'paste'>('upload');
  const [pastedCV, setPastedCV] = useState('');
  const { toast } = useToast();

  const extractTextFromCV = async (file: File): Promise<string> => {
    try {
      return await file.text();
    } catch (err) {
      console.error('Error extracting text from CV:', err);
      toast({
        title: "Error extracting text",
        description: "Could not extract text from the uploaded file. Please try another file or paste your CV text.",
        variant: "destructive"
      });
      throw new Error('Failed to extract text from CV');
    }
  };

  const handleGenerateRoadmap = async () => {
    let cvText = '';
    
    if (inputMethod === 'upload' && !cv) {
      setError('Please upload your CV');
      return;
    }
    
    if (inputMethod === 'paste' && !pastedCV.trim()) {
      setError('Please paste your CV content');
      return;
    }
    
    if (!targetRole) {
      setError('Please enter your target role');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Get CV text either from file or from pasted content
      if (inputMethod === 'upload' && cv) {
        cvText = await extractTextFromCV(cv);
        toast({
          title: "CV Processed",
          description: "Your CV has been successfully extracted and is being analyzed.",
        });
      } else {
        cvText = pastedCV;
      }
      
      // Create a simple profile object with the CV text
      const profile = {
        experience: cvText,
      };
      
      const result = await generateSkillsMap(profile, targetRole);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      setRoadmap(result.text || '');
      setActiveTab('results');
    } catch (err) {
      console.error('Roadmap generation error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Personalized Skills Roadmap</h1>
            <p className="text-muted-foreground">
              Get a tailored learning plan and skills roadmap based on your profile and career goals.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Input Information</TabsTrigger>
              <TabsTrigger value="results" disabled={!roadmap}>Your Roadmap</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="targetRole">Your Target Role</Label>
                      <Input
                        id="targetRole"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g., Senior Software Engineer, Marketing Manager"
                        required
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex space-x-4">
                        <Button 
                          type="button" 
                          variant={inputMethod === 'upload' ? "default" : "outline"}
                          onClick={() => setInputMethod('upload')}
                          className="flex-1"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Upload CV
                        </Button>
                        <Button 
                          type="button" 
                          variant={inputMethod === 'paste' ? "default" : "outline"}
                          onClick={() => setInputMethod('paste')}
                          className="flex-1"
                        >
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Paste CV
                        </Button>
                      </div>
                      
                      {inputMethod === 'upload' ? (
                        <div className="space-y-2">
                          <Label>Upload your CV</Label>
                          <FileUpload
                            onFileSelect={setCV}
                            selectedFile={cv}
                            accept=".pdf,.doc,.docx,.txt"
                            label="Upload CV"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="pastedCV">Paste your CV content</Label>
                          <Textarea
                            id="pastedCV"
                            value={pastedCV}
                            onChange={(e) => setPastedCV(e.target.value)}
                            placeholder="Paste your CV content here..."
                            className="min-h-[200px]"
                            required
                          />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleGenerateRoadmap}
                      disabled={isLoading || 
                        (inputMethod === 'upload' && !cv) || 
                        (inputMethod === 'paste' && !pastedCV.trim()) || 
                        !targetRole}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Roadmap...
                        </>
                      ) : (
                        'Generate Skills Roadmap'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="results" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Your Personalized Roadmap</h2>
                    <Button variant="outline" onClick={() => setActiveTab('upload')}>
                      Generate New Roadmap
                    </Button>
                  </div>
                  
                  <MarkdownRender content={roadmap} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SkillsMap;
