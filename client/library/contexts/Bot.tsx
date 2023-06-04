import React, { createContext, useContext, useEffect, useMemo } from "react";
import { Bot } from "../../documentation/main";
import { useGetBot } from "../hooks/fetching/bot";
import { showNotification } from "@mantine/notifications";
import { Navigate } from "react-router-dom";

interface BotContext {
  bot: Bot | null;
  botSelected: boolean;
  isRunning: boolean;
  reloadBot: () => void;
  isLoading: boolean;
}

const initialBot: Bot | null = null;

const BotContext = createContext<BotContext>({
  bot: initialBot,
  botSelected: false,
  isRunning: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  reloadBot: () => {},
  isLoading: false,
});

export const BotProvider = ({
  children,
  botId,
}: {
  children: React.ReactNode;
  botId: string | undefined;
}) => {
  const [isLoading, setIsLoading] = React.useState(true);

  const { data: bot = null, getBot: reloadGetBot } = useGetBot(
    botId as string,
    {
      runOnDependencies: [botId],
      onBefore: () => {
        setIsLoading(true);
      },
      onError: () => {
        showNotification({
          title: "Error",
          message: "Could not load bot",
          color: "red",
        });
      },
      onFinally: () => {
        setIsLoading(false);
      },
    }
  );

  const reload = async () => {
    setIsLoading(true);
    await reloadGetBot();
    setIsLoading(false);
  };

  useEffect(() => {
    (window as unknown as Record<string, string>).airtisan_bot_slug =
      bot?.slug || "";
    (window as unknown as Record<string, string>).airtisan_bot_name =
      bot?.name || "";
  }, [bot]);

  const value: BotContext = useMemo(
    () => ({
      bot,
      botSelected: bot?.id !== undefined,
      isRunning: !!bot?.is_running,
      reloadBot: reload,
      isLoading,
    }),
    [bot, reload, isLoading]
  );

  if (botId && !bot && !isLoading) {
    return <Navigate to={`/404?reason="Bot not found"`} />;
  }

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
};

export const useBot = () => useContext(BotContext);

export default {
  BotContext,
  BotProvider,
  useBot,
};
