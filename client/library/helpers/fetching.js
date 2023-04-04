import axios from "axios";
import { showNotification } from "@mantine/notifications";

export const api = axios.create({
  baseURL: "/",
  withCredentials: true,
});

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

export const getAnswer = async (text) => {
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

export const refreshAndAnswer = async (text) => {
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

export const getTrainingAnswer = async (text) => {
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

export const addDataPoint = async ({ intent, utterances, answers }) => {
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

export const removeAnswerFromIntent = async ({ intent, answer }) => {
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

export const addAnswerToIntent = async ({ intent, answer }) => {
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

export const addUtteranceToIntent = async ({ intent, utterance }) => {
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

export const removeUtteranceFromIntent = async ({ intent, utterance }) => {
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

export const updateEnhaceForIntent = async ({ intent, enhance }) => {
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

export const updateButtonsOnIntent = async ({ intent, buttons }) => {
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

export const removeButtonFromIntent = async ({ intent, button }) => {
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
