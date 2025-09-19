import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  role: z.string(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  communityUpdates: z.boolean(),
  eventReminders: z.boolean(),
  projectUpdates: z.boolean(),
  messageNotifications: z.boolean(),
});

const privacySchema = z.object({
  profileVisibility: z.string(),
  showEmail: z.boolean(),
  showLocation: z.boolean(),
  allowDirectMessages: z.boolean(),
  allowEventInvitations: z.boolean(),
});

export default function Settings() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      role: user?.role || "visitor",
      skills: user?.skills || [],
      interests: user?.interests || [],
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      communityUpdates: true,
      eventReminders: true,
      projectUpdates: true,
      messageNotifications: true,
    },
  });

  const privacyForm = useForm<z.infer<typeof privacySchema>>({
    resolver: zodResolver(privacySchema),
    defaultValues: {
      profileVisibility: "community",
      showEmail: false,
      showLocation: true,
      allowDirectMessages: true,
      allowEventInvitations: true,
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      return await apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onNotificationSubmit = (data: z.infer<typeof notificationSchema>) => {
    // TODO: Implement notification preferences API call
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been saved.",
    });
  };

  const onPrivacySubmit = (data: z.infer<typeof privacySchema>) => {
    // TODO: Implement privacy settings API call
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy settings have been successfully updated.",
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const currentSkills = profileForm.getValues("skills") || [];
      if (!currentSkills.includes(newSkill.trim())) {
        profileForm.setValue("skills", [...currentSkills, newSkill.trim()]);
        setNewSkill("");
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const currentSkills = profileForm.getValues("skills") || [];
    profileForm.setValue("skills", currentSkills.filter(skill => skill !== skillToRemove));
  };

  const addInterest = () => {
    if (newInterest.trim()) {
      const currentInterests = profileForm.getValues("interests") || [];
      if (!currentInterests.includes(newInterest.trim())) {
        profileForm.setValue("interests", [...currentInterests, newInterest.trim()]);
        setNewInterest("");
      }
    }
  };

  const removeInterest = (interestToRemove: string) => {
    const currentInterests = profileForm.getValues("interests") || [];
    profileForm.setValue("interests", currentInterests.filter(interest => interest !== interestToRemove));
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="p-6" data-testid="settings-page">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Settings
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Manage your account, preferences, and privacy settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy" data-testid="tab-privacy">Privacy</TabsTrigger>
          <TabsTrigger value="account" data-testid="tab-account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card data-testid="section-profile-settings">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Profile Information</CardTitle>
              <p className="text-muted-foreground">Update your personal information and village role</p>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  {/* Profile Picture Upload */}
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <img 
                        src={previewUrl || user?.profileImageUrl || "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-border"
                        data-testid="img-profile-preview"
                      />
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProfileImage(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPreviewUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="mb-2"
                        data-testid="input-profile-picture"
                      />
                      <p className="text-sm text-muted-foreground">
                        Upload a new profile picture (max 5MB)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={profileForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={profileForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Village Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-role">
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="visitor">Visitor</SelectItem>
                            <SelectItem value="resident">Resident</SelectItem>
                            <SelectItem value="educator">Educator</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="bisafoo_circle">Bisafoo Circle</SelectItem>
                            <SelectItem value="golden_circle">Golden Circle</SelectItem>
                            <SelectItem value="founder">Founder</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself..." 
                            {...field} 
                            data-testid="textarea-bio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Skills Section */}
                  <div className="space-y-3">
                    <FormLabel>Skills</FormLabel>
                    <div className="flex space-x-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                        data-testid="input-add-skill"
                      />
                      <Button type="button" onClick={addSkill} variant="outline" data-testid="button-add-skill">
                        <i className="fas fa-plus"></i>
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2" data-testid="section-skills">
                      {profileForm.watch("skills")?.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-xs hover:text-destructive"
                            data-testid={`button-remove-skill-${index}`}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Interests Section */}
                  <div className="space-y-3">
                    <FormLabel>Interests</FormLabel>
                    <div className="flex space-x-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest..."
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                        data-testid="input-add-interest"
                      />
                      <Button type="button" onClick={addInterest} variant="outline" data-testid="button-add-interest">
                        <i className="fas fa-plus"></i>
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2" data-testid="section-interests">
                      {profileForm.watch("interests")?.map((interest, index) => (
                        <Badge key={index} variant="outline" className="flex items-center space-x-1">
                          <span>{interest}</span>
                          <button
                            type="button"
                            onClick={() => removeInterest(interest)}
                            className="ml-1 text-xs hover:text-destructive"
                            data-testid={`button-remove-interest-${index}`}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-save-profile">
                    <i className="fas fa-save mr-2"></i>
                    Save Profile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card data-testid="section-notification-settings">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Notification Preferences</CardTitle>
              <p className="text-muted-foreground">Choose how you want to be notified about village activities</p>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Email Notifications</FormLabel>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-email-notifications" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={notificationForm.control}
                    name="communityUpdates"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Community Updates</FormLabel>
                          <p className="text-sm text-muted-foreground">News and announcements from the village</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-community-updates" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="eventReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Event Reminders</FormLabel>
                          <p className="text-sm text-muted-foreground">Reminders for events you've registered for</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-event-reminders" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="projectUpdates"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Project Updates</FormLabel>
                          <p className="text-sm text-muted-foreground">Updates on projects you support or follow</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-project-updates" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="messageNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Message Notifications</FormLabel>
                          <p className="text-sm text-muted-foreground">Notifications for new messages</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-message-notifications" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-save-notifications">
                    <i className="fas fa-save mr-2"></i>
                    Save Preferences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card data-testid="section-privacy-settings">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Privacy Settings</CardTitle>
              <p className="text-muted-foreground">Control who can see your information and contact you</p>
            </CardHeader>
            <CardContent>
              <Form {...privacyForm}>
                <form onSubmit={privacyForm.handleSubmit(onPrivacySubmit)} className="space-y-6">
                  <FormField
                    control={privacyForm.control}
                    name="profileVisibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Visibility</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-profile-visibility">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">Public - Visible to everyone</SelectItem>
                            <SelectItem value="community">Community - Visible to village members</SelectItem>
                            <SelectItem value="private">Private - Only visible to me</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <FormField
                    control={privacyForm.control}
                    name="showEmail"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Show Email Address</FormLabel>
                          <p className="text-sm text-muted-foreground">Allow others to see your email address</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-show-email" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privacyForm.control}
                    name="allowDirectMessages"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Allow Direct Messages</FormLabel>
                          <p className="text-sm text-muted-foreground">Let other members send you private messages</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-allow-messages" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privacyForm.control}
                    name="allowEventInvitations"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div>
                          <FormLabel>Allow Event Invitations</FormLabel>
                          <p className="text-sm text-muted-foreground">Allow others to invite you to events</p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} data-testid="switch-allow-invitations" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-save-privacy">
                    <i className="fas fa-save mr-2"></i>
                    Save Privacy Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card data-testid="section-account-settings">
            <CardHeader>
              <CardTitle className="text-xl font-serif">Account Management</CardTitle>
              <p className="text-muted-foreground">Manage your account settings and data</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Account Information</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</p>
                    <p>Last updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Unknown"}</p>
                    <p>User ID: {user?.id || "Unknown"}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-foreground mb-2">Data Export</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a copy of your data including profile information, messages, and activity.
                  </p>
                  <Button variant="outline" data-testid="button-export-data">
                    <i className="fas fa-download mr-2"></i>
                    Export My Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-foreground mb-2">Sign Out</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign out of your account on this device.
                  </p>
                  <Button variant="outline" onClick={handleLogout} data-testid="button-sign-out">
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Sign Out
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" data-testid="button-delete-account">
                    <i className="fas fa-trash mr-2"></i>
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
