import React, { useCallback, useEffect } from "react";
// import { addDataPoint, getAllIntentsFull } from "../../../helpers/fetching";
import styles from "./Intent.module.scss";
import { Corpus, CorpusDataPoint } from "../../../../documentation/main";
import {
  Button,
  Checkbox,
  Flex,
  Grid,
  Group,
  SegmentedControl,
  Select,
  TextInput,
} from "@mantine/core";
import { Plus, X } from "@phosphor-icons/react";
import { showNotification } from "@mantine/notifications";
import { filterDuplicatesForStrings } from "../../../helpers/methods";
import { useAddDataPoint } from "../../../hooks/fetching/common";
import useFetch from "../../../hooks/useFetch";

function Intent({
  afterSubmit,
  type,
  onClose,
  loadedUtterances,
  loadedIntent,
  preSelectedForEither,
}: {
  afterSubmit: (intent: string, data: Corpus) => void;
  type: "add" | "update" | "either";
  onClose?: () => void;
  loadedUtterances?: string[];
  loadedIntent?: string;
  preSelectedForEither?: "new" | "existing";
}) {
  const handleSubmit = (intent: string, data: Corpus) => {
    afterSubmit(intent, data);
  };

  const formToShow = () => {
    switch (type) {
      case "add":
        return (
          <AddIntent
            onClose={onClose}
            afterSubmit={handleSubmit}
            loadedUtterances={loadedUtterances}
          />
        );
      case "update":
        return (
          <UpdateIntent
            afterSubmit={handleSubmit}
            loadedUtterances={loadedUtterances}
            loadedIntent={loadedIntent}
            onClose={onClose}
          />
        );
      case "either":
        return (
          <EitherForm
            afterSubmit={handleSubmit}
            loadedUtterances={loadedUtterances}
            loadedIntent={loadedIntent}
            preSelectForEither={preSelectedForEither}
            onClose={onClose}
          />
        );
    }
  };

  return (
    <div className={styles.intentForm}>
      <p className={styles.resources}>
        If you have questions, consider reading up on{" "}
        <a
          href="https://docs.airtisan.app/docs/basics/understanding-intents"
          target="_blank"
          rel="noreferrer"
        >
          the documentation
        </a>
        .
      </p>
      {formToShow()}
    </div>
  );
}

export default Intent;

function EitherForm({
  afterSubmit,
  loadedUtterances,
  loadedIntent,
  preSelectForEither,
  onClose,
}: {
  afterSubmit: (intent: string, data: Corpus) => void;
  loadedUtterances?: string[];
  loadedIntent?: string;
  preSelectForEither?: "new" | "existing";
  onClose?: () => void;
}) {
  const [formType, setFormType] = React.useState<"new" | "existing">(
    preSelectForEither || "new"
  );

  const formToShow = () => {
    switch (formType) {
      case "new":
        return (
          <AddIntent
            afterSubmit={afterSubmit}
            loadedUtterances={loadedUtterances}
            onClose={onClose}
          />
        );
      case "existing":
        return (
          <UpdateIntent
            afterSubmit={afterSubmit}
            loadedUtterances={loadedUtterances}
            loadedIntent={loadedIntent}
            onClose={onClose}
          />
        );
    }
  };

  return (
    <div className={styles.eitherForm}>
      <div className={styles.eitherFormHeader}>
        <SegmentedControl
          title="New or Existing"
          data={[
            { label: "New Intent", value: "new" },
            { label: "Update Existing", value: "existing" },
          ]}
          value={formType || "new"}
          onChange={(value) => setFormType(value as "new" | "existing")}
        />
      </div>
      <div>{formToShow()}</div>
    </div>
  );
}

function AddIntent({
  afterSubmit,
  onClose,
  loadedUtterances,
}: {
  afterSubmit: (intent: string, data: Corpus) => void;
  onClose?: () => void;
  loadedUtterances?: string[];
}) {
  const [formData, setFormData] = React.useState<Partial<CorpusDataPoint>>();

  useEffect(() => {
    setFormData({
      ...formData,
      utterances: loadedUtterances || [],
    });
  }, [loadedUtterances]);

  const [newUtterance, setNewUtterance] = React.useState<string>("");
  const [newAnswer, setNewAnswer] = React.useState<string>("");

  const { addDataPoint } = useAddDataPoint({
    intent: formData?.intent || "",
    utterances: formData?.utterances || [],
    answers: formData?.answers || [],
    enhance: !!formData?.enhance,
  });

  const handleSubmit = async () => {
    if (!formData?.intent) {
      showNotification({
        title: "Validation Error",
        message: "Please fill out the intent.",
        color: "red",
      });
      return;
    }

    if (!formData?.utterances?.length) {
      showNotification({
        title: "Validation Error",
        message: "Please add at least one utterance.",
        color: "red",
      });
      return;
    }

    if (!formData?.answers?.length) {
      showNotification({
        title: "Validation Error",
        message: "Please add at least one answer.",
        color: "red",
      });
      return;
    }

    const response = await addDataPoint();

    if (!response?.success || !response?.data) {
      console.error("Error adding new intent", response?.error);
      showNotification({
        title: "Error adding new intent",
        message: "There was an error adding the new intent. Please try again.",
      });
      return;
    }

    const { success, data } = response;

    if (!success || !data) {
      console.error("Error adding new intent", data);
      showNotification({
        title: "Error adding new intent",
        message: "There was an error adding the new intent. Please try again.",
      });
      return;
    }

    afterSubmit(formData.intent || "", data);
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
                  <li key={index}>
                    {utterance}
                    <div className={styles.list_buttons}>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            utterances: formData?.utterances?.filter(
                              (u) => u !== utterance
                            ),
                          });
                        }}
                        className={styles.delete_button}
                      >
                        <X />
                      </button>
                    </div>
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
                    onClick={() => {
                      setFormData({
                        ...formData,
                        answers: formData?.answers?.filter((a) => a !== answer),
                      });
                    }}
                    title="Click to remove"
                    key={index}
                  >
                    {answer}
                    <div className={styles.list_buttons}>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            answers: formData?.answers?.filter(
                              (u) => u !== answer
                            ),
                          });
                        }}
                        className={styles.delete_button}
                      >
                        <X />
                      </button>
                    </div>
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
  loadedUtterances,
  onClose,
  loadedIntent,
}: {
  afterSubmit: (intent: string, data: Corpus) => void;
  loadedUtterances?: string[];
  onClose?: () => void;
  loadedIntent?: string;
}) {
  const [formData, setFormData] = React.useState<Partial<CorpusDataPoint>>();

  const [allIntents, setAllIntents] = React.useState<CorpusDataPoint[]>([]);

  useEffect(() => {
    if (loadedIntent) {
      handleOnIntentSelect(loadedIntent);
    } else {
      setFormData({
        ...formData,
        utterances: loadedUtterances || [],
        intent: loadedIntent || "",
      });
    }
  }, [loadedUtterances, loadedIntent, allIntents]);

  const [newUtterance, setNewUtterance] = React.useState<string>();
  const [newAnswer, setNewAnswer] = React.useState<string>();

  const { addDataPoint } = useAddDataPoint({
    intent: formData?.intent || "",
    utterances: formData?.utterances || [],
    answers: formData?.answers || [],
    enhance: !!formData?.enhance,
  });

  const handleSubmit = async () => {
    if (!formData?.intent) {
      showNotification({
        title: "Validation Error",
        message: "Please fill out the intent.",
        color: "red",
      });
      return;
    }

    if (!formData?.utterances?.length) {
      showNotification({
        title: "Validation Error",
        message: "Please add at least one utterance.",
        color: "red",
      });
      return;
    }

    if (!formData?.answers?.length) {
      showNotification({
        title: "Validation Error",
        message: "Please add at least one answer.",
        color: "red",
      });
      return;
    }

    const response = await addDataPoint();

    if (!response) {
      console.error("Error adding new intent", response);
      showNotification({
        title: "Error adding new intent",
        message: "There was an error adding the new intent. Please try again.",
      });
      return;
    }

    const { success, data } = response;

    if (!success || !data) {
      console.error("Error adding new intent", data);
      showNotification({
        title: "Error adding new intent",
        message: "There was an error adding the new intent. Please try again.",
      });
      return;
    }

    afterSubmit(formData.intent || "", data);
  };

  const onSuccess = useCallback((data: CorpusDataPoint[]) => {
    setAllIntents(data);
  }, []);

  useFetch<null, CorpusDataPoint[]>({
    url: "/training/intents/full",
    method: "GET",
    runOnMount: true,
    onSuccess,
  });

  const handleOnIntentSelect = (int: string) => {
    const selectedIntent = allIntents.find((i) => i.intent === int);
    if (!selectedIntent) return;
    const newUtterances = filterDuplicatesForStrings([
      ...(loadedUtterances || []),
      ...(selectedIntent.utterances || []),
    ]);
    const newAnswers = [
      ...(formData?.answers || []),
      ...(selectedIntent.answers || []),
    ];
    setFormData({
      ...formData,
      intent: int,
      utterances: newUtterances,
      answers: newAnswers,
    });
  };

  return (
    <div className={styles.intentUpdate}>
      <Grid>
        <Grid.Col sm={12}>
          <h2>Update Existing</h2>
        </Grid.Col>
        <Grid.Col span={12}>
          <h3>The user{"'"}s goal is...</h3>
        </Grid.Col>
        <Grid.Col sm={12} md={12}>
          <Select
            label="Intent Name..."
            type="text"
            name="intent"
            id="intent"
            onChange={(e) => {
              if (!e) return;
              handleOnIntentSelect(e);
            }}
            value={formData?.intent || ""}
            placeholder="Search for the intent..."
            data={allIntents.map((i) => ({
              label: i.intent,
              value: i.intent,
            }))}
            searchable
          />
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
                    <div className={styles.list_buttons}>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            utterances: formData?.utterances?.filter(
                              (u) => u !== utterance
                            ),
                          });
                        }}
                        className={styles.delete_button}
                      >
                        <X />
                      </button>
                    </div>
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
                    <div className={styles.list_buttons}>
                      <button
                        onClick={() => {
                          setFormData({
                            ...formData,
                            answers: formData?.answers?.filter(
                              (u) => u !== answer
                            ),
                          });
                        }}
                        className={styles.delete_button}
                      >
                        <X />
                      </button>
                    </div>
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
