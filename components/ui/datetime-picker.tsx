'use client'

import * as React from 'react'
import { format, startOfDay } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick a date and time',
  minDate,
  maxDate,
  className
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [timeValue, setTimeValue] = React.useState<string>('')

  // Initialize time value when component mounts or value changes
  React.useEffect(() => {
    if (value) {
      setSelectedDate(value)
      setTimeValue(format(value, 'HH:mm'))
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && timeValue) {
      const [hours, minutes] = timeValue.split(':')
      const newDateTime = new Date(date)
      newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
      onChange?.(newDateTime)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    if (selectedDate && time) {
      const [hours, minutes] = time.split(':')
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
      onChange?.(newDateTime)
    }
  }

  const formatDisplayValue = () => {
    if (!selectedDate || !timeValue) return placeholder
    const [hours, minutes] = timeValue.split(':')
    const displayDate = new Date(selectedDate)
    displayDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0)
    return format(displayDate, 'PPP p')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDisplayValue()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={date => {
              if (minDate && date < startOfDay(minDate)) return true
              if (maxDate && date > startOfDay(maxDate)) return true
              return false
            }}
            initialFocus
          />
          {selectedDate && (
            <div className="mt-3 space-y-3">
              <Label>Select Time</Label>
              <Input
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full"
              />
              {selectedDate && timeValue && (
                <div className="text-sm text-muted-foreground">
                  Selected: {formatDisplayValue()}
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Export utility function for backward compatibility with existing code
export function formatDateTimeForLegacyAPI(dateTime: Date | undefined) {
  if (!dateTime) return { date: '', time: '' }
  
  return {
    date: format(dateTime, 'yyyy-MM-dd'),
    time: format(dateTime, 'HH:mm')
  }
}