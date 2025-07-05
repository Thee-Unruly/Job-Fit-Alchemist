import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRender } from '@/components/ui/markdown-render';
import { StatsCard, StatsGroup } from '@/components/ui/stats';
import { Loader2, FileText, Upload, BarChart } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { analyzeCv } from '@/services/ai-service';
// @ts-ignore - Importing pdf-parse which doesn't have TypeScript definitions
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

interface AIResponse {
  text?: string;
  error?: string;
}

const CVAnalysis: React.FC = () => {
  const [cv, setCV] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');
  const [role, setRole] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  const [inputMethod, setInputMethod] = useState('upload');

  const cleanText = (text: string): string => {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const extractAtsScore = (text: string): number => {
    const match = text.match(/(?:ATS Score|Match|Score):?\s*(\d+)%?/i) || text.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleAnalyze = async () => {
    let finalCvText = '';
    let finalCoverLetterText = '';
    setError('');

    if (inputMethod === 'upload') {
      if (!cv) {
        setError('Please upload your CV');
        return;
      }
      if (!role) {
        setError('Please enter the role you are applying for');
        return;
      }
      try {
        if (cv.type === 'application/pdf') {
          const buffer = await cv.arrayBuffer();
          const pdfData = await pdfParse(Buffer.from(buffer));
          finalCvText = pdfData.text;
        } else {
          finalCvText = await cv.text();
        }
        if (coverLetter) {
          if (coverLetter.type === 'application/pdf') {
            const buffer = await coverLetter.arrayBuffer();
            const pdfData = await pdfParse(Buffer.from(buffer));
            finalCoverLetterText = pdfData.text;
          } else {
            finalCoverLetterText = await coverLetter.text();
          }
        }
      } catch (err) {
        setError('Error reading uploaded files. Please ensure they are valid PDF or text files.');
        return;
      }
    } else {
      if (!cvText.trim()) {
        setError('Please paste your CV text');
        return;
      }
      if (!role) {
        setError('Please enter the role you are applying for');
        return;
      }
      finalCvText = cleanText(cvText);
      finalCoverLetterText = coverLetterText ? cleanText(coverLetterText) : '';
    }

    if (!finalCvText.trim()) {
      setError('CV is empty. Please provide valid content.');
      return;
    }
    if (finalCvText.length < 50) {
      setError('CV is too short. Please provide more detailed content.');
      return;
    }

    setIsLoading(true);
    try {
      // Construct a prompt that combines CV, role, and cover letter if present
      const combinedText = `Role: ${role}\n\nCV:\n${finalCvText}${
        finalCoverLetterText ? `\n\nCover Letter:\n${finalCoverLetterText}` : ''
      }`;
      
      // Call the analyzeCv function with the combined text
      const result = await analyzeCv(combinedText);
      console.log('AI Response:', result);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      setAnalysis(result.text || 'No analysis available');
      const score = extractAtsScore(result.text || '');
      setAtsScore(score);
      setActiveTab('results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CV & Cover Letter Analysis</h1>
            <p className="text-muted-foreground">
              Upload or paste your CV and cover letter to receive tailored feedback and optimization tips for your target role.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input Documents</TabsTrigger>
              <TabsTrigger value="results" disabled={!analysis}>Results</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6">
                  {error && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    <Tabs value={inputMethod} onValueChange={setInputMethod} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload Files
                        </TabsTrigger>
                        <TabsTrigger value="paste" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Paste Text
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload" className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role you are applying for</Label>
                          <Input
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g., Machine Learning Engineer, Data Scientist"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Upload your CV (Required)</Label>
                          <FileUpload
                            onFileSelect={setCV}
                            selectedFile={cv}
                            accept=".pdf,.doc,.docx,.txt"
                            label="Upload CV"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Upload your Cover Letter (Optional)</Label>
                          <FileUpload
                            onFileSelect={setCoverLetter}
                            selectedFile={coverLetter}
                            accept=".pdf,.doc,.docx,.txt"
                            label="Upload Cover Letter"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="paste" className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role you are applying for</Label>
                          <Input
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="e.g., Machine Learning Engineer, Data Scientist"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Paste your CV (Required)</Label>
                            <Textarea
                              placeholder="Paste your CV text here..."
                              className="min-h-[300px] resize-none"
                              value={cvText}
                              onChange={(e) => setCvText(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Paste your Cover Letter (Optional)</Label>
                            <Textarea
                              placeholder="Paste your cover letter text here..."
                              className="min-h-[300px] resize-none"
                              value={coverLetterText}
                              onChange={(e) => setCoverLetterText(e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button
                      onClick={handleAnalyze}
                      disabled={
                        isLoading ||
                        (inputMethod === 'upload' && (!cv || !role)) ||
                        (inputMethod === 'paste' && (!cvText.trim() || !role))
                      }
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Documents'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6 mt-6">
              {atsScore !== null && (
                <StatsGroup>
                  <StatsCard
                    title="ATS Score"
                    value={`${atsScore}%`}
                    description="Higher is better. 70%+ is recommended."
                    icon={<BarChart />}
                  />
                </StatsGroup>
              )}
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Analysis Results</h2>
                    <Button variant="outline" onClick={() => setActiveTab('input')}>
                      Input New Documents
                    </Button>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <MarkdownRender content={analysis} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CVAnalysis;