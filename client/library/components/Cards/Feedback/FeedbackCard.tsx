import React from "react";
import { Feedback } from "../../../../documentation/main";

interface FeedbackCardProps {
  feedback: Feedback;
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
  return <div>{feedback.feedback}</div>;
}

export default FeedbackCard;
