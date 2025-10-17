import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  plan: 'free' | 'family' | 'extended'
}

export interface Template {
  id: string
  title: string
  category: string
  content: string
  isPremium: boolean
  tags: string[]
  description: string
}

export interface Recipient {
  id: string
  name: string
  email: string
  relationship: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  status: 'active' | 'inactive' | 'pending'
}

interface HeartMailStore {
  user: User | null
  templates: Template[]
  recipients: Recipient[]
  isLoading: boolean
  
  // User actions
  setUser: (user: User | null) => void
  updateUserPlan: (plan: User['plan']) => void
  
  // Template actions
  setTemplates: (templates: Template[]) => void
  addTemplate: (template: Template) => void
  updateTemplate: (id: string, template: Partial<Template>) => void
  deleteTemplate: (id: string) => void
  
  // Recipient actions
  setRecipients: (recipients: Recipient[]) => void
  addRecipient: (recipient: Recipient) => void
  updateRecipient: (id: string, recipient: Partial<Recipient>) => void
  deleteRecipient: (id: string) => void
  
  // Loading state
  setLoading: (loading: boolean) => void
}

export const useHeartMailStore = create<HeartMailStore>((set) => ({
  user: null,
  templates: [],
  recipients: [],
  isLoading: false,
  
  setUser: (user) => set({ user }),
  updateUserPlan: (plan) => set((state) => ({
    user: state.user ? { ...state.user, plan } : null
  })),
  
  setTemplates: (templates) => set({ templates }),
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template]
  })),
  updateTemplate: (id, template) => set((state) => ({
    templates: state.templates.map(t => t.id === id ? { ...t, ...template } : t)
  })),
  deleteTemplate: (id) => set((state) => ({
    templates: state.templates.filter(t => t.id !== id)
  })),
  
  setRecipients: (recipients) => set({ recipients }),
  addRecipient: (recipient) => set((state) => ({
    recipients: [...state.recipients, recipient]
  })),
  updateRecipient: (id, recipient) => set((state) => ({
    recipients: state.recipients.map(r => r.id === id ? { ...r, ...recipient } : r)
  })),
  deleteRecipient: (id) => set((state) => ({
    recipients: state.recipients.filter(r => r.id !== id)
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}))
