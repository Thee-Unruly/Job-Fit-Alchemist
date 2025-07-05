import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { FileUpload } from '@/components/ui/file-upload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarkdownRender } from '@/components/ui/markdown-render';
import { StatsCard, StatsGroup } from '@/components/ui/stats';
import { matchJobDescription } from '@/services/ai-service';
import { Loader2, BarChart, FileText, Upload } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "@/hooks/use-toast";

interface AIResponse {
  text?: string;
  error?: string;
}

const JobMatch: React.FC = () => {
  const [cv, setCV] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<File | null>(null);
  const [cvText, setCvText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('input');
  const [inputMethod, setInputMethod] = useState('upload');
  const [atsScore, setAtsScore] = useState<number | null>(null);

  // Radar chart data
  const [radarData, setRadarData] = useState([
    { category: 'Technical Skills', match: 0 },
    { category: 'Soft Skills', match: 0 },
    { category: 'Experience', match: 0 },
    { category: 'Education', match: 0 },
    { category: 'Keywords', match: 0 },
  ]);

  const extractAtsScore = (text: string): number => {
    // Match formats like "ATS Score: 85", "Match: 85%", "Score: 85", or "85%"
    const match = text.match(/(?:ATS Score|Match|Score):?\s*(\d+)%?/i) || text.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const generateRadarData = (score: number) => {
    // Adjust based on ATS score; refine with actual parsing later
    const base = Math.max(score - 20, 10); // Ensure non-zero values
    return [
      { category: 'Technical Skills', match: base + Math.floor(Math.random() * 20) },
      { category: 'Soft Skills', match: base + Math.floor(Math.random() * 20) },
      { category: 'Experience', match: base + Math.floor(Math.random() * 20) },
      { category: 'Education', match: base + Math.floor(Math.random() * 20) },
      { category: 'Keywords', match: base + Math.floor(Math.random() * 20) },
    ];
  };

  const handleAnalyze = async () => {
    let finalCvText = '';
    let finalJobDescText = '';
    setError('');

    if (inputMethod === 'upload') {
      if (!cv || !jobDescription) {
        setError('Please upload both CV and job description');
        return;
      }
      try {
        // Replace with pdf-parse or mammoth for PDF/DOCX
        // For PDF example:
        // const buffer = await cv.arrayBuffer();
        // const pdfData = await pdfParse(Buffer.from(buffer));
        // finalCvText = pdfData.text;
        finalCvText = await cv.text();
        finalJobDescText = await jobDescription.text();
      } catch (err) {
        setError('Error reading uploaded files. Please ensure they are valid text-based files.');
        return;
      }
    } else {
      if (!cvText.trim() || !jobDescriptionText.trim()) {
        setError('Please paste both CV and job description text');
        return;
      }
      finalCvText = cvText;
      finalJobDescText = jobDescriptionText;
    }

    // Validate non-empty inputs
    if (!finalCvText.trim() || !finalJobDescText.trim()) {
      setError('CV or job description is empty. Please provide valid content.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await matchJobDescription(finalCvText, finalJobDescText);
      console.log('AI Response:', result.text); // Debug response
      if (result.error) {
        setError(result.error);
        return;
      }

      setAnalysis(result.text || '');
      const score = extractAtsScore(result.text || '');
      setAtsScore(score);
      setRadarData(generateRadarData(score));
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
            <h1 className="text-3xl font-bold tracking-tight">CV vs Job Description Matcher</h1>
            <p className="text-muted-foreground">
              Analyze how well your CV matches a specific job description and get optimization tips.
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
                          <label className="text-sm font-medium">Upload your CV</label>
                          <FileUpload
                            onFileSelect={setCV}
                            selectedFile={cv}
                            accept=".pdf,.doc,.docx,.txt"
                            label="Upload CV"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Upload Job Description</label>
                          <FileUpload
                            onFileSelect={setJobDescription}
                            selectedFile={jobDescription}
                            accept=".pdf,.doc,.docx,.txt"
                            label="Upload Job Description"
                          />
                        </div>
                      </TabsContent>

                      <TabsContent value="paste" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Paste your CV</label>
                            <Textarea
                              placeholder="Paste your CV text here..."
                              className="min-h-[300px] resize-none"
                              value={cvText}
                              onChange={(e) => setCvText(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Paste Job Description</label>
                            <Textarea
                              placeholder="Paste the job description text here..."
                              className="min-h-[300px] resize-none"
                              value={jobDescriptionText}
                              onChange={(e) => setJobDescriptionText(e.target.value)}
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Button
                      onClick={handleAnalyze}
                      disabled={
                        isLoading ||
                        (inputMethod === 'upload' && (!cv || !jobDescription)) ||
                        (inputMethod === 'paste' && (!cvText.trim() || !jobDescriptionText.trim()))
                      }
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Match'
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

              <Card className="overflow-hidden">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Match Analysis</h3>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="category" />
                        <Radar
                          name="Match"
                          dataKey="match"
                          stroke="#2563eb"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Detailed Analysis</h2>
                    <Button variant="outline" onClick={() => setActiveTab('input')}>
                      Upload New Documents
                    </Button>
                  </div>

                  <MarkdownRender content={analysis} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default JobMatch;
