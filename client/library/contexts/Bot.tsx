import React, { createContext, useContext, useEffect, useState } from "react";
import { Bot } from "../../documentation/main";
import { getBot } from "../helpers/fetching/bots";

interface BotContext {
  bot: Bot | null;
  setBot: (bot: Bot) => void;
  botSelected: boolean;
}

const initialBot: Bot = {
  id: undefined,
  name: "",
  description: "",
  bot_language: "",
  bot_version: "",
  corpus_file: "",
  model_file: "",
  context_file: "",
  enhancement_model: "",
  created_at: "",
  updated_at: "",
};

const BotContext = createContext<BotContext>({
  bot: initialBot,
  setBot: () => {},
  botSelected: false,
});

export const BotProvider = ({ children }: { children: React.ReactNode }) => {
  const [bot, setBot] = useState<Bot>(initialBot);

  console.log("Selected bot: ", bot);

  const value = {
    bot,
    setBot,
    botSelected: bot.id !== undefined,
  };

  useEffect(() => {
    if (!bot.id) {
      const lastUsedBot = localStorage.getItem("lastUsedBot");
      if (lastUsedBot) {
        const parsedBot = JSON.parse(lastUsedBot);
        getBot(parsedBot.id).then(({ success, data }) => {
          if (success && data) {
            setBot(data);
          }
        });
      }
      return;
    }
    localStorage.setItem("lastUsedBot", JSON.stringify(bot));
  }, [bot]);

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
};

export const useBot = () => useContext(BotContext);

export default {
  BotContext,
  BotProvider,
  useBot,
};