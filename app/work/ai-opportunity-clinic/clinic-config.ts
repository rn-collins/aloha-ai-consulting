export const clinicConfig = {
  duration: "90 minutes",
  maximumParticipants: 6,
  pricePerParticipant: 275,
  cohortMaximum: 1650,
  offeredSlotHoldHours: 48,
  freeRescheduleNoticeHours: 72,
  fullRefundNoticeDays: 7,
  partialRefundNoticeDays: 3,
  partialRefundPercent: 50,
  refundInitiationBusinessDays: 5,
} as const;

export const clinicEnrollmentConfigured = () =>
  Boolean(process.env.RESEND_API_KEY && process.env.CLINIC_INBOX_EMAIL && process.env.CLINIC_FROM_EMAIL && process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
