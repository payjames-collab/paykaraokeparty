"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import confetti from "canvas-confetti";

type Guest = {
  id?: number;
  name: string;
  selected_date: string;
  plus_ones: number;
};

export default function Home() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [plusOnes, setPlusOnes] = useState(0);

  const [guests, setGuests] = useState<Guest[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const [gameVote, setGameVote] = useState("");

  const games = [
    "Mafia",
    "Buzzed / First and Last",
    "Random Notes",
    "Pictionary",
    "WII Games",
  ];

  // Load guests
  async function loadGuests() {
    if (!supabase) return;
    const { data } = await supabase.from("guests").select("*");
    if (data) setGuests(data as Guest[]);
  }

  useEffect(() => {
    loadGuests();
  }, []);

  // RSVP submit
  async function submitRSVP() {
    if (!name || !date || !supabase) return;

    await supabase.from("guests").insert({
      name,
      selected_date: date,
      plus_ones: plusOnes,
      attending: "yes",
    });

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    setSubmitted(true);
    loadGuests();
  }

  // Game vote
  async function voteGame(choice: string) {
  if (!supabase) return;
  await supabase.from("game_votes").insert({
    name,
    game: choice,
  });

  setGameVote(choice);
}

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-500 to-orange-400 flex flex-col items-center p-6 text-white">

      {/* TITLE */}
      <h1 className="text-4xl font-bold mt-10 text-center">
        PAY IS STEALING THE COUSINS
      </h1>

      <p className="mt-3 text-center max-w-xl">
        Karaoke. Drinks. Chaos. Bad singing strongly encouraged.
      </p>

      {/* LIVE GUEST LIST */}
      <div className="mt-6 bg-black/30 p-4 rounded-xl w-full max-w-md">
        <h2 className="font-bold mb-2">Live Guests</h2>

        {guests.length === 0 ? (
          <p>No RSVPs yet</p>
        ) : (
          guests.map((g) => (
            <p key={g.id}>
              {g.name} — {g.selected_date} (+{g.plus_ones})
            </p>
          ))
        )}
      </div>

      {/* RSVP BOX */}
      <div className="bg-purple-950 mt-6 w-full max-w-md p-6 rounded-3xl">

        {!submitted ? (
          <>
            <input
              className="w-full p-3 rounded bg-orange-300 text-black mb-3"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select
              className="w-full p-3 rounded bg-orange-300 text-black mb-3"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            >
              <option value="">Select Date</option>
              <option value="July 10">July 10</option>
              <option value="July 17">July 17</option>
              <option value="July 18">July 18</option>
            </select>

            <input
              type="number"
              className="w-full p-3 rounded bg-orange-300 text-black mb-3"
              placeholder="Plus ones"
              value={plusOnes}
              onChange={(e) => setPlusOnes(Number(e.target.value))}
            />

            <button
              className="w-full bg-purple-500 p-3 rounded font-bold"
              onClick={submitRSVP}
            >
              Submit RSVP
            </button>
          </>
        ) : (
          <p className="text-center font-bold">You’re in</p>
        )}
      </div>

      {/* GAME POLL */}
      <div className="mt-6 w-full max-w-md bg-black/30 p-4 rounded-xl">
        <h2 className="font-bold mb-2">Game Poll</h2>

        {games.map((g) => (
          <button
            key={g}
            className="block w-full bg-orange-400 text-black p-2 rounded mb-2 hover:bg-orange-300"
            onClick={() => voteGame(g)}
          >
            {g}
          </button>
        ))}

        {gameVote && (
          <p className="mt-2 font-bold">You voted: {gameVote}</p>
        )}
      </div>

    </main>
  );
}
