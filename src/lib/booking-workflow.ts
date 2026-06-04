import type { BookingStatus } from "@/types/booking";

/**
 * @fileOverview Defines the allowed transitions for service bookings.
 */

export const bookingStatusFlow: Record<BookingStatus, BookingStatus[]> = {
  "Pending": ["Confirmed", "Cancelled", "No Show"],
  "Confirmed": ["Checked In", "Cancelled", "No Show"],
  "Checked In": ["Completed"],
  "Cancelled": [],
  "Completed": [],
  "No Show": [],
};

/**
 * Validates if a booking can move from one status to another.
 */
export function canMoveBookingStatus(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus
) {
  return bookingStatusFlow[currentStatus]?.includes(nextStatus) ?? false;
}

/**
 * Logic to determine if a vehicle is ready for a job card.
 */
export function canConvertBookingToJobCard(status: BookingStatus) {
  return status === "Confirmed" || status === "Checked In";
}
