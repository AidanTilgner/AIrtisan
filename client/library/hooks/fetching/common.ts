import {
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
    url: "/training/intent",
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
    url: `/chat/as_admin/training`,
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
    url: `/chat/as_admin/${chatId}/retry/`,
    method: "POST",
  });

  return {
    retryChat: load,
    data: data,
    success,
  };
};

export const useMarkChatAsReviewed = (
  {
    chatId,
    username,
  }: {
    chatId: number | string;
    username: string;
  },
  config?: Partial<UseFetchConfig<{ username: string }, Chat>>
) => {
  const { load, data, success } = useFetch<{ username: string }, Chat>({
    ...config,
    url: `/chat/as_admin/${chatId}/reviewed/`,
    method: "POST",
    body: { username },
  });

  return {
    markChatAsReviewed: load,
    data: data,
    success,
  };
};
