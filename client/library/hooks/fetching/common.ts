import { useEffect } from "react";
import {
  Bot,
  ButtonType,
  Chat,
  Conversation,
  Corpus,
  CorpusDataPoint,
} from "../../../documentation/main";
import useFetch, { UseFetchConfig } from "../useFetch";

export const useAddAnswerToIntent = (
  { intent, answer }: { intent: string; answer: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; answer: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; answer: string; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: "/training/response",
    method: "PUT",
    body: { intent, answer, retrain: true },
  });

  return {
    addAnswerToIntent: load,
    data: data,
    success,
  };
};

export const useAddUtteranceToIntent = (
  { intent, utterance }: { intent: string; utterance: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; utterance: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; utterance: string; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: "/training/utterance",
    method: "PUT",
    body: { intent, utterance, retrain: true },
  });

  return {
    addUtteranceToIntent: load,
    data: data,
    success,
  };
};

export const useGetAllButtons = (
  defaultValue: ButtonType[] = [],
  config?: Partial<UseFetchConfig<unknown, ButtonType[]>>
) => {
  const { load, data, success } = useFetch<unknown, ButtonType[]>({
    ...config,
    url: "/training/buttons",
    method: "GET",
  });

  return {
    getAllButtons: load,
    data: data || defaultValue,
    success,
  };
};

export const useDeleteDataPoint = (
  { intent }: { intent: string },
  config?: Partial<UseFetchConfig<CorpusDataPoint, CorpusDataPoint>>
) => {
  const { load, data, success } = useFetch<
    { intent: string; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: "/training/datapoint",
    method: "DELETE",
    body: { intent, retrain: true },
  });

  return {
    deleteDataPoint: load,
    data: data,
    success,
  };
};

export const useRenameIntent = (
  { intent, newIntent }: { intent: string; newIntent: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; newIntent: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { old_intent: string; new_intent: string; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: "/training/intent/rename",
    method: "PUT",
    body: { old_intent: intent, new_intent: newIntent, retrain: true },
  });

  return {
    renameIntent: load,
    data: data,
    success,
  };
};

export const useUpdateButtonsOnIntent = (
  { intent, buttons }: { intent: string; buttons: ButtonType[] },
  config?: Partial<
    UseFetchConfig<{ intent: string; buttons: ButtonType[] }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { buttons: ButtonType[]; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: `/training/intent/${intent}/buttons`,
    method: "PUT",
    body: { buttons, retrain: false },
  });

  return {
    updateButtonsOnIntent: load,
    data: data,
    success,
  };
};

export const useUpdateEnhanceForIntent = (
  { intent, enhance }: { intent: string; enhance: boolean },
  config?: Partial<
    UseFetchConfig<{ intent: string; enhance: boolean }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { enhance: boolean; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: `/training/intent/${intent}/enhance`,
    method: "PUT",
    body: { enhance, retrain: false },
  });

  return {
    updateEnhanceForIntent: load,
    data: data,
    success,
  };
};

export const useRemoveUtteranceFromIntent = (
  { intent, utterance }: { intent: string; utterance: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; utterance: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; utterance: string; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: "/training/utterance",
    method: "DELETE",
    body: { intent, utterance, retrain: true },
  });

  return {
    removeUtteranceFromIntent: load,
    data: data,
    success,
  };
};

export const useRemoveAnswerFromIntent = (
  { intent, answer }: { intent: string; answer: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; answer: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; answer: string; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: "/training/response",
    method: "DELETE",
    body: { intent, answer, retrain: true },
  });

  return {
    removeAnswerFromIntent: load,
    data: data,
    success,
  };
};

export const useRemoveButtonFromIntent = (
  { intent, button }: { intent: string; button: ButtonType },
  config?: Partial<
    UseFetchConfig<{ intent: string; button: ButtonType }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; button: ButtonType; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: `/training/intent/${intent}/button`,
    method: "DELETE",
    body: { intent, button, retrain: true },
  });

  return {
    removeButtonFromIntent: load,
    data: data,
    success,
  };
};

export const useAddDataPoint = (
  { intent, utterances, answers, buttons, enhance }: CorpusDataPoint,
  config?: Partial<UseFetchConfig<CorpusDataPoint, Corpus>>
) => {
  interface CorpusDataPointWithRetrain extends CorpusDataPoint {
    retrain: boolean;
  }

  const { load, data, success } = useFetch<CorpusDataPointWithRetrain, Corpus>({
    ...config,
    url: "/training/datapoint",
    method: "POST",
    body: { intent, utterances, answers, buttons, enhance, retrain: true },
  });

  return {
    addDataPoint: load,
    data: data,
    success,
  };
};

export const useGetConversation = (
  conversationId: number | string,
  config?: Partial<UseFetchConfig<unknown, Conversation>>
) => {
  const { load, data, success } = useFetch<unknown, Conversation>({
    ...config,
    url: `/conversations/${conversationId}`,
    method: "GET",
  });

  return {
    getConversation: load,
    data: data,
    success,
  };
};

export const useSendTrainingChat = (
  { message, session_id }: { message: string; session_id: string },
  config?: Partial<
    UseFetchConfig<
      { message: string; session_id: string },
      {
        conversation: Conversation;
      }
    >
  >
) => {
  const { load, data, success } = useFetch<
    { message: string; session_id: string },
    {
      conversation: Conversation;
    }
  >({
    ...config,
    url: `/chat/training`,
    method: "POST",
    body: { message, session_id },
  });

  return {
    sendTrainingChat: load,
    data: data,
    success,
  };
};

export const useRetryChat = (
  chatId: number | string,
  config?: Partial<
    UseFetchConfig<unknown, { answer: string; conversation: Conversation }>
  >
) => {
  const { load, data, success } = useFetch<
    unknown,
    { answer: string; conversation: Conversation }
  >({
    ...config,
    url: `/chat/${chatId}/retry/`,
    method: "POST",
  });

  return {
    retryChat: load,
    data: data,
    success,
  };
};

export const useMarkChatAsReviewed = (
  reviewConfig?: {
    chatId?: number | string;
    username: string;
  },
  config?: Partial<UseFetchConfig<{ username: string }, Chat>>
) => {
  const { load, data, success } = useFetch<
    { username: string | undefined },
    Chat
  >({
    ...config,
    url: `/chat/${reviewConfig?.chatId}/reviewed/`,
    method: "POST",
    body: { username: reviewConfig?.username },
  });

  return {
    markChatAsReviewed: load,
    data: data,
    success,
  };
};

export const useGetConversations = (
  config?: Partial<UseFetchConfig<unknown, Conversation[]>>
) => {
  const { load, data, success, loading } = useFetch<unknown, Conversation[]>({
    ...config,
    url: "/conversations",
    method: "GET",
  });

  return {
    getConversations: load,
    data: data,
    success,
    loading,
  };
};

export const useGetConversationsThatNeedReview = (
  config?: Partial<UseFetchConfig<unknown, Conversation[]>>
) => {
  const { load, data, success, loading } = useFetch<unknown, Conversation[]>({
    ...config,
    url: "/conversations/need_review",
    method: "GET",
  });

  return {
    getConversationsThatNeedReview: load,
    data: data,
    success,
    loading,
  };
};

export const useCreateTrainingCopyOfConversation = (
  conversation_id: number | string,
  config?: Partial<UseFetchConfig<unknown, Conversation>>
) => {
  const { load, data, success } = useFetch<unknown, Conversation>({
    ...config,
    url: `/conversations/${conversation_id}/training_copy`,
    method: "POST",
  });

  return {
    createTrainingCopyOfConversation: load,
    data: data,
    success,
  };
};

export const useDeleteConversation = (
  conversation_id: number | string,
  config?: Partial<UseFetchConfig<unknown, Conversation>>
) => {
  const { load, data, success } = useFetch<unknown, Conversation>({
    ...config,
    url: `/conversations/${conversation_id}`,
    method: "DELETE",
  });

  return {
    deleteConversation: load,
    data: data,
    success,
  };
};

export const useRetrainBot = (
  config?: Partial<UseFetchConfig<unknown, { status: string }>>
) => {
  const { load, data, success, loading } = useFetch<
    unknown,
    { status: string }
  >({
    ...config,
    url: "/training/retrain",
    method: "POST",
  });

  return {
    retrainBot: load,
    data: data,
    success,
    loading,
  };
};

export const useGenerateConversationFlow = (
  conversation_id: number | string,
  config?: Partial<UseFetchConfig<unknown, Conversation>>
) => {
  const { load, data, success } = useFetch<unknown, Conversation>({
    ...config,
    url: `/conversations/flow/${conversation_id}/generate`,
    method: "POST",
  });

  return {
    generateConversationFlow: load,
    data: data,
    success,
  };
};

export const useGetBots = (
  config?: Partial<UseFetchConfig<unknown, Bot[]>>
) => {
  const { load, data, success } = useFetch<unknown, Bot[]>({
    ...config,
    url: "/bots",
    method: "GET",
  });

  return {
    getBots: load,
    data: data,
    success,
  };
};

export const useGetAllBots = (
  config?: Partial<UseFetchConfig<unknown, Bot[]>>
) => {
  const { load, data, success } = useFetch<unknown, Bot[]>({
    ...config,
    url: "/bots/all",
    method: "GET",
  });

  return {
    getAllBots: load,
    data: data,
    success,
  };
};

export const useGetRecentConversations = (
  config?: Partial<UseFetchConfig<unknown, Conversation[]>>,
  n?: number
) => {
  const { load, data, success, loading } = useFetch<unknown, Conversation[]>({
    ...config,
    url: n ? `/conversations/recent/${n}` : "/conversations/recent",
    method: "GET",
  });

  return {
    getRecentConversations: load,
    data: data,
    success,
    loading,
  };
};

export const useCheckIsSuperAdmin = (
  config?: Partial<UseFetchConfig<unknown, boolean>>
) => {
  const { load, data, success } = useFetch<unknown, boolean>({
    useBotId: false,
    ...config,
    url: "/auth/is_super_admin",
    method: "POST",
  });

  return {
    checkIsSuperAdmin: load,
    data: data,
    success,
  };
};

export const useCheckAuth = (
  config?: Partial<UseFetchConfig<{ access_token: string }, boolean>>
) => {
  const { load, data, success } = useFetch<
    {
      access_token: string;
    },
    boolean
  >({
    useBotId: false,
    ...config,
    url: "/auth/check",
    method: "POST",
    body: {
      access_token: localStorage.getItem("accessToken") || "",
    },
  });

  return {
    checkAuth: load,
    data: data,
    success,
  };
};

export const useRefreshAccessToken = (
  config?: Partial<
    UseFetchConfig<{ refresh_token: string }, { access_token: string }>
  >
) => {
  const { load, data, success } = useFetch<
    {
      refresh_token: string;
    },
    { access_token: string }
  >({
    useBotId: false,
    ...config,
    url: "/auth/refresh",
    method: "POST",
    body: {
      refresh_token: localStorage.getItem("refreshToken") || "",
    },
  });

  useEffect(() => {
    if (data?.access_token) {
      localStorage.setItem("accessToken", data.access_token);
    }
  }, [data]);

  return {
    refreshAccessToken: load,
    data: data,
    success,
  };
};

export const useAddContextToIntent = (
  { intent, context }: { intent: string; context: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; context: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; context: string; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: `/training/intent/${intent}/context`,
    method: "PUT",
    body: { intent, context, retrain: true },
  });

  return {
    addContextToIntent: load,
    data: data,
    success,
  };
};

export const useRemoveContextFromIntent = (
  { intent, context }: { intent: string; context: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; context: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; context: string; retrain: boolean },
    CorpusDataPoint
  >({
    ...config,
    url: `/training/intent/${intent}/context`,
    method: "DELETE",
    body: { intent, context, retrain: true },
  });

  return {
    removeContextFromIntent: load,
    data: data,
    success,
  };
};

export const useGetPageLinks = (
  {
    url,
    exclude,
  }: {
    url: string;
    exclude?: string[];
  },
  config?: Partial<
    UseFetchConfig<
      { website_url: string; exclude: string[] | undefined },
      string[]
    >
  >
) => {
  const { load, data, success, loading } = useFetch<
    { website_url: string },
    string[]
  >({
    url: `/training/context/auto/pagelinks`,
    method: "POST",
    body: { website_url: url, exclude },
    ...config,
  });

  return {
    getPageLinks: load,
    data: data,
    success,
    loading,
  };
};

export const useGenerateBotContextForPages = (
  {
    pages,
  }: {
    pages: string[];
  },
  config?: Partial<UseFetchConfig<{ pages: string[] }, string[]>>
) => {
  const { load, data, success, loading } = useFetch<
    { pages: string[] },
    string[]
  >({
    ...config,
    url: `/training/context/auto/generate`,
    method: "POST",
    body: { pages },
  });

  return {
    generateBotContextForPages: load,
    data: data,
    success,
    loading,
  };
};
