import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TimeCounterProps {
  startDate: Date;
}

interface TimeDiff {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeDiff = (start: Date): TimeDiff => {
  const now = new Date();
  const diff = now.getTime() - start.getTime();

  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  const years = Math.floor(totalDays / 365.25);
  const remainingDaysAfterYears = totalDays - Math.floor(years * 365.25);
  const months = Math.floor(remainingDaysAfterYears / 30.44);
  const days = Math.floor(remainingDaysAfterYears - Math.floor(months * 30.44));

  return { years, months, days, hours, minutes, seconds };
};

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <motion.div
    className="flex flex-col items-center"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl bg-card border border-border glow-primary">
      <motion.span
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl sm:text-3xl font-bold text-gradient-romantic font-body"
      >
        {String(value).padStart(2, "0")}
      </motion.span>
    </div>
    <span className="mt-2 text-xs sm:text-sm text-muted-foreground uppercase tracking-widest font-body">
      {label}
    </span>
  </motion.div>
);

const TimeCounter = ({ startDate }: TimeCounterProps) => {
  const [time, setTime] = useState<TimeDiff>(calculateTimeDiff(startDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calculateTimeDiff(startDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {time.years > 0 && <TimeUnit value={time.years} label="anos" />}
      {(time.years > 0 || time.months > 0) && <TimeUnit value={time.months} label="meses" />}
      <TimeUnit value={time.days} label="dias" />
      <TimeUnit value={time.hours} label="horas" />
      <TimeUnit value={time.minutes} label="min" />
      <TimeUnit value={time.seconds} label="seg" />
    </div>
  );
};

export default TimeCounter;
