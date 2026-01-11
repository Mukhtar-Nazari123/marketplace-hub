import { useState, useEffect, useCallback } from 'react';

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

/**
 * Hook to calculate and update countdown timer for a deal
 * @param dealEndAt - ISO date string for when the deal ends
 * @param dealStartAt - ISO date string for when the deal starts (optional)
 * @returns CountdownTime object with hours, minutes, seconds, and isExpired flag
 */
export const useDealCountdown = (
  dealEndAt: string | null | undefined,
  dealStartAt?: string | null
): CountdownTime => {
  const calculateTimeLeft = useCallback((): CountdownTime => {
    if (!dealEndAt) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const now = new Date().getTime();
    const endTime = new Date(dealEndAt).getTime();
    const startTime = dealStartAt ? new Date(dealStartAt).getTime() : 0;

    // Check if deal hasn't started yet
    if (dealStartAt && now < startTime) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const difference = endTime - now;

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      hours,
      minutes,
      seconds,
      isExpired: false,
    };
  }, [dealEndAt, dealStartAt]);

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft);

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Clear interval if expired
      if (newTimeLeft.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return timeLeft;
};

/**
 * Get deal status based on start and end dates
 */
export type DealStatus = 'upcoming' | 'active' | 'expired';

export const getDealStatus = (
  isDeal: boolean,
  dealStartAt: string | null | undefined,
  dealEndAt: string | null | undefined
): DealStatus => {
  if (!isDeal || !dealEndAt) {
    return 'expired';
  }

  const now = new Date().getTime();
  const endTime = new Date(dealEndAt).getTime();
  const startTime = dealStartAt ? new Date(dealStartAt).getTime() : 0;

  if (now > endTime) {
    return 'expired';
  }

  if (dealStartAt && now < startTime) {
    return 'upcoming';
  }

  return 'active';
};

export default useDealCountdown;
