import { createClient } from '@supabase/supabase-js'
import type { Request, Response, NextFunction } from 'express'
import { storage } from './storage'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables on server')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const verifySupabaseAuth = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' })
    }

    // Sync user with our database
    await storage.upsertUser({
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || '',
      profileImageUrl: user.user_metadata?.avatar_url || '',
    })

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.first_name,
      lastName: user.user_metadata?.last_name,
      profileImageUrl: user.user_metadata?.avatar_url,
    }

    next()
  } catch (error) {
    console.error('Supabase auth error:', error)
    return res.status(401).json({ message: 'Unauthorized - Auth verification failed' })
  }
}