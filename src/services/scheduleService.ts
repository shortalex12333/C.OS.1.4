import { supabase } from './supabaseClient';

export interface BookedSlot {
  date: string;
  time: string;
  // No personal information included for privacy
}

export interface TimeSlotAvailability {
  time: string;
  isBooked: boolean;
}

/**
 * Service for managing schedule bookings and availability
 */
export class ScheduleService {
  
  /**
   * Fetch all booked slots for a date range
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Array of booked slots (no client info for privacy)
   */
  static async getBookedSlots(startDate: string, endDate: string): Promise<BookedSlot[]> {
    try {
      const { data, error } = await supabase
        .from('schedule_calls')
        .select('date, time')  // Only fetch date and time, no personal info
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('Error fetching booked slots:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBookedSlots:', error);
      return [];
    }
  }

  /**
   * Fetch booked slots for a specific date
   * @param date - Date in YYYY-MM-DD format
   * @returns Array of booked time strings
   */
  static async getBookedTimesForDate(date: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('schedule_calls')
        .select('time')
        .eq('date', date);

      if (error) {
        console.error('Error fetching booked times:', error);
        return [];
      }

      return data?.map(slot => slot.time) || [];
    } catch (error) {
      console.error('Error in getBookedTimesForDate:', error);
      return [];
    }
  }

  /**
   * Check if a specific date and time slot is available
   * @param date - Date in YYYY-MM-DD format
   * @param time - Time string (e.g., "2:30 PM")
   * @returns Boolean indicating availability
   */
  static async isSlotAvailable(date: string, time: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('schedule_calls')
        .select('id')
        .eq('date', date)
        .eq('time', time)
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned means slot is available
        return true;
      }

      // If data exists or other error, slot is not available
      return !data;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  /**
   * Create a Set of booked slot keys for efficient lookup
   * @param bookedSlots - Array of booked slots
   * @returns Set of "date_time" strings
   */
  static createBookedSlotsSet(bookedSlots: BookedSlot[]): Set<string> {
    return new Set(
      bookedSlots.map(slot => `${slot.date}_${slot.time}`)
    );
  }

  /**
   * Check if a slot is booked using the Set
   * @param date - Date in YYYY-MM-DD format
   * @param time - Time string
   * @param bookedSet - Set of booked slot keys
   * @returns Boolean indicating if booked
   */
  static isSlotBooked(date: string, time: string, bookedSet: Set<string>): boolean {
    return bookedSet.has(`${date}_${time}`);
  }

  /**
   * Format date for database queries
   * @param date - JavaScript Date object
   * @returns YYYY-MM-DD formatted string
   */
  static formatDateForDB(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get date range for next N days
   * @param days - Number of days ahead
   * @returns Object with startDate and endDate strings
   */
  static getDateRange(days: number = 30): { startDate: string; endDate: string } {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return {
      startDate: this.formatDateForDB(today),
      endDate: this.formatDateForDB(futureDate)
    };
  }

  /**
   * Subscribe to real-time changes in schedule_calls table
   * @param onInsert - Callback for new bookings
   * @param onDelete - Callback for cancellations
   * @returns Subscription object
   */
  static subscribeToScheduleChanges(
    onInsert?: (payload: any) => void,
    onDelete?: (payload: any) => void
  ) {
    const subscription = supabase
      .channel('schedule_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'schedule_calls'
      }, payload => {
        console.log('New booking detected:', payload.new);
        onInsert?.(payload.new);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'schedule_calls'
      }, payload => {
        console.log('Booking cancelled:', payload.old);
        onDelete?.(payload.old);
      })
      .subscribe();

    return subscription;
  }

  /**
   * Unsubscribe from real-time changes
   * @param subscription - Subscription to remove
   */
  static unsubscribe(subscription: any) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
}