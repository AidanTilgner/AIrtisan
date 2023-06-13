import {
  Context,
  Corpus,
  Feedback,
  Model,
} from "../../../../documentation/main";
import useFetch, { UseFetchConfig } from "../../useFetch";
import { Template } from "../../../../documentation/main";

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
    url: `/operations/templates`,
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
  const { load, data, success, loading } = useFetch<undefined, Template[]>({
    ...config,
    url: `/operations/templates/all`,
    method: "GET",
    useBotId: false,
  });

  return {
    getAllAdminTemplates: load,
    data: data,
    success,
    loading,
  };
};

export const useGetTemplate = (
  id: Template["id"],
  config?: Partial<UseFetchConfig<undefined, Template>>
) => {
  const { load, data, success, loading } = useFetch<undefined, Template>({
    ...config,
    url: `/operations/templates/${id}`,
    method: "GET",
    useBotId: false,
  });

  return {
    getTemplate: load,
    data: data,
    success,
    loading,
  };
};

export const useGetTemplateCorpus = (
  id: Template["id"],
  config?: Partial<UseFetchConfig<undefined, Corpus>>
) => {
  const { load, data, success, loading } = useFetch<undefined, Corpus>({
    ...config,
    url: `/operations/templates/${id}/corpus`,
    method: "GET",
    useBotId: false,
  });

  return {
    getTemplateCorpus: load,
    data: data,
    success,
    loading,
  };
};

export const useGetTemplateContext = (
  id: Template["id"],
  config?: Partial<UseFetchConfig<undefined, Context>>
) => {
  const { load, data, success, loading } = useFetch<undefined, Context>({
    ...config,
    url: `/operations/templates/${id}/context`,
    method: "GET",
    useBotId: false,
  });

  return {
    getTemplateContext: load,
    data: data,
    success,
    loading,
  };
};

export const useGetTemplateModelFile = (
  id: Template["id"],
  config?: Partial<UseFetchConfig<undefined, Model>>
) => {
  const { load, data, success, loading } = useFetch<undefined, Model>({
    ...config,
    url: `/operations/templates/${id}/model`,
    method: "GET",
    useBotId: false,
  });

  return {
    getTemplateModelFile: load,
    data: data,
    success,
    loading,
  };
};
