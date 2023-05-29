import React, { useState } from "react";
import { Feedback } from "../../../../documentation/main";
import styles from "./FeedbackCard.module.scss";
import { MegaphoneSimple } from "@phosphor-icons/react";
import { getFormattedAdminName } from "../../../helpers/formating";
import { Button, Flex, TextInput } from "@mantine/core";
import { useReviewFeedback } from "../../../hooks/fetching/operations";
import { useModal } from "../../../contexts/Modals";
import { showNotification } from "@mantine/notifications";
import { useUser } from "../../../contexts/User";

interface FeedbackCardProps {
  feedback: Feedback;
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
  const { setModal, closeModal } = useModal();
  const { isSuperAdmin } = useUser();

  const handleReviewFeedback = () => {
    setModal({
      title: "Review Feedback",
      content: () => {
        const [reviewMessage, setReviewMessage] = useState("Reviewed");
        const { reviewFeedback } = useReviewFeedback({
          id: feedback.id as number,
          review_message: reviewMessage,
        });

        return (
          <div>
            <p>
              Type a message to send to the user who submitted this feedback.
            </p>
            <TextInput
              label="Review Message"
              value={reviewMessage}
              onChange={(e) => {
                setReviewMessage(e.currentTarget.value);
              }}
            />
            <br />
            <Flex align="center" justify="flex-end" gap="24px">
              <Button variant="default" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="filled"
                onClick={async () => {
                  const res = await reviewFeedback();
                  if (!res || !res.data || !res.success) {
                    showNotification({
                      title: "Error",
                      message: "Something went wrong",
                      color: "red",
                    });
                    return;
                  }
                  showNotification({
                    title: "Success",
                    message: `Feedback reviewed`,
                  });
                  closeModal();
                }}
                disabled={
                  reviewMessage.length < 1 || reviewMessage.length > 255
                }
              >
                Mark Reviewed
              </Button>
            </Flex>
          </div>
        );
      },
      type: "confirmation",
      buttons: [],
      onClose: closeModal,
      size: "md",
    });
  };

  return (
    <div className={styles.FeedbackCard}>
      <div className={styles.top}>
        <div className={styles.icon}>
          <MegaphoneSimple />
        </div>
        <div className={styles.name}>
          {getFormattedAdminName(feedback.admin)}
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.messages}>
          <p className={styles.feedback_message}>
            {getFormattedAdminName(feedback.admin)}: {feedback.feedback}
          </p>
          {feedback.reviewer && (
            <p className={styles.review_message}>
              {feedback.reviewer}: {feedback.review_message}
            </p>
          )}
        </div>
        <div className={styles.tags}>
          <div className={`${styles.tag}`}>{feedback.type}</div>
          {feedback.reviewer && (
            <div className={`${styles.tag} ${styles.reviewed}`}>reviewed</div>
          )}
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.buttons}>
          {isSuperAdmin && (
            <>
              <a
                key={"contact" + feedback.id}
                href={`mailto:${feedback.admin.email}?subject=${
                  feedback.admin.username
                }'s Feedback on AIrtisan&body=${`Hello, I'm writing concering your feedback: "${feedback.feedback}"`}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">Reach Out</Button>
              </a>
              {!feedback.reviewer && (
                <Button
                  key={"reviewed" + feedback.id}
                  onClick={handleReviewFeedback}
                >
                  Reviewed
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FeedbackCard;
