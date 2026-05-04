const DAILY_LIMIT = 30;
const COOLDOWN_MS = 5000;

const STORAGE_KEY = "career-rate-limit";

interface RateLimitData {
  date: string;
  count: number;
  lastRequest: number;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function checkRateLimit() {
  const now = Date.now();
  const today = getToday();

  const raw = localStorage.getItem(STORAGE_KEY);

  let data: RateLimitData = {
    date: today,
    count: 0,
    lastRequest: 0,
  };

  if (raw) {
    data = JSON.parse(raw);

    if (data.date !== today) {
      data = {
        date: today,
        count: 0,
        lastRequest: 0,
      };
    }
  }

  if (now - data.lastRequest < COOLDOWN_MS) {
    return {
      allowed: false,
      reason: `Please wait ${Math.ceil(
        (COOLDOWN_MS - (now - data.lastRequest)) / 1000
      )}s before next request.`,
    };
  }

  if (data.count >= DAILY_LIMIT) {
    return {
      allowed: false,
      reason: "Daily request limit reached (30/day).",
    };
  }

  return {
    allowed: true,
  };
}

export function recordRequest() {
  const today = getToday();

  const raw = localStorage.getItem(STORAGE_KEY);

  let data: RateLimitData = {
    date: today,
    count: 0,
    lastRequest: 0,
  };

  if (raw) {
    data = JSON.parse(raw);

    if (data.date !== today) {
      data = {
        date: today,
        count: 0,
        lastRequest: 0,
      };
    }
  }

  data.count += 1;
  data.lastRequest = Date.now();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}

export function getRemainingRequests(): number {
  const today = getToday();
  const raw = localStorage.getItem(STORAGE_KEY);

  let data: RateLimitData = {
    date: today,
    count: 0,
    lastRequest: 0,
  };

  if (raw) {
    data = JSON.parse(raw);

    if (data.date !== today) {
      data = {
        date: today,
        count: 0,
        lastRequest: 0,
      };
    }
  }

  return Math.max(0, DAILY_LIMIT - data.count);
}