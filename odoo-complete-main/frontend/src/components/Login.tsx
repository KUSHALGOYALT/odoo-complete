import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Users, RefreshCw, MapPin, X, Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { login, register } from "../services/api";
import { toast } from "@/components/ui/sonner";

interface LoginProps {
  onLogin: () => void;
}

interface SkillWithLevel {
  name: string;
  level: string;
}

const Login = ({ onLogin }: LoginProps) => {
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    location: "",
    tagline: "",
    profilePhoto: "", // Changed from File to string (base64 or URL)
    isPublic: true,
    offeredSkills: [] as SkillWithLevel[],
    wantedSkills: [] as string[],
    availability: "FLEXIBLE" as string,
  });
  const [loginData, setLoginData] = useState({
    emailOrUsername: "",
    password: "",
  });

  // Temporary input states for skills
  const [newOfferedSkill, setNewOfferedSkill] = useState({ name: "", level: "BEGINNER" });
  const [newWantedSkill, setNewWantedSkill] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userId", data.data.user.id);
        toast.success(data.message);
        onLogin();
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Login failed. Please check your credentials.";
      console.error("Login error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
      });
      toast.error(errorMessage);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => {
      // Send as JSON object matching backend DTO
      const registrationDto = {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        location: data.location,
        tagline: data.tagline,
        isPublic: data.isPublic,
        offeredSkills: data.offeredSkills.map((skill: SkillWithLevel) => ({
          name: skill.name,
          level: skill.level
        })),
        wantedSkills: data.wantedSkills,
        availability: data.availability,
        profilePhoto: data.profilePhoto // Base64 string or URL
      };

      return register(registrationDto);
    },
    onSuccess: (data) => {
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userId", data.data.user.id);
        toast.success(data.message);
        onLogin();
      } else {
        toast.error(data.message);
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Signup failed. Please try again.";
      console.error("Signup error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
      });
      toast.error(errorMessage);
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.emailOrUsername || !loginData.password) {
      toast.error("Email/Username and password are required");
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onboardingStep === 0) {
      if (!profileData.email || !profileData.password) {
        toast.error("Email and password are required");
        return;
      }
      setOnboardingStep(1);
    } else if (onboardingStep === 2) {
      if (!profileData.name || !profileData.username) {
        toast.error("Name and username are required");
        return;
      }
      if (profileData.offeredSkills.length === 0 || profileData.wantedSkills.length === 0) {
        toast.error("At least one offered and one wanted skill are required");
        return;
      }
      registerMutation.mutate(profileData);
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setProfileData({ ...profileData, profilePhoto: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const addOfferedSkill = () => {
    if (newOfferedSkill.name.trim()) {
      setProfileData({
        ...profileData,
        offeredSkills: [...profileData.offeredSkills, {
          name: newOfferedSkill.name.trim(),
          level: newOfferedSkill.level
        }]
      });
      setNewOfferedSkill({ name: "", level: "BEGINNER" });
    }
  };

  const removeOfferedSkill = (index: number) => {
    setProfileData({
      ...profileData,
      offeredSkills: profileData.offeredSkills.filter((_, i) => i !== index)
    });
  };

  const addWantedSkill = () => {
    if (newWantedSkill.trim()) {
      setProfileData({
        ...profileData,
        wantedSkills: [...profileData.wantedSkills, newWantedSkill.trim()]
      });
      setNewWantedSkill("");
    }
  };

  const removeWantedSkill = (index: number) => {
    setProfileData({
      ...profileData,
      wantedSkills: profileData.wantedSkills.filter((_, i) => i !== index)
    });
  };

  if (onboardingStep > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#875A7B] to-[#F06EAA] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#875A7B]">
              {onboardingStep === 1 ? "Add Your Photo" : "Complete Your Profile"}
            </CardTitle>
            <CardDescription>
              {onboardingStep === 1
                ? "Help others recognize you by adding a profile picture"
                : "Just a few more details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {onboardingStep === 1 && (
              <>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-[#C7B1C2]">
                      <AvatarImage
                        src={profileData.profilePhoto || ""}
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-[#875A7B] text-white text-2xl">
                        {profileData.name ? profileData.name.split(" ").map((n) => n[0]).join("") : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute -bottom-2 -right-2 bg-[#F06EAA] hover:bg-[#E85D9A] text-white rounded-full p-2 cursor-pointer transition-colors">
                      <Upload size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Click the upload icon to add your photo
                  </p>
                </div>
              </>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className={profileData.name ? "" : "border-red-500"}
                  />
                  {!profileData.name && (
                    <p className="text-sm text-red-500 mt-1">Name is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="Choose a unique username"
                    required
                    className={profileData.username ? "" : "border-red-500"}
                  />
                  {!profileData.username && (
                    <p className="text-sm text-red-500 mt-1">Username is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="City, State/Country"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={profileData.tagline}
                    onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
                    placeholder="A brief description about yourself"
                  />
                </div>

                {/* Offered Skills */}
                <div>
                  <Label>Offered Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newOfferedSkill.name}
                      onChange={(e) => setNewOfferedSkill({ ...newOfferedSkill, name: e.target.value })}
                      placeholder="Skill name"
                      className="flex-1"
                    />
                    <Select
                      value={newOfferedSkill.level}
                      onValueChange={(value) => setNewOfferedSkill({ ...newOfferedSkill, level: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="EXPERT">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={addOfferedSkill}
                      size="sm"
                      className="bg-[#875A7B] hover:bg-[#714B67]"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.offeredSkills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        <span>{skill.name} ({skill.level})</span>
                        <button
                          type="button"
                          onClick={() => removeOfferedSkill(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {profileData.offeredSkills.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">At least one offered skill is required</p>
                  )}
                </div>

                {/* Wanted Skills */}
                <div>
                  <Label>Wanted Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newWantedSkill}
                      onChange={(e) => setNewWantedSkill(e.target.value)}
                      placeholder="Skill name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addWantedSkill}
                      size="sm"
                      className="bg-[#875A7B] hover:bg-[#714B67]"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.wantedSkills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeWantedSkill(index)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  {profileData.wantedSkills.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">At least one wanted skill is required</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={profileData.availability}
                    onValueChange={(value) => setProfileData({ ...profileData, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                      <SelectItem value="WEEKDAYS">Weekdays</SelectItem>
                      <SelectItem value="WEEKENDS">Weekends</SelectItem>
                      <SelectItem value="EVENINGS">Evenings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-medium">Make Profile Public</Label>
                    <p className="text-sm text-gray-600">Allow others to discover your profile</p>
                  </div>
                  <Switch
                    checked={profileData.isPublic}
                    onCheckedChange={(checked) => setProfileData({ ...profileData, isPublic: checked })}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleSignupSubmit}
              className="w-full bg-[#875A7B] hover:bg-[#714B67] text-white"
              disabled={registerMutation.isLoading}
            >
              {onboardingStep === 2
                ? registerMutation.isLoading
                  ? "Creating Account..."
                  : "Complete Setup"
                : "Continue"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#875A7B] to-[#F06EAA] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Illustration Side */}
        <div className="hidden md:block text-center text-white">
          <div className="mb-8">
            <Users size={120} className="mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl font-bold mb-4">SkillSwap</h1>
            <p className="text-xl opacity-90 mb-6">
              Exchange skills, build connections, grow together
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <div className="text-center">
                <RefreshCw size={24} className="mx-auto mb-2" />
                <p>Exchange Skills</p>
              </div>
              <div className="text-center">
                <Users size={24} className="mx-auto mb-2" />
                <p>Build Network</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login/Signup Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#875A7B]">Welcome to SkillSwap</CardTitle>
            <CardDescription>Connect and exchange skills with amazing people</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email or Username</Label>
                    <Input
                      id="login-email"
                      placeholder="Enter your email or username"
                      value={loginData.emailOrUsername}
                      onChange={(e) =>
                        setLoginData({ ...loginData, emailOrUsername: e.target.value })
                      }
                      required
                      className={loginData.emailOrUsername ? "" : "border-red-500"}
                    />
                    {!loginData.emailOrUsername && (
                      <p className="text-sm text-red-500 mt-1">Email or Username is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                      className={loginData.password ? "" : "border-red-500"}
                    />
                    {!loginData.password && (
                      <p className="text-sm text-red-500 mt-1">Password is required</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#875A7B] hover:bg-[#714B67] text-white"
                    disabled={loginMutation.isLoading}
                  >
                    {loginMutation.isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("Google login not implemented")}
                >
                  Continue with Google
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                      className={profileData.email ? "" : "border-red-500"}
                    />
                    {!profileData.email && (
                      <p className="text-sm text-red-500 mt-1">Email is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={profileData.password}
                      onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                      required
                      className={profileData.password ? "" : "border-red-500"}
                    />
                    {!profileData.password && (
                      <p className="text-sm text-red-500 mt-1">Password is required</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#875A7B] hover:bg-[#714B67] text-white"
                    disabled={registerMutation.isLoading}
                  >
                    {registerMutation.isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("Google login not implemented")}
                >
                  Continue with Google
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;