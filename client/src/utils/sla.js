/**
 * SLA & Overdue Ticket Calculation Utility
 * Tickets open > 3 days (72 hours) flag as OVERDUE red alert, independent of status.
 */
export function getSLAMetrics(createdAt, status) {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = (diffMs / (1000 * 60 * 60 * 24)).toFixed(1);
  
  // Overdue if open > 72h (3 days) and not resolved/rejected
  const isOverdue = totalHours >= 72 && status !== 'resolved' && status !== 'rejected';
  
  // Progress percentage toward 72h SLA breach
  const slaPercentage = Math.min(100, Math.round((totalHours / 72) * 100));

  let timeString = '';
  if (totalHours < 24) {
    timeString = `${totalHours} hrs ago`;
  } else {
    timeString = `${days} days ago`;
  }

  return {
    totalHours,
    daysOpen: days,
    isOverdue,
    slaPercentage,
    timeAgoText: timeString
  };
}
