export type Movie = {
  id: string;
  title: string;
  genre: string;
  rating: string;
  img: string;
  year: number;
  score: number;
  duration: string;
  synopsis: string;
  language: string;
  showtimes: string[];
};

export const nowShowing: Movie[] = [
  {
    id: "1",
    title: "Aa Bata Aama",
    genre: "Nepali | Family,Drama",
    rating: "PG-13",
    img: "/71meY6dAvjL.jpg",
    year: 2025,
    score: 4.2,
    duration: "2h 12m",
    synopsis:
      "A heartfelt journey of family, sacrifice, and hope as a mother and son navigate life-changing decisions.",
    language: "Nepali",
    showtimes: ["10:30 AM", "01:15 PM", "04:10 PM", "07:45 PM"],
  },
  {
    id: "2",
    title: "Ocean Whisper",
    genre: "Drama | Romance",
    rating: "PG",
    img: "/71meY6dAvjL.jpg",
    year: 2024,
    score: 4.0,
    duration: "1h 58m",
    synopsis:
      "Two souls find each other on a quiet coast, where love tests the limits of timing and distance.",
    language: "English",
    showtimes: ["11:00 AM", "02:40 PM", "05:20 PM", "09:00 PM"],
  },
  {
    id: "3",
    title: "Skyline Fury",
    genre: "Action | Adventure",
    rating: "R",
    img: "/71meY6dAvjL.jpg",
    year: 2025,
    score: 4.5,
    duration: "2h 04m",
    synopsis:
      "A rogue pilot is forced into a high-stakes mission over a city skyline on the edge of chaos.",
    language: "English",
    showtimes: ["12:10 PM", "03:30 PM", "06:50 PM", "09:30 PM"],
  },
  {
    id: "4",
    title: "The Last Reel",
    genre: "Mystery",
    rating: "PG-13",
    img: "/71meY6dAvjL.jpg",
    year: 2023,
    score: 3.9,
    duration: "2h 22m",
    synopsis:
      "A filmmaker uncovers a long-buried secret hidden within a final, unfinished movie reel.",
    language: "English",
    showtimes: ["10:00 AM", "01:40 PM", "05:10 PM", "08:20 PM"],
  },
];

export const comingSoon = [
  { id: "c1", title: "Velvet Storm", date: "Feb 21" },
  { id: "c2", title: "Neon Valley", date: "Mar 08" },
  { id: "c3", title: "River of Light", date: "Mar 29" },
  { id: "c4", title: "Monsoon City", date: "Apr 12" },
];
