import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz'

// Comprehensive list of timezones with their IANA names and display names
export const TIMEZONES = [
  // Americas
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/-4' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/-5' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/-6' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/-7' },
  { value: 'America/Anchorage', label: 'Alaska Time (AT)', offset: 'UTC-9/-8' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10' },
  { value: 'America/Toronto', label: 'Toronto (ET)', offset: 'UTC-5/-4' },
  { value: 'America/Vancouver', label: 'Vancouver (PT)', offset: 'UTC-8/-7' },
  { value: 'America/Mexico_City', label: 'Mexico City (CT)', offset: 'UTC-6/-5' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: 'UTC-3' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', offset: 'UTC-3' },
  
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 'UTC+0/+1' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Prague', label: 'Prague (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET/CEST)', offset: 'UTC+1/+2' },
  { value: 'Europe/Athens', label: 'Athens (EET/EEST)', offset: 'UTC+2/+3' },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)', offset: 'UTC+3' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 'UTC+3' },
  
  // Asia
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 'UTC+8' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 'UTC+8' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 'UTC+9' },
  { value: 'Asia/Taipei', label: 'Taipei (CST)', offset: 'UTC+8' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: 'UTC+7' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)', offset: 'UTC+7' },
  { value: 'Asia/Manila', label: 'Manila (PHT)', offset: 'UTC+8' },
  { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (IST)', offset: 'UTC+5:30' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 'UTC+4' },
  { value: 'Asia/Tehran', label: 'Tehran (IRST)', offset: 'UTC+3:30' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)', offset: 'UTC+5' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)', offset: 'UTC+6' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (EET)', offset: 'UTC+2' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', offset: 'UTC+2' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)', offset: 'UTC+1' },
  { value: 'Africa/Casablanca', label: 'Casablanca (WET)', offset: 'UTC+0/+1' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)', offset: 'UTC+3' },
  
  // Australia/Oceania
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 'UTC+10/+11' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)', offset: 'UTC+10/+11' },
  { value: 'Australia/Perth', label: 'Perth (AWST)', offset: 'UTC+8' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)', offset: 'UTC+9:30/+10:30' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)', offset: 'UTC+12/+13' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)', offset: 'UTC+12' },
  
  // UTC and GMT
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC+0' },
  { value: 'GMT', label: 'GMT (Greenwich Mean Time)', offset: 'UTC+0' },
]

// Get timezone by value
export function getTimezoneByValue(value: string) {
  return TIMEZONES.find(tz => tz.value === value)
}

// Get user's current timezone
export function getUserTimezone(): string {
  if (typeof window !== 'undefined') {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }
  return 'UTC'
}

// Convert local time to UTC for storage
export function convertToUTC(date: Date, timezone: string): Date {
  return fromZonedTime(date, timezone)
}

// Convert UTC to local timezone for display
export function convertFromUTC(utcDate: Date, timezone: string): Date {
  return toZonedTime(utcDate, timezone)
}

// Format date in specific timezone
export function formatInTimezone(date: Date, timezone: string, formatString: string = 'PPP p'): string {
  return formatInTimeZone(date, timezone, formatString)
}

// Get current time in timezone
export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone)
}

// Validate timezone
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

// Get timezone offset string
export function getTimezoneOffset(timezone: string): string {
  const now = new Date()
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
  const local = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
  const offset = (local.getTime() - utc.getTime()) / (1000 * 60 * 60)
  
  const sign = offset >= 0 ? '+' : '-'
  const hours = Math.abs(Math.floor(offset))
  const minutes = Math.abs((offset % 1) * 60)
  
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

// Calculate next occurrence for recurring schedules
export function calculateNextOccurrence(
  baseDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly',
  timezone: string
): Date {
  const now = new Date()
  const zonedNow = toZonedTime(now, timezone)
  const zonedBase = toZonedTime(baseDate, timezone)
  
  let nextDate = new Date(zonedBase)
  
  while (nextDate <= zonedNow) {
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1)
        break
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7)
        break
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
    }
  }
  
  return fromZonedTime(nextDate, timezone)
}

// Get timezone display name with current time
export function getTimezoneDisplayName(timezone: string): string {
  const tz = getTimezoneByValue(timezone)
  if (!tz) return timezone
  
  const currentTime = getCurrentTimeInTimezone(timezone)
  const timeString = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: timezone 
  })
  
  return `${tz.label} (${timeString})`
}
