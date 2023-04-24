import React, { createContext, useContext, useEffect, useState } from "react";
import { Bot } from "../../documentation/main";
import { getBot, startupBot } from "../helpers/fetching/bots";
import { showNotification } from "@mantine/notifications";

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
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setBot: () => {},
  botSelected: false,
});

export const BotProvider = ({
  children,
  botId,
}: {
  children: React.ReactNode;
  botId: string | undefined;
}) => {
  const [bot, setBot] = useState<Bot>(initialBot);

  const value = {
    bot,
    setBot,
    botSelected: bot.id !== undefined,
  };

  useEffect(() => {
    if (botId) {
      getBot(Number(botId)).then(({ success, data }) => {
        if (success && data) {
          setBot(data);
        }
      });

      return;
    }
  }, [botId]);

  useEffect(() => {
    (async () => {
      if (bot.id) {
        await startupBot(bot.id)
          .then(() => {
            showNotification({
              title: "Bot started",
              message: "Bot has been started",
            });
          })
          .catch(() => {
            showNotification({
              title: "Error",
              message: "Bot could not be started",
            });
          });
      }
    })();
  }, [bot.id]);

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
};

export const useBot = () => useContext(BotContext);

export default {
  BotContext,
  BotProvider,
  useBot,
};
