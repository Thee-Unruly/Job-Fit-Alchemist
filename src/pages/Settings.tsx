
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { APIKeyForm } from '@/components/ui/api-key-form';
import { Separator } from '@/components/ui/separator';

const Settings: React.FC = () => {
  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure your application settings.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure your OpenRouter API key to use the AI features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">OpenRouter API</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We use OpenRouter to access DeepSeek for AI features. You need to provide your own API key.
                  </p>
                  <APIKeyForm />
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="font-medium">How to get an API key</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 mt-2">
                    <li>1. Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary underline">OpenRouter.ai</a> and create an account</li>
                    <li>2. Go to the API Keys section</li>
                    <li>3. Create a new API key</li>
                    <li>4. Copy and paste the key here</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
