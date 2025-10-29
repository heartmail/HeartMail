import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { inngest } from '@/lib/inngest'

export async function DELETE(request: NextRequest) {
  try {
    const { emailId } = await request.json()

    if (!emailId) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // First get the scheduled email info for activity logging and Inngest cancellation
    const { data: scheduledEmail, error: fetchError } = await supabase
      .from('scheduled_emails')
      .select('user_id, title, scheduled_date, status, recipient_id')
      .eq('id', emailId)
      .single()

    if (fetchError) {
      console.error('Error fetching scheduled email:', fetchError)
      return NextResponse.json(
        { error: 'Scheduled email not found' },
        { status: 404 }
      )
    }
    
    // Fetch recipient info separately to avoid relationship ambiguity
    let recipientInfo = null
    if (scheduledEmail.recipient_id) {
      const { data: recipient } = await supabase
        .from('recipients')
        .select('first_name, last_name, email')
        .eq('id', scheduledEmail.recipient_id)
        .single()
      
      if (recipient) {
        recipientInfo = recipient
      }
    }

    // Only allow deletion of scheduled emails (not sent ones)
    if (scheduledEmail.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot delete sent emails' },
        { status: 400 }
      )
    }

    // Cancel any pending Inngest events for this email
    try {
      // Cancel any scheduled events for this email
      await inngest.send({
        name: 'email/cancel',
        data: {
          scheduledEmailId: emailId,
          userId: scheduledEmail.user_id
        }
      })
    } catch (inngestError) {
      console.error('Failed to cancel Inngest event:', inngestError)
      // Continue with deletion even if Inngest cancellation fails
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('scheduled_emails')
      .delete()
      .eq('id', emailId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete scheduled email' },
        { status: 500 }
      )
    }

    // Log activity
    try {
      let recipientName = 'Unknown'
      if (recipientInfo) {
        recipientName = `${recipientInfo.first_name} ${recipientInfo.last_name || ''}`.trim()
      }
      
      // Import the activity logging function
      const { logScheduledEmailDeleted } = await import('@/lib/activity-history')
      await logScheduledEmailDeleted(
        scheduledEmail.user_id,
        scheduledEmail.title,
        recipientName,
        scheduledEmail.scheduled_date
      )
    } catch (activityError) {
      console.error('Failed to log scheduled email deletion activity:', activityError)
      // Don't fail the deletion if activity logging fails
    }

    return NextResponse.json({ 
      message: 'Scheduled email deleted successfully',
      cancelled: true
    })

  } catch (error) {
    console.error('Error deleting scheduled email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
