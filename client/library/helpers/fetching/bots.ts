import { api } from "../axios";
import { Bot } from "../../../documentation/main";

export const getAllAdminBots = async () => {
  try {
    const response = await api.get(`/bots/all`);
    return response.data as {
      message: string;
      success: boolean;
      data: Bot[];
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Error fetching bots",
      success: false,
      data: [],
    };
  }
};

export const getAllBots = async () => {
  try {
    const response = await api.get(`/bots`);
    return response.data as {
      message: string;
      success: boolean;
      data: Bot[];
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Error fetching bots",
      success: false,
      data: [],
    };
  }
};

export const getBot = async (id: number) => {
  try {
    const response = await api.get(`/bots/${id}`);
    return response.data as {
      message: string;
      success: boolean;
      data: Bot;
    };
  } catch (error) {
    console.error(error);
    return {
      message: "Error fetching bot",
      success: false,
      data: null,
    };
  }
};
