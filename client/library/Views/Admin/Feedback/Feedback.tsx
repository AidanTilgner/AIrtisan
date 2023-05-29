import React from "react";
import styles from "./Feedback.module.scss";
import { useGetAllFeedback } from "../../../hooks/fetching/operations";
import { Grid, Title } from "@mantine/core";
import FeedbackCard from "../../../components/Cards/Feedback/FeedbackCard";

function Feedback() {
  const { data: allFeedback } = useGetAllFeedback({
    runOnMount: true,
  });

  return (
    <div className={styles.Feedback}>
      <Grid>
        <Grid.Col span={12}>
          <Title order={2}>Feedback</Title>
        </Grid.Col>
        <Grid.Col span={12}>
          <div className={styles.Feedback__container}>
            {allFeedback?.map((feedback) => {
              return <FeedbackCard feedback={feedback} key={feedback.id} />;
            })}
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Feedback;
