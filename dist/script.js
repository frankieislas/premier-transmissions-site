const schedule = [
  { day: "Monday", open: 8 * 60, close: 17 * 60 },
  { day: "Tuesday", open: 8 * 60, close: 17 * 60 },
  { day: "Wednesday", open: 8 * 60, close: 17 * 60 },
  { day: "Thursday", open: 8 * 60, close: 17 * 60 },
  { day: "Friday", open: 8 * 60, close: 17 * 60 }
];

const dayIndex = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

function getPacificNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    day: values.weekday,
    minutes: Number(values.hour) * 60 + Number(values.minute)
  };
}

function formatMinutes(totalMinutes) {
  const hour24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hour24 >= 12 ? "p.m." : "a.m.";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function getOpenState() {
  const now = getPacificNow();
  const today = schedule.find((entry) => entry.day === now.day);

  if (today && now.minutes >= today.open && now.minutes < today.close) {
    return {
      open: true,
      label: "Open now",
      detail: `Today until ${formatMinutes(today.close)}`
    };
  }

  const todayIndex = dayIndex[now.day];

  for (let offset = 0; offset < 7; offset += 1) {
    const lookupIndex = (todayIndex + offset) % 7;
    const nextEntry = schedule.find((entry) => dayIndex[entry.day] === lookupIndex);

    if (!nextEntry) {
      continue;
    }

    if (offset === 0 && now.minutes < nextEntry.open) {
      return {
        open: false,
        label: "Closed now",
        detail: `Opens today at ${formatMinutes(nextEntry.open)}`
      };
    }

    if (offset > 0) {
      return {
        open: false,
        label: "Closed now",
        detail: `Opens ${nextEntry.day} at ${formatMinutes(nextEntry.open)}`
      };
    }
  }

  return {
    open: false,
    label: "Hours listed below",
    detail: "Monday through Friday, 8:00 a.m. to 5:00 p.m."
  };
}

function applyOpenState() {
  const status = document.querySelector("[data-open-status]");
  const detail = document.querySelector("[data-open-detail]");

  if (!status || !detail) {
    return;
  }

  const state = getOpenState();
  status.textContent = state.label;
  detail.textContent = state.detail;
  status.classList.add(state.open ? "is-open" : "is-closed");
}

function setupReveal() {
  const items = document.querySelectorAll("[data-reveal]");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  items.forEach((item) => observer.observe(item));
}

applyOpenState();
setupReveal();
