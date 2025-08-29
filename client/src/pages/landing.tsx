import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20"></div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary via-accent to-secondary rounded-2xl flex items-center justify-center shadow-xl">
                <i className="fas fa-leaf text-white text-3xl"></i>
              </div>
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
              Welcome to <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">Afro Village</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              A sustainable, off-grid inspired eco-village and cultural center where sustainable living, 
              African diaspora culture, creativity and education come together to shape the future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin}
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold"
                data-testid="button-login"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Join Our Community
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary/5 px-8 py-4 text-lg font-semibold"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Vision
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            More than a place – a movement where sustainable living, African culture and modern technology merge
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 border-border hover:border-primary/50 transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-users text-secondary text-xl"></i>
              </div>
              <CardTitle className="text-xl">Community Building</CardTitle>
              <CardDescription>
                Connect with like-minded individuals in a sustainable living environment
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border hover:border-accent/50 transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-graduation-cap text-accent text-xl"></i>
              </div>
              <CardTitle className="text-xl">Learning & Growth</CardTitle>
              <CardDescription>
                Master sustainable technologies, cultural heritage, and digital skills
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border hover:border-primary/50 transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-palette text-primary text-xl"></i>
              </div>
              <CardTitle className="text-xl">Cultural Exchange</CardTitle>
              <CardDescription>
                Celebrate and preserve African diaspora culture through arts and music
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border hover:border-secondary/50 transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-solar-panel text-secondary text-xl"></i>
              </div>
              <CardTitle className="text-xl">Off-Grid Living</CardTitle>
              <CardDescription>
                Experience sustainable energy, water conservation, and permaculture
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border hover:border-accent/50 transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-calendar-alt text-accent text-xl"></i>
              </div>
              <CardTitle className="text-xl">Events & Retreats</CardTitle>
              <CardDescription>
                Join workshops, festivals, and retreats in our vibrant community
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-border hover:border-primary/50 transition-colors hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <i className="fas fa-hand-holding-heart text-primary text-xl"></i>
              </div>
              <CardTitle className="text-xl">Community Projects</CardTitle>
              <CardDescription>
                Support and participate in projects that shape our shared future
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary via-accent to-secondary">
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join our community and be part of a sustainable future that celebrates culture, 
            innovation, and collective growth.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90 px-8 py-4 text-lg font-semibold"
            data-testid="button-join-community"
          >
            <i className="fas fa-arrow-right mr-2"></i>
            Join Afro Village
          </Button>
        </div>
      </div>
    </div>
  );
}
