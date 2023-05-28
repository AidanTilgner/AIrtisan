import { Feedback } from "../../../documentation/main";
import useFetch, { UseFetchConfig } from "../useFetch";

export const useSubmitFeedback = (
  {
    feedback,
    type,
  }: {
    feedback: string;
    type: Feedback["type"];
  },
  config?: Partial<
    UseFetchConfig<{ feedback: string; type: Feedback["type"] }, Feedback>
  >
) => {
  const { load, data, success } = useFetch<
    { feedback: string; type: Feedback["type"] },
    Feedback
  >({
    ...config,
    url: `/operations/feedback`,
    method: "POST",
    body: {
      feedback,
      type,
    },
    useBotId: false,
  });

  return {
    submitFeedback: load,
    data: data,
    success,
  };
};
