
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { APIKeyForm } from '@/components/ui/api-key-form';
import { FileText, BookOpen, MessageCircle, PieChart, Mic } from 'lucide-react';
import FeedbackButton from '@/components/FeedbackButton';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      title: 'CV & Cover Letter Analysis',
      description: 'Upload your CV and cover letter to get personalized feedback and improvement suggestions.',
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      link: '/cv-analysis'
    },
    {
      title: 'CV vs Job Description Match',
      description: 'Analyze how well your CV matches a specific job description and get tips to improve your match rate.',
      icon: <BookOpen className="h-8 w-8 text-teal-600" />,
      link: '/job-match'
    },
    {
      title: 'Career Advice Chatbot',
      description: 'Chat with our AI to get personalized career advice, interview tips, and more.',
      icon: <MessageCircle className="h-8 w-8 text-purple-600" />,
      link: '/career-chat'
    },
    {
      title: 'Personalized Skills Roadmap',
      description: 'Get a tailored skills roadmap and learning plan based on your profile and target role.',
      icon: <PieChart className="h-8 w-8 text-orange-600" />,
      link: '/skills-map'
    },
    {
      title: 'Mock Interview Practice',
      description: 'Practice interviewing with our AI coach and get personalized feedback on your responses.',
      icon: <Mic className="h-8 w-8 text-pink-600" />,
      link: '/mock-interview'
    }
  ];

  return (
    <Layout>
      <div className="container py-6">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'there'}!</h1>
              <p className="text-muted-foreground">
                Use our AI-powered tools to accelerate your career journey.
              </p>
            </div>
            <APIKeyForm />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col">
                <CardHeader>
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto pt-4">
                  <Button asChild className="w-full">
                    <Link to={feature.link}>Launch</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Follow these steps to make the most of Job Fit Alchemist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    1
                  </div>
                  <h4 className="font-medium text-lg">Upload your CV and get feedback</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11">
                  Start with the CV Analysis tool to get personalized feedback on your resume.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    2
                  </div>
                  <h4 className="font-medium text-lg">Match your CV with job descriptions</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11">
                  Use the Job Match tool to optimize your CV for specific job applications.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    3
                  </div>
                  <h4 className="font-medium text-lg">Practice interviews</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11">
                  Use the Mock Interview tool to practice answering interview questions and get feedback.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    4
                  </div>
                  <h4 className="font-medium text-lg">Get career advice</h4>
                </div>
                <p className="text-muted-foreground text-sm pl-11">
                  Use the Career Chat tool to get personalized advice for your career growth.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FeedbackButton />
    </Layout>
  );
};

export default Dashboard;
