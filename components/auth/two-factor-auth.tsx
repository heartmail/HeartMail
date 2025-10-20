'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Shield, Check, X, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface TwoFactorAuthProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function TwoFactorAuth({ isOpen, onClose, onSuccess }: TwoFactorAuthProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEnable2FA = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Enable 2FA using Supabase's built-in MFA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      })

      if (error) {
        throw error
      }

      if (data) {
        setQrCode(data.qr_code || '')
        setSecret(data.secret || '')
        setStep('verify')
        toast.success('2FA setup initiated! Please scan the QR code with your authenticator app.')
      }
    } catch (error: any) {
      console.error('Error enabling 2FA:', error)
      setError(error.message || 'Failed to enable 2FA')
      toast.error('Failed to enable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Verify the 2FA setup
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: secret, // This should be the factor ID from enrollment
        code: verificationCode
      })

      if (error) {
        throw error
      }

      if (data) {
        toast.success('2FA enabled successfully!')
        onSuccess?.()
        handleClose()
      }
    } catch (error: any) {
      console.error('Error verifying 2FA:', error)
      setError(error.message || 'Invalid verification code')
      toast.error('Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Get user's factors
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
      
      if (factorsError) {
        throw factorsError
      }

      // Find the TOTP factor
      const totpFactor = factors?.totp?.[0]
      if (!totpFactor) {
        throw new Error('No 2FA factor found')
      }

      // Unenroll the factor
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id
      })

      if (unenrollError) {
        throw unenrollError
      }

      toast.success('2FA disabled successfully!')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error disabling 2FA:', error)
      setError(error.message || 'Failed to disable 2FA')
      toast.error('Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('setup')
    setQrCode('')
    setSecret('')
    setVerificationCode('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-heartmail-pink" />
            <span>Two-Factor Authentication</span>
          </DialogTitle>
          <DialogDescription>
            {step === 'setup' 
              ? 'Enable 2FA to add an extra layer of security to your account.'
              : 'Scan the QR code with your authenticator app and enter the verification code.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'setup' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-heartmail-pink/10 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-heartmail-pink" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Enable Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">
                  You'll need an authenticator app like Google Authenticator or Authy.
                </p>
              </div>
            </div>
          )}

          {step === 'verify' && qrCode && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Scan this QR code with your authenticator app
                </p>
              </div>

              <div>
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          {step === 'setup' && (
            <Button
              onClick={handleEnable2FA}
              disabled={loading}
              className="bg-heartmail-pink hover:bg-pink-600"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Setting up...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Enable 2FA
                </>
              )}
            </Button>
          )}

          {step === 'verify' && (
            <Button
              onClick={handleVerify2FA}
              disabled={loading || !verificationCode.trim()}
              className="bg-heartmail-pink hover:bg-pink-600"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Verify & Enable
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
