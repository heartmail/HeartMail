'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Shield, Check, X, AlertTriangle, Loader2, QrCode, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface TwoFactorAuthProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  onDisable?: () => void
  is2FAEnabled: boolean
}

export default function TwoFactorAuth({ isOpen, onClose, onSuccess, onDisable, is2FAEnabled }: TwoFactorAuthProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'disable'>('setup')
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [factorId, setFactorId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setStep(is2FAEnabled ? 'disable' : 'setup')
      setQrCode('')
      setSecret('')
      setVerificationCode('')
      setError('')
      setFactorId(null)
    }
  }, [isOpen, is2FAEnabled])

  const handleEnroll = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      })

      if (error) {
        throw error
      }

      if (data) {
        setQrCode(data.qr_code || '')
        setSecret(data.secret || '')
        setFactorId(data.id)
        setStep('verify')
        toast.success('Scan the QR code with your authenticator app')
      }
    } catch (error: any) {
      console.error('Error enrolling 2FA:', error)
      setError(error.message || 'Failed to enable 2FA')
      toast.error('Failed to enable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      if (!factorId) {
        throw new Error('No 2FA factor found. Please try again.')
      }

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factorId,
        code: verificationCode
      })

      if (error) {
        throw error
      }

      toast.success('Two-Factor Authentication enabled successfully!')
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Error verifying 2FA:', error)
      setError(error.message || 'Invalid verification code')
      toast.error('Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data: { factors }, error: fetchError } = await supabase.auth.mfa.getFactors()
      if (fetchError) {
        throw fetchError
      }

      const totpFactor = factors.find(factor => 
        factor.factor_type === 'totp' && factor.status === 'verified'
      )

      if (!totpFactor) {
        throw new Error('No active 2FA factor found to disable')
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id
      })

      if (error) {
        throw error
      }

      toast.success('Two-Factor Authentication disabled successfully!')
      onDisable?.()
      onClose()
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
    setFactorId(null)
    onClose()
  }

  const renderContent = () => {
    if (is2FAEnabled && step === 'disable') {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-2xl">
              <Shield className="h-6 w-6 text-red-500" />
              <span>Disable Two-Factor Authentication</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disable 2FA? This will reduce the security of your account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-gray-700">
              Disabling 2FA will remove an important layer of security.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none py-3 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
              disabled={loading}
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDisable}
              className="flex-1 sm:flex-none py-3 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 mt-2 sm:mt-0"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Disabling...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Disable 2FA
                </>
              )}
            </Button>
          </DialogFooter>
        </>
      )
    }

    // Setup and Verify steps
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Shield className="h-6 w-6 text-heartmail-pink" />
            <span>Two-Factor Authentication</span>
          </DialogTitle>
          <DialogDescription>
            {step === 'setup'
              ? 'Add an extra layer of security to your account by enabling 2FA.'
              : 'Scan the QR code with your authenticator app and enter the verification code.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {step === 'setup' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-heartmail-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-heartmail-pink" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Enable Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">
                You'll need an authenticator app like Google Authenticator or Authy.
              </p>
            </div>
          )}

          {step === 'verify' && (
            <>
              <div className="flex flex-col items-center justify-center space-y-4">
                {qrCode && (
                  <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code with your authenticator app (e.g., Google Authenticator, Authy).
                </p>
                {secret && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Or manually enter this secret:</p>
                    <p className="text-xs text-gray-800 font-mono bg-gray-100 p-2 rounded break-all">
                      {secret}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 sm:flex-none py-3 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </Button>
          {step === 'setup' && (
            <Button
              type="button"
              onClick={handleEnroll}
              className="flex-1 sm:flex-none py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 mt-2 sm:mt-0"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <QrCode className="h-5 w-5 mr-2" />
                  Enroll 2FA
                </>
              )}
            </Button>
          )}
          {step === 'verify' && (
            <Button
              type="button"
              onClick={handleVerify}
              className="flex-1 sm:flex-none py-3 text-lg font-semibold bg-gradient-to-r from-heartmail-pink to-pink-500 hover:from-pink-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 mt-2 sm:mt-0"
              disabled={loading || !verificationCode.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Verify & Enable
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}