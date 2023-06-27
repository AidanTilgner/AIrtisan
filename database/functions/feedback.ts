import { Feedback } from "../models/feedback";
import { dataSource } from "..";
import { Logger } from "../../utils/logger";
import { getAdmin } from "./admin";

const feedbackRepository = () => dataSource.getRepository(Feedback);

const feedbackLogger = new Logger({
  name: "Feedback",
});

export const createFeedback = async (feedback: {
  feedback: Feedback["feedback"];
  admin: number | Feedback["admin"];
  type: Feedback["type"];
}) => {
  try {
    const admin =
      typeof feedback.admin === "number"
        ? await getAdmin(feedback.admin)
        : feedback.admin;

    if (!admin) {
      feedbackLogger.error("Admin not found.");
      return null;
    }

    const newFeedback = await feedbackRepository().create({
      feedback: feedback.feedback,
      admin: admin,
      type: feedback.type,
    });

    await feedbackRepository().save(newFeedback);

    return newFeedback;
  } catch (error) {
    feedbackLogger.error("Error creating feedback: ", error);
    return null;
  }
};

export const getFeedback = async (id: Feedback["id"]) => {
  try {
    const feedback = await feedbackRepository().findOne({
      where: {
        id: id,
      },
    });

    if (!feedback) {
      feedbackLogger.error("Feedback not found.");
      return null;
    }

    return feedback;
  } catch (error) {
    feedbackLogger.error("Error fetching feedback: ", error);
    return null;
  }
};

export const getAllFeedback = async () => {
  try {
    const feedback = await dataSource.manager.find(Feedback);

    return feedback;
  } catch (error) {
    feedbackLogger.error("Error fetching feedback: ", error);
    return null;
  }
};

export const markFeedbackAsReviewed = async (
  id: Feedback["id"],
  review_message: Feedback["review_message"],
  reviewer: Feedback["reviewer"]
) => {
  try {
    const feedback = await feedbackRepository().findOne({
      where: {
        id: id,
      },
    });

    if (!feedback) {
      feedbackLogger.error("Feedback not found.");
      return null;
    }

    feedback.review_message = review_message;
    feedback.reviewer = reviewer;

    await feedbackRepository().save(feedback);

    return feedback;
  } catch (error) {
    feedbackLogger.error("Error updating feedback: ", error);
    return null;
  }
};
