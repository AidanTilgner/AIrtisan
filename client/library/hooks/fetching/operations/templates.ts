import {
  ButtonType,
  Corpus,
  CorpusDataPoint,
} from "../../../../documentation/main";
import useFetch, { UseFetchConfig } from "../../useFetch";

export const useAddAnswerToIntent = (
  {
    template_id,
    intent,
    answer,
  }: { intent: string; answer: string; template_id: string | number },
  config?: Partial<
    UseFetchConfig<{ intent: string; answer: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; answer: string },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents/response`,
    method: "POST",
    body: { intent, answer },
  });

  return {
    addAnswerToIntent: load,
    data: data,
    success,
  };
};

export const useAddUtteranceToIntent = (
  {
    intent,
    utterance,
    template_id,
  }: { intent: string; utterance: string; template_id: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; utterance: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; utterance: string },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents/utterance`,
    method: "POST",
    body: { intent, utterance },
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
    useBotId: false,
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
  { intent, template_id }: { intent: string; template_id: string },
  config?: Partial<UseFetchConfig<CorpusDataPoint, CorpusDataPoint>>
) => {
  const { load, data, success } = useFetch<{ intent: string }, CorpusDataPoint>(
    {
      useBotId: false,
      ...config,
      url: `/operations/templates/${template_id}/corpus/intents`,
      method: "DELETE",
      body: { intent },
    }
  );

  return {
    deleteDataPoint: load,
    data: data,
    success,
  };
};

export const useRenameIntent = (
  {
    intent,
    newIntent,
    template_id,
  }: { intent: string; newIntent: string; template_id: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; newIntent: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { old_intent: string; new_intent: string },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents/rename`,
    method: "PUT",
    body: { old_intent: intent, new_intent: newIntent },
  });

  return {
    renameIntent: load,
    data: data,
    success,
  };
};

export const useUpdateButtonsOnIntent = (
  {
    intent,
    buttons,
    template_id,
  }: { intent: string; buttons: ButtonType[]; template_id: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; buttons: ButtonType[] }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { buttons: ButtonType[]; intent: string },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents/buttons`,
    method: "PUT",
    body: { buttons, intent },
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
    { enhance: boolean },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/training/intent/${intent}/enhance`,
    method: "PUT",
    body: { enhance },
  });

  return {
    updateEnhanceForIntent: load,
    data: data,
    success,
  };
};

export const useRemoveUtteranceFromIntent = (
  {
    intent,
    utterance,
    template_id,
  }: { intent: string; utterance: string; template_id: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; utterance: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; utterance: string },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents/utterance`,
    method: "DELETE",
    body: { intent, utterance },
  });

  return {
    removeUtteranceFromIntent: load,
    data: data,
    success,
  };
};

export const useRemoveAnswerFromIntent = (
  {
    intent,
    answer,
    template_id,
  }: { intent: string; answer: string; template_id: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; answer: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; answer: string },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents/response`,
    method: "DELETE",
    body: { intent, answer },
  });

  return {
    removeAnswerFromIntent: load,
    data: data,
    success,
  };
};

export const useRemoveButtonFromIntent = (
  {
    intent,
    button,
    template_id,
  }: { intent: string; button: ButtonType; template_id: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; button: ButtonType }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; button: ButtonType },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents/button`,
    method: "DELETE",
    body: { intent, button },
  });

  return {
    removeButtonFromIntent: load,
    data: data,
    success,
  };
};

export const useRemoveContextFromIntent = (
  {
    intent,
    context,
    template_id,
  }: { intent: string; context: string; template_id: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; context: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; context: string },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents/context`,
    method: "DELETE",
    body: { intent, context },
  });

  return {
    removeContextFromIntent: load,
    data: data,
    success,
  };
};

export const useAddContextToIntent = (
  {
    intent,
    context,
    template_id,
  }: { intent: string; context: string; template_id: string },
  config?: Partial<
    UseFetchConfig<{ intent: string; context: string }, CorpusDataPoint>
  >
) => {
  const { load, data, success } = useFetch<
    { intent: string; context: string; retrain: boolean },
    CorpusDataPoint
  >({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents/context`,
    method: "POST",
    body: { intent, context, retrain: true },
  });

  return {
    addContextToIntent: load,
    data: data,
    success,
  };
};

export const useAddDataPoint = (
  {
    intent,
    utterances,
    answers,
    buttons,
    enhance,
    template_id,
  }: CorpusDataPoint & { template_id: string },
  config?: Partial<UseFetchConfig<CorpusDataPoint, Corpus>>
) => {
  interface CorpusDataPointWithRetrain extends CorpusDataPoint {
    retrain: boolean;
  }

  const { load, data, success } = useFetch<CorpusDataPointWithRetrain, Corpus>({
    useBotId: false,
    ...config,
    url: `/operations/templates/${template_id}/corpus/intents`,
    method: "POST",
    body: { intent, utterances, answers, buttons, enhance, retrain: true },
  });

  return {
    addDataPoint: load,
    data: data,
    success,
  };
};
