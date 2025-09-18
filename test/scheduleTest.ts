import { scheduleApi, ScheduleDto } from '../apis/ScheduleApi'

// Test data matching the API response format
const testSchedules: ScheduleDto[] = [
  {
    "scheduleId": "bedd2781-214e-453f-b20e-5ce01c1ba371",
    "moduleId": "d126b780-f9ca-4339-802e-a1f912fc5128",
    "date": "2025-09-13",
    "time": "11:00:00",
    "duration": 2,
    "weekNumber": 0,
    "recurrentType": "Weekly",
    "moduleName": "OROR",
    "tutorName": "Johni shei",
    "valid": true,
    "scheduleType": "One-time"
  },
  {
    "scheduleId": "4e4da547-4651-4ab4-b899-dc56c0e9bbee",
    "moduleId": "d126b780-f9ca-4339-802e-a1f912fc5128",
    "date": "2025-09-18",
    "time": "21:00:00",
    "duration": 60,
    "weekNumber": 0,
    "recurrentType": "specific",
    "moduleName": "OROR",
    "tutorName": "Johni shei",
    "valid": true,
    "scheduleType": "One-time"
  }
]

// Test functions
export const testScheduleLogic = () => {
  console.log('=== Testing Schedule Logic ===')
  
  // Test upcoming schedules filtering
  const upcoming = scheduleApi.getUpcomingSchedules(testSchedules)
  console.log('Upcoming schedules:', upcoming)
  
  // Test joinable logic for each schedule
  testSchedules.forEach(schedule => {
    const isJoinable = scheduleApi.isScheduleJoinable(schedule)
    const scheduleTime = new Date(`${schedule.date}T${schedule.time}`)
    const now = new Date()
    const timeDiff = scheduleTime.getTime() - now.getTime()
    const hoursUntil = timeDiff / (1000 * 60 * 60)
    
    console.log(`Schedule ${schedule.scheduleId}:`)
    console.log(`  - Time: ${schedule.date} ${schedule.time}`)
    console.log(`  - Hours until: ${hoursUntil.toFixed(2)}`)
    console.log(`  - Is joinable: ${isJoinable}`)
    console.log(`  - Is valid: ${schedule.valid}`)
  })
  
  return {
    totalSchedules: testSchedules.length,
    upcomingSchedules: upcoming.length,
    joinableSchedules: testSchedules.filter(s => scheduleApi.isScheduleJoinable(s)).length
  }
}

// Mock API function for testing
export const mockScheduleApi = {
  getMySchedules: async (): Promise<ScheduleDto[]> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(testSchedules), 100)
    })
  }
}