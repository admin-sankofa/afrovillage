import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginForm() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, isLoading, error } = useSupabaseAuth()
  const { toast } = useToast()

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    showPassword: false,
  })

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: 'Felder ausfüllen',
        description: 'Bitte E-Mail und Passwort eingeben.',
        variant: 'destructive',
      })
      return
    }

    const { error } = await signInWithEmail(loginForm.email, loginForm.password)
    
    if (error) {
      toast({
        title: 'Login fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Willkommen zurück!',
        description: 'Sie wurden erfolgreich angemeldet.',
      })
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.password) {
      toast({
        title: 'Felder ausfüllen',
        description: 'Bitte alle Felder ausfüllen.',
        variant: 'destructive',
      })
      return
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast({
        title: 'Passwörter stimmen nicht überein',
        description: 'Bitte überprüfen Sie Ihre Passwort-Eingabe.',
        variant: 'destructive',
      })
      return
    }

    const { error } = await signUpWithEmail(
      signupForm.email, 
      signupForm.password, 
      signupForm.firstName, 
      signupForm.lastName
    )
    
    if (error) {
      toast({
        title: 'Registrierung fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Registrierung erfolgreich!',
        description: 'Bitte überprüfen Sie Ihre E-Mail zur Bestätigung.',
      })
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle()
    
    if (error) {
      toast({
        title: 'Google Login fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary via-accent to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <i className="fas fa-leaf text-white text-2xl"></i>
            </div>
          </div>
          <CardTitle className="text-2xl font-serif">Afro Village</CardTitle>
          <CardDescription>
            Willkommen in unserer nachhaltigen Gemeinschaft
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Anmelden</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Registrieren</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-Mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ihre@email.com"
                    data-testid="input-login-email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Passwort</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={loginForm.showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      data-testid="input-login-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setLoginForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    >
                      {loginForm.showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {error && (
                  <div className="text-sm text-destructive text-center">
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-login-submit"
                >
                  {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="signup-firstname">Vorname</Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      value={signupForm.firstName}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Max"
                      data-testid="input-signup-firstname"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-lastname">Nachname</Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      value={signupForm.lastName}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Mustermann"
                      data-testid="input-signup-lastname"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-Mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="ihre@email.com"
                    data-testid="input-signup-email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Passwort</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={signupForm.showPassword ? 'text' : 'password'}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      data-testid="input-signup-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setSignupForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    >
                      {signupForm.showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Passwort bestätigen</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    data-testid="input-signup-confirm"
                    required
                  />
                </div>
                
                {error && (
                  <div className="text-sm text-destructive text-center">
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-signup-submit"
                >
                  {isLoading ? 'Wird registriert...' : 'Registrieren'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Oder</span>
              </div>
            </div>
            
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full mt-4"
              disabled={isLoading}
              data-testid="button-google-login"
            >
              <i className="fab fa-google mr-2 text-red-500"></i>
              Mit Google anmelden
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}