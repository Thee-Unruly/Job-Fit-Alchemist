import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Edit } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, profile, updateProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [name, setName] = useState(profile?.name || '');
  const [education, setEducation] = useState(profile?.education || '');
  const [experience, setExperience] = useState(profile?.experience || '');
  const [goals, setGoals] = useState(profile?.goals || '');
  const [skill, setSkill] = useState('');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  
  // Update form values when profile data changes
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEducation(profile.education);
      setExperience(profile.experience);
      setGoals(profile.goals);
      setSkills(profile.skills);
    }
  }, [profile]);
  
  const addSkill = () => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
      setSkill('');
    }
  };
  
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        name,
        education,
        experience,
        goals,
        skills,
      });
      
      setIsEditing(false); // Switch back to view mode after saving
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  if (!isEditing && profile) {
    // View Mode
    return (
      <Layout>
        <div className="container max-w-3xl py-6">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground">
                  View and manage your profile information
                </p>
              </div>
              <Button onClick={handleEditClick} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="text-sm p-2 border rounded-md bg-muted/50">
                    {profile.name}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Education</Label>
                  <div className="text-sm p-2 border rounded-md bg-muted/50 whitespace-pre-line">
                    {profile.education || 'Not specified'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Work Experience</Label>
                  <div className="text-sm p-2 border rounded-md bg-muted/50 whitespace-pre-line">
                    {profile.experience || 'Not specified'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Career Goals</Label>
                  <div className="text-sm p-2 border rounded-md bg-muted/50 whitespace-pre-line">
                    {profile.goals || 'Not specified'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Skills</Label>
                  {profile.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.skills.map((s) => (
                        <Badge key={s} variant="secondary" className="px-3 py-1.5">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No skills added</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Edit Mode
  return (
    <Layout>
      <div className="container max-w-3xl py-6">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user?.profileCompleted ? 'Edit Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-muted-foreground">
              Update your information to use the app's features.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                This information will be used to personalize your experience.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Textarea
                    id="education"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="Your educational background"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Work Experience</Label>
                  <Textarea
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Your previous work experience"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goals">Career Goals</Label>
                  <Textarea
                    id="goals"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="Your career goals and aspirations"
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="skills">Skills</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="skills"
                      value={skill}
                      onChange={(e) => setSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                  
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {skills.map((s) => (
                        <Badge key={s} variant="secondary" className="px-3 py-1.5">
                          {s}
                          <button
                            type="button"
                            onClick={() => removeSkill(s)}
                            className="ml-2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
