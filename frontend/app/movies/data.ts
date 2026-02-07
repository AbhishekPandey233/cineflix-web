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
    img: "/aabataahma.jpeg",
    year: 2026,
    score: 4.2,
    duration: "2h 12m",
    synopsis:
      "A heartfelt journey of family, sacrifice, and hope as a mother and son navigate life-changing decisions.",
    language: "Nepali",
    showtimes: ["10:30 AM", "01:15 PM", "04:10 PM", "07:45 PM"],
  },
  {
    id: "2",
    title: "Avengers: Doomsday",
    genre: "Sci-fi | Action",
    rating: "PG",
    img: "/doomsday.png",
    year: 2026,
    score: 4.0,
    duration: "2h 18m",
    synopsis:
      "Earth’s mightiest heroes face their most dangerous cosmic threat yet as alliances are tested.",
    language: "English",
    showtimes: ["11:15 AM", "02:45 PM", "06:05 PM", "09:20 PM"],
  },
  {
    id: "3",
    title: "Avatar 3: Fire and Ash",
    genre: "Action | Adventure",
    rating: "PG-13",
    img: "/avatar.jpeg",
    year: 2025,
    score: 4.5,
    duration: "2h 32m",
    synopsis:
      "A new Na’vi clan emerges as old alliances fracture, igniting a battle for Pandora’s future.",
    language: "English",
    showtimes: ["12:00 PM", "03:25 PM", "06:45 PM", "10:00 PM"],
  },
  {
    id: "4",
    title: "Alien Romulus",
    genre: "Sci-fi | Horror",
    rating: "R",
    img: "/alien.webp",
    year: 2026,
    score: 3.9,
    duration: "2h 06m",
    synopsis:
      "A salvage crew investigates a derelict station and awakens a nightmare beyond containment.",
    language: "English",
    showtimes: ["10:40 AM", "01:55 PM", "05:30 PM", "08:50 PM"],
  },
];

export const comingSoon = [
  { id: "c1", title: "Velvet Storm", date: "Feb 21" },
  { id: "c2", title: "Neon Valley", date: "Mar 08" },
  { id: "c3", title: "River of Light", date: "Mar 29" },
  { id: "c4", title: "Monsoon City", date: "Apr 12" },
];
