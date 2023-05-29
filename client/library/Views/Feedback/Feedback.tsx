import React, { useState } from "react";
import styles from "./Feedback.module.scss";
import { Button, Flex, Grid, Select, Textarea, Title } from "@mantine/core";
import { useSubmitFeedback } from "../../hooks/fetching/operations";
import { Feedback } from "../../../documentation/main";
import { showNotification } from "@mantine/notifications";
import { useNavigate } from "react-router-dom";

function Feedback() {
  const [formData, setFormData] = useState({
    feedback: "",
    type: "",
  });

  const { submitFeedback } = useSubmitFeedback(
    {
      feedback: formData.feedback,
      type: formData.type as Feedback["type"],
    },
    {
      dependencies: [formData],
    }
  );

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await submitFeedback();
      showNotification({
        title: "Success",
        message: "Your feedback has been submitted!",
      });
      setFormData({
        feedback: "",
        type: "",
      });
      navigate("/");
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message:
          "There was an error submitting your feedback. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <div className={styles.feedback}>
      <Grid>
        <Grid.Col span={12}>
          <Title order={1}>Give us some Feedback</Title>
        </Grid.Col>
      </Grid>
      <div className={styles.form}>
        <div className="form">
          <Grid>
            <Grid.Col span={12}>
              <p className="resources">
                We are always looking for ways to improve our product. If you
                have any feedback, please let us know!
              </p>
            </Grid.Col>
            <Grid.Col span={12}>
              <h3>Let us know how we can get better!</h3>
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea
                label="Message"
                placeholder="Your message here..."
                value={formData.feedback}
                onChange={(e) =>
                  setFormData({ ...formData, feedback: e.currentTarget.value })
                }
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Select
                label="Type"
                placeholder="Select an option"
                data={[
                  { value: "bug", label: "Bug" },
                  { value: "feature", label: "Feature Request" },
                  { value: "other", label: "Other" },
                ]}
                value={formData.type}
                onChange={(v) => {
                  if (!v) return;
                  setFormData({ ...formData, type: v });
                }}
              />
            </Grid.Col>
            <Grid.Col span={12} />
            <Grid.Col span={12}>
              <Flex align="center" justify="flex-end">
                <Button onClick={handleSubmit}>Submit</Button>
              </Flex>
            </Grid.Col>
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
