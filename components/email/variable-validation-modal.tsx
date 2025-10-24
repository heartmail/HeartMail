'use client'

import { useState } from 'react'
import { AlertTriangle, X, Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface VariableValidationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  unreplacedVariables: string[]
  emailContent: string
}

export default function VariableValidationModal({
  isOpen,
  onClose,
  onConfirm,
  unreplacedVariables,
  emailContent
}: VariableValidationModalProps) {
  const [showPreview, setShowPreview] = useState(false)

  const getVariableExamples = () => {
    if (!unreplacedVariables || unreplacedVariables.length === 0) {
      return []
    }
    return unreplacedVariables.map(variable => {
      const examples = {
        'first_name': 'John',
        'last_name': 'Smith', 
        'full_name': 'John Smith',
        'email': 'john@example.com',
        'relationship': 'son',
        'nickname': 'Johnny',
        'favorite_color': 'blue',
        'anniversary': 'June 15th',
        'age': '25',
        'hobby': 'gardening'
      }
      
      return {
        variable,
        example: examples[variable as keyof typeof examples] || 'your_value'
      }
    })
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Variables Not Replaced</DialogTitle>
              <DialogDescription>
                Your email still contains variables that haven't been filled in with recipient information.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-orange-900 mb-2">
                  What does this mean?
                </h4>
                <p className="text-sm text-orange-800">
                  Variables like {'{{first_name}}'} are placeholders that should be automatically replaced 
                  with your recipient's information. If they're still showing, it means the recipient 
                  doesn't have that information stored in their profile.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Unreplaced Variables:</h4>
            <div className="space-y-2">
              {getVariableExamples().map(({ variable, example }) => (
                <div key={variable} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                    {'{{' + variable + '}}'}
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className="text-sm text-gray-600">
                    Will show as "{example}" if recipient has this info
                  </span>
                </div>
              ))}
            </div>
          </div>

          {showPreview && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Email Preview:</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {emailContent}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Mail className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Email Preview
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  How to fix this:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Go to Recipients page and add the missing information</li>
                  <li>• Or edit the email to remove the variables</li>
                  <li>• Or send as-is (variables will show in the email)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Send Anyway
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
