'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Shield, CreditCard, Palette, Globe, Save, Eye, EyeOff, Heart, LogOut, Mail, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
// DashboardLayout is already applied through the main layout
import BillingSettings from '@/components/billing/billing-settings'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/theme-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUserProfile, upsertUserProfile, UserProfile } from '@/lib/profile'
import { getUserSettings, upsertUserSettings, UserSettings } from '@/lib/settings'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('security')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Email change modal state
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailChangeLoading, setEmailChangeLoading] = useState(false)
  const [emailChangeMessage, setEmailChangeMessage] = useState('')
  const [emailChangeError, setEmailChangeError] = useState('')
  
  // Password reset modal state
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false)
  const [passwordResetLoading, setPasswordResetLoading] = useState(false)
  const [passwordResetMessage, setPasswordResetMessage] = useState('')
  const [passwordResetError, setPasswordResetError] = useState('')
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: true,
    email_delivery_confirmations: true,
    monthly_reports: false,
    weekly_reports: true
  })

  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  // Read tab from URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['security', 'billing', 'preferences'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const [profileData, settingsData] = await Promise.all([
        getUserProfile(user!.id),
        getUserSettings(user!.id)
      ])
      
      if (profileData) {
        setProfile(profileData)
        setProfileForm({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          email: profileData.email || user!.email || ''
        })
      } else {
        // Initialize with user email if no profile exists
        setProfileForm({
          first_name: '',
          last_name: '',
          email: user!.email || ''
        })
      }
      
      if (settingsData) {
        setSettings(settingsData)
        setNotifications({
          email_notifications: settingsData.email_notifications,
          push_notifications: settingsData.push_notifications,
          email_delivery_confirmations: settingsData.email_delivery_confirmations,
          monthly_reports: settingsData.monthly_reports,
          weekly_reports: settingsData.weekly_reports
        })
      }

    } catch (error) {
      console.error('Error loading user data:', error)
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    try {
      setSaving(true)
      await upsertUserProfile(user.id, profileForm)
      toast.success('Profile updated successfully')
      await loadUserData() // Reload data
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user) return
    
    try {
      setSaving(true)
      await upsertUserSettings(user.id, notifications)
      toast.success('Settings updated successfully')
      await loadUserData() // Reload data
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  // Email change handler
  const handleEmailChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailChangeLoading(true)
    setEmailChangeMessage('')
    setEmailChangeError('')

    if (!newEmail) {
      setEmailChangeError('Please enter a new email address.')
      setEmailChangeLoading(false)
      return
    }

    try {
      // First update the user's email in Supabase
      const { error: updateError } = await supabase.auth.updateUser({ email: newEmail })

      if (updateError) {
        setEmailChangeError(updateError.message)
        setEmailChangeLoading(false)
        return
      }

      // Then send our custom branded email
      const response = await fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newEmail,
          type: 'email_change',
          confirmationUrl: `${window.location.origin}/auth/update-password`
        })
      })

      if (response.ok) {
        setEmailChangeMessage('A beautiful verification email has been sent to your new address from support.heartsmail@gmail.com. Please check your inbox to confirm the change.')
        setNewEmail('')
        toast.success('Verification email sent from HeartMail Support!')
      } else {
        setEmailChangeError('Failed to send verification email. Please try again.')
      }
    } catch (err) {
      setEmailChangeError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setEmailChangeLoading(false)
    }
  }

  // Password reset handler
  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordResetLoading(true)
    setPasswordResetMessage('')
    setPasswordResetError('')

    try {
      // Send our custom branded password reset email
      const response = await fetch('/api/auth/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email || '',
          type: 'password_reset',
          confirmationUrl: `${window.location.origin}/auth/update-password`
        })
      })

      if (response.ok) {
        setPasswordResetMessage('A beautiful password reset email has been sent to your email address from support.heartsmail@gmail.com. Please check your inbox.')
        toast.success('Password reset email sent from HeartMail Support!')
      } else {
        setPasswordResetError('Failed to send password reset email. Please try again.')
      }
    } catch (err) {
      setPasswordResetError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setPasswordResetLoading(false)
    }
  }

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe }
  ]

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="settings-container">
          {/* Settings Sidebar */}
          <div className="settings-sidebar">
            <nav className="settings-nav">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id)
                    router.push(`/dashboard/settings?tab=${tab.id}`)
                  }}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="settings-main">


            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>Security Settings</h2>
                <p className="section-description">Manage your account security and privacy settings.</p>
                
                <div className="security-settings">
                  <div className="security-item">
                    <div className="security-info">
                      <h3>Email Address</h3>
                      <p>Change your email address for account notifications</p>
                      <p className="text-sm text-gray-500">Current: {user?.email}</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setShowEmailChangeModal(true)
                        setEmailChangeMessage('')
                        setEmailChangeError('')
                        setNewEmail('')
                      }}
                      className="btn-smooth border-gray-300 hover:border-heartmail-pink hover:text-heartmail-pink"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Change Email
                    </Button>
                  </div>
                  
                  <div className="security-item">
                    <div className="security-info">
                      <h3>Reset Password</h3>
                      <p>Send a password reset link to your email address</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setShowPasswordResetModal(true)
                        setPasswordResetMessage('')
                        setPasswordResetError('')
                      }}
                      className="btn-smooth border-gray-300 hover:border-heartmail-pink hover:text-heartmail-pink"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                  </div>
                  
                  <div className="security-item opacity-50 pointer-events-none">
                    <div className="security-info">
                      <h3>Two-Factor Authentication (coming soon)</h3>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="btn-smooth cursor-not-allowed"
                      disabled
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Enable 2FA
                    </Button>
                  </div>
                  
                  <div className="security-item">
                    <div className="security-info">
                      <h3>Sign Out</h3>
                      <p>Sign out of your account on this device</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleLogout}
                      className="btn-smooth text-red-600 border-red-300 hover:text-red-700 hover:bg-red-50 hover:border-red-400"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                  
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="settings-section">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2>Billing & Subscription</h2>
                    <p className="section-description">Manage your subscription and billing information.</p>
                  </div>
                  <button 
                    className="flex items-center space-x-2 text-gray-700 hover:text-heartmail-pink transition-colors duration-200 text-left"
                    onClick={() => {
                      // Navigate to the homepage pricing section
                      window.location.href = '/#pricing'
                    }}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>View Pricing</span>
                  </button>
                </div>
                
                <BillingSettings />
              </div>
            )}


            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h2>Preferences</h2>
                <p className="section-description">Customize your HeartMail experience with personal preferences.</p>
                
                <form className="settings-form mb-8">
                  <div className="form-row">
                    <div className="form-group">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input 
                        id="first_name"
                        type="text" 
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        className="form-input"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="form-group">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input 
                        id="last_name"
                        type="text" 
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        className="form-input"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="btn-heartmail"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                <div className="preferences-settings">
                  <div className="preference-group">
                    <h3>Appearance</h3>
                    <div className="theme-options">
                      <label className="theme-option">
                        <input 
                          type="radio" 
                          name="theme" 
                          value="light" 
                          checked={theme === 'light'}
                          onChange={() => setTheme('light')}
                        />
                        <div className="theme-preview light">
                          <div className="theme-header"></div>
                          <div className="theme-content"></div>
                        </div>
                        <span>Light</span>
                      </label>
                      <label className="theme-option">
                        <input 
                          type="radio" 
                          name="theme" 
                          value="dark" 
                          checked={theme === 'dark'}
                          onChange={() => setTheme('dark')}
                        />
                        <div className="theme-preview dark">
                          <div className="theme-header"></div>
                          <div className="theme-content"></div>
                        </div>
                        <span>Dark</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="preference-group">
                    <h3>Language & Region</h3>
                    <div className="preference-item">
                      <label>Language</label>
                      <select className="form-select" disabled>
                        <option value="en" selected>English</option>
                      </select>
                    </div>
                    
                    <div className="preference-item">
                      <label>Time Zone</label>
                      <select className="form-select">
                        <option value="EST" selected>Eastern Time (EST)</option>
                        <option value="PST">Pacific Time (PST)</option>
                        <option value="CST">Central Time (CST)</option>
                        <option value="MST">Mountain Time (MST)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Email Change Modal */}
        <Dialog open={showEmailChangeModal} onOpenChange={setShowEmailChangeModal}>
          <DialogContent 
            className="sm:max-w-[425px]"
            aria-describedby="email-change-description"
          >
            <div id="email-change-description" className="sr-only">
              Update your email address for your HeartMail account.
            </div>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-heartmail-pink" />
                <span>Change Your Email Address</span>
              </DialogTitle>
              <DialogDescription>
                Enter your new email address below. A verification link will be sent to the new address.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEmailChangeRequest} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-email">New Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="new.email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              {emailChangeError && <p className="text-red-500 text-sm">{emailChangeError}</p>}
              {emailChangeMessage && <p className="text-green-600 text-sm">{emailChangeMessage}</p>}
              <DialogFooter className="gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEmailChangeModal(false)} 
                  disabled={emailChangeLoading}
                  className="px-6 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 font-semibold transition-all duration-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={emailChangeLoading} 
                  className="px-6 py-2.5 bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {emailChangeLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Verification'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Password Reset Modal */}
        <Dialog open={showPasswordResetModal} onOpenChange={setShowPasswordResetModal}>
          <DialogContent 
            className="sm:max-w-[425px]"
            aria-describedby="password-reset-description"
          >
            <div id="password-reset-description" className="sr-only">
              Reset your password by entering your current password and new password.
            </div>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5 text-heartmail-pink" />
                <span>Reset Your Password</span>
              </DialogTitle>
              <DialogDescription>
                A password reset link will be sent to your email address: <strong>{user?.email}</strong>
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePasswordResetRequest} className="grid gap-4 py-4">
              {passwordResetError && <p className="text-red-500 text-sm">{passwordResetError}</p>}
              {passwordResetMessage && <p className="text-green-600 text-sm">{passwordResetMessage}</p>}
              <DialogFooter className="gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPasswordResetModal(false)} 
                  disabled={passwordResetLoading}
                  className="px-6 py-2.5 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 font-semibold transition-all duration-200 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={passwordResetLoading} 
                  className="px-6 py-2.5 bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  {passwordResetLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

    </div>
  )
}
