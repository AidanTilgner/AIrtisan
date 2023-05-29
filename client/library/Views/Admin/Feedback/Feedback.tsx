import React from "react";
import styles from "./Feedback.module.scss";
import { useGetAllFeedback } from "../../../hooks/fetching/operations";
import { Chip, Grid, Title } from "@mantine/core";
import FeedbackCard from "../../../components/Cards/Feedback/FeedbackCard";
import Search from "../../../components/Search/Search";
import { useSearch } from "../../../contexts/Search";

function Feedback() {
  const { data: allFeedback } = useGetAllFeedback({
    runOnMount: true,
  });

  const { query } = useSearch();

  const [showReviewed, setShowReviewed] = React.useState(false);

  const filteredFeedback = allFeedback?.filter((feedback) => {
    const passedShowReviewed = showReviewed ? true : !feedback.reviewer;

    const passesQuery =
      feedback.feedback.toLowerCase().includes(query.toLowerCase()) ||
      feedback.type.toLowerCase().includes(query.toLowerCase()) ||
      feedback.admin.email.toLowerCase().includes(query.toLowerCase());
    return passedShowReviewed && passesQuery;
  });

  return (
    <div className={styles.Feedback}>
      <Grid>
        <Grid.Col span={12}>
          <Title order={2}>Feedback</Title>
        </Grid.Col>
        <Grid.Col span={12}>
          <Search />
        </Grid.Col>
        <Grid.Col span={12}>
          <div className={styles.filters}>
            <div className={styles.filter}>
              <Chip
                onClick={() => {
                  setShowReviewed(!showReviewed);
                }}
                checked={showReviewed}
              >
                Show Reviewed
              </Chip>
            </div>
          </div>
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12} />
        <Grid.Col span={12}>
          {filteredFeedback && filteredFeedback?.length > 0 ? (
            <div className={styles.Feedback__container}>
              {filteredFeedback.map((feedback) => {
                return <FeedbackCard feedback={feedback} key={feedback.id} />;
              })}
            </div>
          ) : (
            <p>There is no feedback to display.</p>
          )}
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Feedback;
