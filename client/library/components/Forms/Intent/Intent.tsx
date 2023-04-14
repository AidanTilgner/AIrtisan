import React from "react";
import { addDataPoint } from "../../../helpers/fetching";
import styles from "./Intent.module.scss";
import { CorpusDataPoint } from "../../../../documentation/main";
import { Button, Checkbox, Flex, Grid, Group, TextInput } from "@mantine/core";
import { Plus } from "phosphor-react";
import { showNotification } from "@mantine/notifications";

function Intent({
  afterSubmit,
  type,
  onClose,
}: {
  afterSubmit: (data: CorpusDataPoint) => void;
  type: "add" | "update" | "both";
  onClose?: () => void;
}) {
  const handleSubmit = (data: CorpusDataPoint) => {
    afterSubmit(data);
  };

  const formToShow = () => {
    switch (type) {
      case "add":
        return <AddIntent onClose={onClose} afterSubmit={handleSubmit} />;
      case "update":
        return <UpdateIntent afterSubmit={handleSubmit} />;
      case "both":
        return (
          <>
            <AddIntent afterSubmit={handleSubmit} onClose={onClose} />
            <UpdateIntent afterSubmit={handleSubmit} />
          </>
        );
    }
  };

  return (
    <div className={styles.intentForm}>
      <p className={styles.resources}>
        If you have questions, consider reading up on{" "}
        <a href="/documentation">the documentation</a>.
      </p>
      {formToShow()}
    </div>
  );
}

export default Intent;

function AddIntent({
  afterSubmit,
  onClose,
}: {
  afterSubmit: (data: CorpusDataPoint) => void;
  onClose?: () => void;
}) {
  const [formData, setFormData] = React.useState<Partial<CorpusDataPoint>>();

  const [newUtterance, setNewUtterance] = React.useState<string>("");
  const [newAnswer, setNewAnswer] = React.useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handleSubmit = async () => {
    const formIsFilled =
      formData?.intent &&
      formData?.utterances?.length &&
      formData?.answers?.length;

    if (!formIsFilled || !formData) {
      showNotification({
        title: "Validation Error",
        message: "Please fill out all fields.",
      });
    }

    const { success, data } = await addDataPoint({
      intent: formData?.intent || "",
      utterances: formData?.utterances || [],
      answers: formData?.answers || [],
      enhance: !!formData?.enhance,
    });

    if (!success || !data) {
      console.error("Error adding new intent", data);
      showNotification({
        title: "Error adding new intent",
        message: "There was an error adding the new intent. Please try again.",
      });
      return;
    }

    afterSubmit(data);
  };

  return (
    <div className={styles.intentAdd}>
      <Grid>
        <Grid.Col sm={12}>
          <h2>New Intent</h2>
        </Grid.Col>
        <Grid.Col sm={12}>
          <h3>When the user says...</h3>
        </Grid.Col>
        <Grid.Col sm={12} md={12}>
          <ul className={styles.list}>
            {formData?.utterances?.length ? (
              formData.utterances.map((utterance, index) => {
                return (
                  <li
                    key={index}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        utterances: formData?.utterances?.filter(
                          (u) => u !== utterance
                        ),
                      });
                    }}
                    title="Click to remove"
                  >
                    {utterance}
                  </li>
                );
              })
            ) : (
              <li className={styles.placeholder}>No utterances added yet.</li>
            )}
          </ul>
          <Flex align="end" justify="space-between" gap="sm">
            <TextInput
              label="New Utterance"
              type="text"
              name="utterance"
              id="utterance"
              onChange={(e) => {
                setNewUtterance(e.target.value);
              }}
              placeholder="Add an utterance..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!newUtterance) return;
                  setFormData({
                    ...formData,
                    utterances: [...(formData?.utterances || []), newUtterance],
                  });
                  setNewUtterance("");
                }
              }}
              value={newUtterance || ""}
              style={{ width: "100%" }}
            />
            <Button
              variant="outline"
              onClick={() => {
                if (!newUtterance) return;
                setFormData({
                  ...formData,
                  utterances: [...(formData?.utterances || []), newUtterance],
                });
                setNewUtterance("");
              }}
              title="Add this utterance"
            >
              <Plus size={18} />
            </Button>
          </Flex>
        </Grid.Col>
        <Grid.Col span={12}>
          <h3>Their goal is to...</h3>
        </Grid.Col>
        <Grid.Col sm={12} md={12}>
          <TextInput
            label="Intent Name..."
            type="text"
            name="intent"
            id="intent"
            onChange={(e) => {
              setFormData({ ...formData, intent: e.target.value });
            }}
            placeholder="Name the intent..."
          />
        </Grid.Col>
        <Grid.Col sm={12}>
          <h3>And the bot should respond with...</h3>
        </Grid.Col>
        <Grid.Col sm={12} md={12}>
          <ul className={styles.list}>
            {formData?.answers?.length ? (
              formData.answers.map((answer, index) => {
                return (
                  <li
                    key={index}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        answers: formData?.answers?.filter((a) => a !== answer),
                      });
                    }}
                    title="Click to remove"
                  >
                    {answer}
                  </li>
                );
              })
            ) : (
              <li className={styles.placeholder}>No answers added yet.</li>
            )}
          </ul>
          <Flex align="end" justify="space-between" gap="sm">
            <TextInput
              label="New Response..."
              type="text"
              name="answer"
              id="answer"
              onChange={(e) => {
                setNewAnswer(e.target.value);
              }}
              placeholder="Add an answer..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!newAnswer) return;
                  setFormData({
                    ...formData,
                    answers: [...(formData?.answers || []), newAnswer],
                  });
                  setNewAnswer("");
                }
              }}
              value={newAnswer || ""}
              style={{ width: "100%" }}
            />
            <Button
              variant="outline"
              onClick={() => {
                if (!newAnswer) return;
                setFormData({
                  ...formData,
                  answers: [...(formData?.answers || []), newAnswer],
                });
                setNewAnswer("");
              }}
              title="Add this answer"
            >
              <Plus size={18} />
            </Button>
          </Flex>
        </Grid.Col>
        <Grid.Col span={12}>
          <Checkbox
            label="Should these responses be enhanced?"
            name="enhanced"
            id="enhanced"
            onChange={(e) => {
              setFormData({ ...formData, enhance: e.target.checked });
            }}
            checked={!!formData?.enhance}
          />
        </Grid.Col>
        <Grid.Col sm={12} />
        <Grid.Col sm={12}>
          <Group position="right">
            <Button
              variant="outline"
              onClick={() => {
                setFormData(undefined);
                if (onClose) {
                  onClose();
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              onClick={() => {
                handleSubmit();
              }}
            >
              Save
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
    </div>
  );
}

function UpdateIntent({
  afterSubmit,
}: {
  afterSubmit: (data: CorpusDataPoint) => void;
}) {
  const [formData, setFormData] = React.useState<Partial<CorpusDataPoint>>();

  return <div className={styles.intentUpdate}>intent updates</div>;
}
