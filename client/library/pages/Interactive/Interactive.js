import React, { useEffect, useState } from "react";
import styles from "./Interactive.module.scss";
import withStyles from "react-css-modules";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  Loader,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import {
  getTrainingAnswer,
  addAnswerToIntent,
  removeAnswerFromIntent,
  addOrUpdateUtteranceOnIntent,
  getAllIntents,
  removeUtteranceFromIntent,
  addUtteranceToIntent,
  updateEnhaceForIntent,
  removeButtonFromIntent,
  updateButtonsOnIntent,
  getAllButtons,
} from "../../helpers/fetching";
import { showNotification } from "@mantine/notifications";
import { TrashSimple, Copy, Check, Lightning } from "phosphor-react";
import { copyToClipboard } from "../../helpers/utilities";
import { getShortenedMessage } from "../../helpers/formating";
import { useMediaQuery } from "@mantine/hooks";
import { useSearchParams } from "react-router-dom";

function Interactive() {
  const [text, setText] = useState(localStorage.getItem("lastText") || "");

  useEffect(() => {
    localStorage.setItem("lastText", text);
  }, [text]);

  const [data, setData] = useState({
    intent: "",
    answer: "",
    attachments: { buttons: [] },
    entities: [],
    initial_text: "",
    intent_data: {
      intent: "",
      utterances: [],
      answers: [],
      enhance: false,
      buttons: [],
    },
  });
  const [newAnswer, setNewAnswer] = useState("");
  const [newUtterance, setNewUtterance] = useState("");
  const [newIntent, setNewIntent] = useState(data.intent);
  const [newButton, setNewButton] = useState({ type: "" });
  const [allIntents, setAllIntents] = useState([]);
  const [allButtons, setAllButtons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllIntents().then((res) => {
      setAllIntents(res);
    });
    if (data.intent && data.intent !== newIntent) {
      setNewIntent(data.intent);
    }
  }, [data.intent]);

  useEffect(() => {
    getAllButtons().then((res) => {
      setAllButtons(res);
    });
  }, [data.intent]);

  const submitText = async () => {
    getTrainingAnswer(text).then((answer) => {
      setData(answer);
      showNotification({
        title: "Message Received",
        message: `You said: ${text}, and the bot said: ${getShortenedMessage(
          answer.answer
        )}`,
      });
    });
  };

  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  useEffect(() => {
    if (urlSearchParams.get("run")) {
      setText(urlSearchParams.get("run"));
      submitText();
    }
  }, []);

  const submitNewAnswer = async () => {
    addAnswerToIntent({
      intent: data.intent,
      answer: newAnswer,
    }).then(() => {
      setNewAnswer("");
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        submitText();
      }, 1500);
    });
  };

  const removeAnswer = async (answer) => {
    removeAnswerFromIntent({
      intent: data.intent,
      answer,
    }).then(() => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        submitText();
      }, 1500);
    });
  };

  const submitNewUtteranceForIntent = () => {
    addOrUpdateUtteranceOnIntent({
      old_intent: data.intent,
      new_intent: newIntent,
      utterance: text,
    }).then(() => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        submitText();
      }, 1500);
    });
  };

  const removeUtterance = (utterance) => {
    removeUtteranceFromIntent({
      intent: data.intent,
      utterance,
    }).then(() => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        submitText();
      }, 1500);
    });
  };

  const addUtterance = () => {
    addUtteranceToIntent({
      intent: data.intent,
      utterance: newUtterance,
    }).then(() => {
      setNewUtterance("");
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        submitText();
      }, 1500);
    });
  };

  const copy = (text) => {
    copyToClipboard(text);
    showNotification({
      title: "Copied to Clipboard",
      message: `Copied: ${text}`,
    });
  };

  const toggleEnhance = () => {
    updateEnhaceForIntent({
      intent: data.intent,
      enhance: !data.intent_data?.enhance,
    }).then((res) => {
      setData({
        ...data,
        intent_data: {
          ...data.intent_data,
          enhance: res.enhance,
        },
      });
    });
  };

  const deleteButton = (button) => {
    removeButtonFromIntent({
      intent: data.intent,
      button,
    }).then(() => {
      setLoading(true);
      setNewButton({ type: "" });
      setTimeout(() => {
        setLoading(false);
        submitText();
      }, 1500);
    });
  };

  const addNewButton = () => {
    const newButtons = [
      ...(data.intent_data?.buttons || []),
      {
        ...newButton,
        type: newButton.type.toLowerCase(),
      },
    ];

    updateButtonsOnIntent({
      intent: data.intent,
      buttons: newButtons,
    }).then(() => {
      setNewButton({ type: "" });
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        submitText();
      }, 1500);
    });
  };

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.Interactive}>
      <Grid
        gutter={isMobile ? 24 : 36}
        justify="space-between"
        align="space-between"
        style={{ width: "100%" }}
      >
        <Grid.Col
          span={12}
          sx={(theme) => ({
            display: "flex",
            justifyContent: "center",
          })}
        >
          <Card
            shadow={"lg"}
            withBorder
            bg={"white"}
            py={14}
            px={24}
            sx={(theme) => ({
              width: isMobile ? "100%" : "40%",
            })}
          >
            <Flex
              direction={"column"}
              align="flex-start"
              justify="space-around"
            >
              <Title order={3} style={{ marginBottom: "24px" }}>
                Say anything...
              </Title>
              <Flex
                direction={isMobile ? "column" : "row"}
                justify={"space-between"}
                style={{ width: "100%" }}
                gap={24}
              >
                <TextInput
                  placeholder="Type here"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitText(e);
                    }
                  }}
                  sx={() => ({ width: "100%" })}
                />
                <Button onClick={submitText}>Say it</Button>
              </Flex>
            </Flex>
          </Card>
        </Grid.Col>
        {data?.answer.length > 0 && (
          <>
            <Grid.Col span={isMobile ? 12 : 6}>
              <Grid>
                <Grid.Col span={12}>
                  <Box
                    sx={(theme) => ({
                      border: `1px solid ${theme.colors.gray[3]}`,
                      padding: "24px 36px",
                      boxShadow: "inset .2px .2px 18px rgba(0, 0, 0, 0.1)",
                    })}
                  >
                    <Flex direction="column" align="flex-start">
                      <div
                        className={`${styles.chat_bubble} ${styles.chat_out}`}
                      >
                        <Text weight={500}>{data?.initial_text}</Text>
                      </div>
                      <div
                        className={`${styles.chat_bubble} ${styles.chat_in}`}
                      >
                        <Text weight={500}>{data?.answer}</Text>
                      </div>
                    </Flex>
                  </Box>
                </Grid.Col>
              </Grid>
            </Grid.Col>
            <Grid.Col span={isMobile ? 12 : 6}>
              <Text
                size="md"
                weight={500}
                sx={() => ({
                  textAlign: "left",
                  marginBottom: "14px",
                })}
              >
                When you say "{data?.initial_text}", you have the intent "
                {data.intent}":
              </Text>

              <Flex
                justify={"space-between"}
                gap={24}
                sx={() => ({ marginTop: "14px" })}
              >
                <Autocomplete
                  placeholder={`Update intent for "${data?.initial_text}"`}
                  value={newIntent}
                  onChange={(v) => setNewIntent(v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitNewUtteranceForIntent(e);
                    }
                  }}
                  size="sm"
                  sx={() => ({ width: "100%" })}
                  data={allIntents}
                />
                <Button
                  size="sm"
                  onClick={submitNewUtteranceForIntent}
                  disabled={!data.intent.length}
                  title={
                    data.intent === newIntent
                      ? "Confirm this intent is correct."
                      : "This utterance should have a different intent."
                  }
                >
                  {data.intent === newIntent ? <Check size={16} /> : "Update"}
                </Button>
              </Flex>
              <Checkbox
                label="Enhance answers on this intent."
                checked={data.intent_data?.enhance || false}
                onChange={(e) => toggleEnhance()}
                sx={() => ({ marginTop: "24px" })}
              />
            </Grid.Col>
            <Grid.Col span={isMobile ? 12 : 6}>
              <Text
                size="md"
                weight={500}
                sx={() => ({
                  textAlign: "left",
                  marginBottom: "14px",
                })}
              >
                When you say one of the following phrases, you have the intent "
                {data.intent}"
              </Text>
              <Box
                className={styles.utterances}
                sx={() => ({ textAlign: "left" })}
              >
                {data?.intent_data?.utterances.map((utterance, index) => {
                  return (
                    <Text
                      key={utterance + Math.random()}
                      className={styles.utterance}
                      weight={400}
                      size="sm"
                    >
                      <span onClick={() => copy(utterance)}>{utterance}</span>
                      <div className={styles.utterance_icons}>
                        <div
                          className={`${styles.utterance_delete} ${styles.utterance_icon}`}
                          title="Remove utterance"
                          onClick={() => removeUtterance(utterance)}
                        >
                          <TrashSimple size={12} />
                        </div>
                        <div
                          className={`${styles.utterance_copy} ${styles.utterance_icon}`}
                          title="Copy utterance"
                          onClick={() => {
                            copy(utterance);
                          }}
                        >
                          <Copy size={12} />
                        </div>
                        <div
                          className={`${styles.utterance_run} ${styles.utterance_icon}`}
                          title="Run utterance"
                          onClick={() => {
                            setText(utterance);
                            submitText();
                          }}
                        >
                          <Lightning size={12} />
                        </div>
                      </div>
                    </Text>
                  );
                })}
              </Box>
              <Flex
                justify={"space-between"}
                gap={24}
                sx={() => ({ marginTop: "14px" })}
              >
                <TextInput
                  placeholder={`Add an utterance for "${data?.intent}"`}
                  value={newUtterance}
                  onChange={(e) => setNewUtterance(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addUtterance(e);
                    }
                  }}
                  size="sm"
                  sx={() => ({ width: "100%" })}
                />
                <Button size="sm" onClick={addUtterance}>
                  Add
                </Button>
              </Flex>
            </Grid.Col>
            <Grid.Col span={isMobile ? 12 : 6}>
              <Text
                size="md"
                weight={500}
                sx={() => ({
                  textAlign: "left",
                  marginBottom: "14px",
                })}
              >
                When you have the intent "{data.intent}", Onyx will give one of
                the following answers:
              </Text>
              <Box
                className={styles.answers}
                sx={() => ({ textAlign: "left" })}
              >
                {data?.intent_data?.answers.map((answer, index) => {
                  return (
                    <Text
                      key={answer + Math.random()}
                      className={styles.answer}
                      weight={400}
                      size="sm"
                    >
                      <span
                        onClick={() =>
                          setData({
                            ...data,
                            answer,
                          })
                        }
                      >
                        {answer}
                      </span>
                      <div className={styles.answer_icons}>
                        <div
                          className={`${styles.answer_delete} ${styles.answer_icon}`}
                          title="Remove answer"
                          onClick={() => removeAnswer(answer)}
                        >
                          <TrashSimple size={12} />
                        </div>
                        <div
                          className={`${styles.answer_copy} ${styles.answer_icon}`}
                          title="Copy answer"
                          onClick={() => copy(answer)}
                        >
                          <Copy size={12} />
                        </div>
                      </div>
                    </Text>
                  );
                })}
              </Box>
              <Flex
                justify={"space-between"}
                gap={24}
                sx={() => ({ marginTop: "14px" })}
              >
                <Textarea
                  placeholder={`Add an answer for "${data?.initial_text}"`}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      submitNewAnswer(e);
                    }
                  }}
                  size="sm"
                  sx={() => ({ width: "100%" })}
                />
                <Button size="sm" onClick={submitNewAnswer}>
                  Add
                </Button>
              </Flex>
            </Grid.Col>
            <Grid.Col span={isMobile ? 12 : 6}>
              <Text
                size="md"
                weight={500}
                sx={() => ({
                  textAlign: "left",
                  marginBottom: "14px",
                })}
              >
                When you have the intent "{data.intent}",
                {data.intent_data?.buttons?.length
                  ? " these buttons will be sent to the client:"
                  : " you can have buttons sent to the client:"}
              </Text>
              {/* buttons are objects formatted like {type: "buttontype"} */}
              <Box
                className={styles.buttons}
                sx={() => ({ textAlign: "left" })}
              >
                {data?.intent_data?.buttons?.map((button, index) => {
                  return (
                    <Text
                      key={button + Math.random()}
                      className={styles.button}
                      weight={400}
                      size="sm"
                    >
                      <Button
                        size="sm"
                        sx={() => ({
                          display: "inline-block",
                        })}
                        variant="light"
                      >
                        {button.type}
                      </Button>
                      <div className={styles.button_icons}>
                        <div
                          className={`${styles.button_delete} ${styles.button_icon}`}
                          title="Remove button"
                          onClick={() => deleteButton(button)}
                        >
                          <TrashSimple size={12} />
                        </div>
                      </div>
                    </Text>
                  );
                })}
              </Box>
              <Flex
                justify={"space-between"}
                gap={24}
                sx={() => ({ marginTop: "14px" })}
              >
                <Autocomplete
                  placeholder={`Add a button for "${data?.initial_text}"`}
                  value={newButton.type}
                  onChange={(e) =>
                    setNewButton({
                      type: e,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addNewButton();
                    }
                  }}
                  size="sm"
                  sx={() => ({ width: "100%" })}
                  data={allButtons.map((btn) => {
                    return { label: btn.type, value: btn.type };
                  })}
                />
                <Button size="sm" onClick={addNewButton}>
                  Add
                </Button>
              </Flex>
            </Grid.Col>
          </>
        )}
      </Grid>
    </div>
  );
}

export default withStyles(styles)(Interactive);
