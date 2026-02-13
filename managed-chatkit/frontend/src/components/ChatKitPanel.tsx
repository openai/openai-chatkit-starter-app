import { useMemo } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { createClientSecretFetcher, workflowId } from "../lib/chatkitSession";

const ACCENT_COLOR = "#FF5924";
const HOST_AVATAR_URL =
  "https://causewriter.ai/wp-content/uploads/2026/02/hostAvatar.png";

export function ChatKitPanel() {
  const getClientSecret = useMemo(
    () => createClientSecretFetcher(workflowId),
    []
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
    theme: {
      color: {
        accent: ACCENT_COLOR,
      },
    },
    startScreen: {
      greeting:
        "Hi! I'm your song-finding assistant. Describe a song — a lyric, a melody, a feeling — and I'll help you find it.",
      prompt: [
        {
          id: "lyrics",
          label: "Find by lyrics",
          text: "I remember a song with the lyrics something like...",
        },
        {
          id: "describe",
          label: "Describe a song",
          text: "I'm looking for a song that sounds like...",
        },
        {
          id: "mood",
          label: "Find by mood",
          text: "I need a song that feels...",
        },
      ],
    },
    composer: {
      placeholder: "Describe a song you're looking for...",
    },
  });

  return (
    <div className="flex h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-colors dark:bg-slate-900">
      <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-3 dark:border-slate-700">
        <img
          src={HOST_AVATAR_URL}
          alt="Song Finder"
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="text-base font-semibold text-slate-800 dark:text-slate-100">
          Song Finder
        </span>
      </header>
      <ChatKit control={chatkit.control} className="block h-full w-full" />
    </div>
  );
}
