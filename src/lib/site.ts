export const SITE = {
  name: "Brilliant Desk Tuitions",
  kannada: "ಬ್ರಿಲಿಯಂಟ್ ಡೆಸ್ಕ್ ಟ್ಯೂಷನ್ಸ್",
  since: "Since 2017",
  tagline: "Tuition for Classes 1 to 10 — State (KSEEB), CBSE & ICSE",
  phone: "+91 90000 00000",
  whatsapp: "919000000000",
  email: "brilliantdesktuitions@gmail.com",
  addressLines: ["Brilliant Desk Tuitions", "Bengaluru, Karnataka, India"],
  mapsShareUrl: "https://share.google/WnqY7Yl6ans4l0z6r",
  mapsEmbedUrl:
    "https://maps.google.com/maps?q=Brilliant%20Desk%20Tuitions%20Bengaluru&t=&z=15&ie=UTF8&iwloc=&output=embed",
  hours: [
    { day: "Monday – Friday", time: "4:00 PM – 8:30 PM" },
    { day: "Saturday", time: "10:00 AM – 6:00 PM" },
    { day: "Sunday", time: "Doubt-clearing & tests (by batch)" },
  ],
} as const;

export const BOARDS = ["KSEEB (State)", "CBSE", "ICSE"] as const;

export const CLASS_LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;

export const MATERIAL_CATEGORIES = [
  { value: "pyq", label: "Previous Year Papers" },
  { value: "notes", label: "Notes" },
  { value: "model_papers", label: "Model Papers" },
] as const;

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;
