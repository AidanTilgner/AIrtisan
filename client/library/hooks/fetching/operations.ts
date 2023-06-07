import { Feedback } from "../../../documentation/main";
import useFetch, { UseFetchConfig } from "../useFetch";
import { Template } from "../../../documentation/main";

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

export const useGetAllFeedback = (
  config?: Partial<UseFetchConfig<undefined, Feedback[]>>
) => {
  const { load, data, success } = useFetch<undefined, Feedback[]>({
    ...config,
    url: `/operations/feedback/all`,
    method: "GET",
    useBotId: false,
  });

  return {
    getAllFeedback: load,
    data: data,
    success,
  };
};

export const useReviewFeedback = ({
  id,
  review_message,
}: {
  id: Feedback["id"];
  review_message: Feedback["review_message"];
}) => {
  const { load, data, success } = useFetch<
    { review_message: Feedback["review_message"] },
    Feedback
  >({
    url: `/operations/feedback/${id}/review`,
    method: "POST",
    body: {
      review_message,
    },
    useBotId: false,
  });

  return {
    reviewFeedback: load,
    data: data,
    success,
  };
};

export const useCreateTemplate = (
  {
    name,
    description,
    owner_id,
    owner_type,
    bot_id,
  }: Partial<Omit<Template, "visibility"> & { bot_id: number }>,
  config?: Partial<UseFetchConfig<Template, Template>>
) => {
  const { load, data, success } = useFetch<
    Partial<Omit<Template, "visibility"> & { bot_id: number }>,
    Template
  >({
    useBotId: false,
    ...config,
    url: `/operations/template`,
    method: "POST",
    body: {
      bot_id,
      name,
      description,
      owner_id,
      owner_type,
    },
  });

  return {
    createTemplate: load,
    data: data,
    success,
  };
};

export const useGetAllAdminTemplates = (
  config?: Partial<UseFetchConfig<undefined, Template[]>>
) => {
  const { load, data, success } = useFetch<undefined, Template[]>({
    ...config,
    url: `/operations/templates/all`,
    method: "GET",
    useBotId: false,
  });

  return {
    getAllAdminTemplates: load,
    data: data,
    success,
  };
};
