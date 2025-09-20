import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getUnauthorizedReason, isUnauthorizedError } from "@/lib/authUtils";

export default function Learning() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/user/enrollments"],
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest("POST", `/api/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      toast({
        title: "Enrollment Successful",
        description: "You've been enrolled in the course!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        const reason = getUnauthorizedReason(error);
        toast({
          title: reason === 'token_expired' ? 'Session abgelaufen' : 'Keine Berechtigung',
          description: reason === 'token_expired'
            ? 'Bitte melde dich erneut an, um Kurse zu belegen.'
            : 'Diese Aktion erfordert eine aktive Anmeldung.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: "Enrollment Failed",
        description: "Unable to enroll in course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "all", label: "All Categories", icon: "fas fa-th-large" },
    { value: "sustainability", label: "Sustainability", icon: "fas fa-leaf" },
    { value: "culture", label: "Culture", icon: "fas fa-palette" },
    { value: "technology", label: "Technology", icon: "fas fa-laptop-code" },
    { value: "arts", label: "Arts", icon: "fas fa-paint-brush" },
  ];

  const levels = [
    { value: "beginner", label: "Beginner", color: "bg-secondary" },
    { value: "intermediate", label: "Intermediate", color: "bg-accent" },
    { value: "advanced", label: "Advanced", color: "bg-primary" },
  ];

  const filteredCourses = (courses || []).filter((course: any) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const enrolledCourseIds = new Set((enrollments || []).map((e: any) => e.courseId));

  if (coursesLoading || enrollmentsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-muted h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="learning-page">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Learning Hub
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Master sustainable technologies, cultural heritage, and digital skills
        </p>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses" data-testid="tab-courses">Available Courses</TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">My Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                data-testid="input-search-courses"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  data-testid={`button-filter-${category.value}`}
                >
                  <i className={`${category.icon} mr-2`}></i>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="section-courses-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course: any) => (
                <Card key={course.id} className="afro-card" data-testid={`course-card-${course.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-serif" data-testid={`text-course-title-${course.id}`}>
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" className="capitalize" data-testid={`badge-course-category-${course.id}`}>
                            {course.category}
                          </Badge>
                          {levels.find(l => l.value === course.level) && (
                            <Badge 
                              variant="outline" 
                              className={`${levels.find(l => l.value === course.level)?.color} text-white border-none`}
                              data-testid={`badge-course-level-${course.id}`}
                            >
                              {course.level}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="cultural-icon">
                        <i className="fas fa-graduation-cap"></i>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4" data-testid={`text-course-description-${course.id}`}>
                      {course.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center">
                        <i className="fas fa-clock mr-1"></i>
                        {course.duration ? `${course.duration} hours` : "Self-paced"}
                      </span>
                      <span className="flex items-center">
                        <i className="fas fa-euro-sign mr-1"></i>
                        {course.price > 0 ? `€${course.price}` : "Free"}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => enrollMutation.mutate(course.id)}
                      disabled={enrollMutation.isPending || enrolledCourseIds.has(course.id)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid={`button-enroll-${course.id}`}
                    >
                      {enrollMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Enrolling...
                        </>
                      ) : enrolledCourseIds.has(course.id) ? (
                        <>
                          <i className="fas fa-check mr-2"></i>
                          Enrolled
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus mr-2"></i>
                          Enroll Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-courses">
                <div className="cultural-icon mx-auto mb-4">
                  <i className="fas fa-book-open text-2xl"></i>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No Courses Found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCategory !== "all" 
                    ? "Try adjusting your search criteria"
                    : "No courses are currently available"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="section-my-progress">
            {enrollments && enrollments.length > 0 ? (
              enrollments.map((enrollment: any) => (
                <Card key={enrollment.id} className="afro-card" data-testid={`enrollment-card-${enrollment.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg font-serif" data-testid={`text-enrollment-title-${enrollment.id}`}>
                      {enrollment.course?.title || "Course"}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="capitalize">
                        {enrollment.course?.category || "general"}
                      </Badge>
                      <span className="text-sm text-muted-foreground" data-testid={`text-enrollment-progress-${enrollment.id}`}>
                        {enrollment.progress || 0}% Complete
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <Progress 
                        value={enrollment.progress || 0} 
                        className="w-full"
                        data-testid={`progress-enrollment-${enrollment.id}`}
                      />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                        {enrollment.completedAt && (
                          <span className="text-secondary font-medium">
                            <i className="fas fa-check-circle mr-1"></i>
                            Completed
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full"
                        data-testid={`button-continue-${enrollment.id}`}
                      >
                        <i className="fas fa-play mr-2"></i>
                        Continue Learning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-enrollments">
                <div className="cultural-icon mx-auto mb-4">
                  <i className="fas fa-graduation-cap text-2xl"></i>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No Enrolled Courses
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start your learning journey by enrolling in a course
                </p>
                <Button 
                  onClick={() => document.querySelector('[data-testid="tab-courses"]')?.click()}
                  data-testid="button-browse-courses"
                >
                  <i className="fas fa-search mr-2"></i>
                  Browse Courses
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
