import axios, { AxiosError } from "axios";
import { showNotification } from "@mantine/notifications";
import { logout } from "../auth";

export const api = axios.create({
  baseURL: "/",
  withCredentials: true,
  headers: {
    "x-access-token": localStorage.getItem("accessToken"),
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    // Check for 401 Unauthorized error
    if (error.response?.status === 401) {
      try {
        // Attempt to refresh the access token
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          // Retry the original request with the new access token
          showNotification({
            title: "Error handled",
            message: "An error occurred, but it was handled",
          });
          if (error.config?.headers) {
            error.config.headers["x-access-token"] = newAccessToken;
            return axios.request(error.config);
          }
          return Promise.reject(error);
        } else {
          // Clear the user's session and redirect to the login page
          logout();
        }
      } catch (refreshError) {
        // Refresh token failed, clear the user's session and redirect to the login page
        console.error(refreshError);
        logout();
      }
    }
    // Pass the error along to the caller
    return Promise.reject(error);
  }
);

export const retrainModel = async () => {
  return await api
    .post("/training/retrain")
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Model has been refreshed",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const getAnswer = async (text: string) => {
  return await api
    .post("/nlu/say", {
      text,
    })
    .then((res) => res.data.data)
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const refreshAndAnswer = async (text: string) => {
  return await api
    .post("/testing/say", {
      text,
      retrain: true,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Model has been refreshed",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return;
    });
};

export const getTrainingAnswer = async (text: string) => {
  return await api
    .post("/training/say", {
      text,
    })
    .then((res) => res.data.data)
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const addDataPoint = async ({
  intent,
  utterances,
  answers,
}: {
  intent: string;
  utterances: string[];
  answers: string[];
}) => {
  return await api
    .post("/training/datapoint", {
      intent,
      utterances,
      answers,
      retrain: true,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Data point added, model will be refreshed soon",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const removeAnswerFromIntent = async ({
  intent,
  answer,
}: {
  intent: string;
  answer: string;
}) => {
  return await api
    .delete("/training/response", {
      data: {
        intent,
        answer,
        retrain: true,
      },
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Answer removed from intent",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const addAnswerToIntent = async ({
  intent,
  answer,
}: {
  intent: string;
  answer: string;
}) => {
  return await api
    .put("/training/response", {
      intent,
      answer,
      retrain: true,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Answer added to intent",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const addOrUpdateUtteranceOnIntent = async ({
  old_intent,
  new_intent,
  utterance,
}: {
  old_intent: string;
  new_intent: string;
  utterance: string;
}) => {
  return await api
    .put("/training/intent", {
      old_intent,
      new_intent,
      utterance,
      retrain: true,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Utterance added to intent",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const getAllIntents = async () => {
  return await api
    .get("/training/intents")
    .then((res) => res.data.data)
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const addUtteranceToIntent = async ({
  intent,
  utterance,
}: {
  intent: string;
  utterance: string;
}) => {
  return await api
    .put("/training/utterance", {
      intent,
      utterance,
      retrain: true,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Utterance added to intent",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const removeUtteranceFromIntent = async ({
  intent,
  utterance,
}: {
  intent: string;
  utterance: string;
}) => {
  return await api
    .delete("/training/utterance", {
      data: {
        intent,
        utterance,
        retrain: true,
      },
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Utterance removed from intent",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const updateEnhaceForIntent = async ({
  intent,
  enhance,
}: {
  intent: string;
  enhance: boolean;
}) => {
  return await api
    .put(`/training/intent/${intent}/enhance`, {
      enhance,
      retrain: false,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: enhance
          ? "Intent will be enhanced"
          : "Intent will not be enhanced",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const updateButtonsOnIntent = async ({
  intent,
  buttons,
}: {
  intent: string;
  buttons: string[];
}) => {
  return await api
    .put(`/training/intent/${intent}/buttons`, {
      buttons,
      retrain: false,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Buttons updated",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const removeButtonFromIntent = async ({
  intent,
  button,
}: {
  intent: string;
  button: string;
}) => {
  return await api
    .delete(`/training/intent/${intent}/button`, {
      data: {
        button,
        retrain: false,
      },
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Button removed",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const getAllButtons = async () => {
  return await api
    .get("/training/buttons")
    .then((res) => res.data.data)
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const postChat = async ({
  message,
  session_id,
}: {
  message: string;
  session_id: string;
}) => {
  return await api
    .post("/chat/as_admin", {
      message,
      session_id,
    })
    .then((res) => res.data.data)
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
    });
};

export const markChatAsShouldReview = async ({
  chat_id,
  reason,
}: {
  chat_id: string;
  reason: string;
}) => {
  return await api
    .post(`/chat/as_admin/${chat_id}/should_review`, {
      review_message: reason,
    })
    .then((res) => {
      showNotification({
        title: "Success",
        message: "Chat marked as should review",
      });
      return res.data.data;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const checkAuth = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    return await api
      .post("/auth/check", {
        access_token: accessToken,
      })
      .then((res) => {
        return res.data.data.authenticated;
      })
      .catch((err) => {
        console.error(err);
        showNotification({
          title: "Error",
          message: "Something went wrong",
        });
        return err;
      });
  }
  return false;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    return await api
      .post("/auth/refresh", {
        refresh_token: refreshToken,
      })
      .then((res) => {
        localStorage.setItem("accessToken", res.data.data.access_token);
        return res.data.data.access_token;
      })
      .catch((err) => {
        console.error(err);
        showNotification({
          title: "Error",
          message: "Something went wrong",
        });
        return false;
      });
  }
  return false;
};

export const checkIsSuperAdmin = async () => {
  return await api
    .post("/auth/is_super_admin")
    .then((res) => {
      return res.data.data.is_super_admin;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};

export const getMe = async () => {
  return await api
    .get("/auth/me")
    .then((res) => {
      return res.data.data.admin;
    })
    .catch((err) => {
      console.error(err);
      showNotification({
        title: "Error",
        message: "Something went wrong",
      });
      return err;
    });
};
