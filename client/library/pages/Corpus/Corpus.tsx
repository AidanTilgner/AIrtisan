import React, { useEffect, useLayoutEffect, useState } from "react";
import styles from "./Corpus.module.scss";
import {
  addAnswerToIntent,
  addUtteranceToIntent,
  deleteDataPoint,
  getAllButtons,
  getDefaultCorpus,
  removeAnswerFromIntent,
  removeButtonFromIntent,
  removeUtteranceFromIntent,
  renameIntent,
  updateButtonsOnIntent,
  updateEnhaceForIntent,
} from "../../helpers/fetching";
import {
  CorpusDataPoint,
  Corpus as CorpusType,
} from "../../../documentation/main";
import { showNotification } from "@mantine/notifications";
import Search from "../../components/Search/Search";
import { useSearch } from "../../contexts/Search";
import { Autocomplete, Button, Checkbox, Highlight } from "@mantine/core";
import { Check, PencilSimple, Plus, TrashSimple, X } from "phosphor-react";
import { useMediaQuery } from "@mantine/hooks";
import { useModal } from "../../contexts/Modals";

function Corpus() {
  const { query } = useSearch();

  const [fullCorpus, setFullCorpus] = React.useState<CorpusType>();

  const getData = () => {
    getDefaultCorpus()
      .then(({ success, data }) => {
        if (!success || !data) {
          console.error("Error fetching corpus");
          showNotification({
            title: "Error fetching corpus",
            message: "Please try again later",
          });
          return;
        }
        setFullCorpus(data);
      })
      .catch((err) => {
        console.error("Error fetching corpus", err);
        showNotification({
          title: "Error fetching corpus",
          message: "Please try again later",
        });
      });
  };

  React.useEffect(() => {
    getData();
  }, []);

  const reloadData = () => {
    setFullCorpus(undefined);
    getData();
  };

  const getFilteredData = () => {
    return fullCorpus?.data?.filter((dataPoint) => {
      const intentPassesQuery = dataPoint.intent.includes(query);
      const utterancesPassQuery = dataPoint.utterances.some((utterance) =>
        utterance.includes(query)
      );
      const answersPassQuery = dataPoint.answers.some((answer) =>
        answer.includes(query)
      );
      const enhancePassQuery =
        dataPoint.enhance && query.toLowerCase() === "enhance";
      const buttonsPassQuery = dataPoint.buttons?.some((button) =>
        button.type.includes(query)
      );

      const passesQuery =
        intentPassesQuery ||
        utterancesPassQuery ||
        answersPassQuery ||
        buttonsPassQuery ||
        enhancePassQuery;

      return passesQuery;
    });
  };

  useLayoutEffect(() => {
    (
      [
        ...document.getElementsByClassName(styles.intentContainer),
      ] as HTMLElement[]
    ).forEach((c, i) => {
      c.style.animationDelay = `${Math.log(i) * 0.25}s`;
    });
  }, [getFilteredData()]);

  const [openIntent, setOpenIntent] = React.useState<string | null>(null);

  const [allButtons, setAllButtons] = useState<{ type: string }[]>([]);

  useEffect(() => {
    getAllButtons().then(({ data, success }) => {
      if (success) {
        setAllButtons(data);
      } else {
        showNotification({
          title: "Error",
          message: "Error while fetching buttons",
        });
      }
    });
  }, []);

  return (
    <div className={styles.Corpus}>
      <header>
        <h1>
          {fullCorpus?.name || "Corpus"}
          <span>{fullCorpus?.locale}</span>
        </h1>
      </header>
      <div className={styles.searchArea}>
        <div className={styles.searchContainer}>
          <Search />
        </div>
      </div>
      <div className={styles.interface_container}>
        <div className={styles.data}>
          {getFilteredData()?.length ? (
            getFilteredData()?.map((dataPoint) => (
              <Intent
                intent={dataPoint.intent}
                utterances={dataPoint.utterances}
                answers={dataPoint.answers}
                buttons={dataPoint.buttons}
                enhance={dataPoint.enhance}
                setOpenIntent={setOpenIntent}
                openIntent={openIntent}
                key={dataPoint.intent + dataPoint.utterances.join("")}
                reloadData={reloadData}
                allButtons={allButtons}
              />
            ))
          ) : (
            <p className={styles.disclaimer}>No data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Corpus;

interface IntentProps extends CorpusDataPoint {
  setOpenIntent: (intent: string | null) => void;
  openIntent: string | null;
  reloadData: () => void;
  allButtons: { type: string }[];
}

export const Intent = ({
  intent,
  utterances,
  answers,
  buttons,
  enhance,
  setOpenIntent,
  openIntent,
  reloadData,
  allButtons,
}: IntentProps) => {
  const { query } = useSearch();

  const getTopText = () => {
    const intentString = intent;
    const shortedIntentString = intentString.substring(0, 24);
    const shortedIntentStringWithEllipsis =
      shortedIntentString + (intentString.length > 24 ? "..." : "");
    return shortedIntentStringWithEllipsis;
  };

  const getBottomText = () => {
    const utteranceString = utterances.join(", ");
    const shortedUtteranceString = utteranceString.substring(0, 36);
    const shortedUtteranceStringWithEllipsis =
      shortedUtteranceString + (utteranceString.length > 36 ? "..." : "");
    return shortedUtteranceStringWithEllipsis;
  };

  const { setModal, closeModal } = useModal();

  const isSelected = openIntent === intent;

  const [newUtterance, setNewUtterance] = React.useState<string>("");
  const [newAnswer, setNewAnswer] = React.useState<string>("");

  const handleAddUtterance = async () => {
    const { success } = await addUtteranceToIntent({
      intent,
      utterance: newUtterance,
    });

    if (success) {
      reloadData();
    }

    setNewUtterance("");
  };

  const handleAddAnswer = async () => {
    const { success } = await addAnswerToIntent({
      intent,
      answer: newAnswer,
    });

    if (success) {
      reloadData();
    }

    setNewAnswer("");
  };

  const handleDeleteIntent = async () => {
    setModal({
      title: "Delete intent",
      content: "Are you sure you want to delete this intent?",
      buttons: [
        {
          text: "Cancel",
          onClick: () => closeModal(),
          variant: "default",
        },
        {
          text: "Delete",
          onClick: async () => {
            const { success } = await deleteDataPoint(intent);

            if (success) {
              reloadData();
            }

            setOpenIntent(null);
            closeModal();
          },
          variant: "filled",
          color: "red",
        },
      ],
      type: "confirmation",
      onClose: () => closeModal(),
    });
  };

  const intentRef = React.useRef<HTMLDivElement>(null);

  const isMobile = useMediaQuery("(max-width: 768px)");

  useLayoutEffect(() => {
    if (isSelected && intentRef.current) {
      intentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: isMobile ? "center" : "center",
        // inline: "center"
      });
    }
  }, [isSelected]);

  const [isRenaming, setIsRenaming] = React.useState<boolean>(false);
  const [newName, setNewName] = React.useState<string>(intent);
  const [newButton, setNewButton] = React.useState<string>("");

  const handleRename = async () => {
    if (newName === intent) {
      setIsRenaming(false);
      return;
    }

    const { success } = await renameIntent({
      oldIntent: intent,
      newIntent: newName,
    });

    if (success) {
      reloadData();
    }

    setIsRenaming(false);
  };

  const handleAddButton = async () => {
    const existingButtons = buttons || [];

    const newButtons = [...existingButtons, { type: newButton }];

    const { success } = await updateButtonsOnIntent({
      intent,
      buttons: newButtons,
    });

    if (success) {
      reloadData();
    }
  };

  const handleSetEnhanced = async (value: boolean) => {
    const { success } = await updateEnhaceForIntent({
      intent,
      enhance: value,
    });

    if (success) {
      reloadData();
    }
  };

  return (
    <div
      className={`${styles.intentContainer} ${
        openIntent ? styles.intent_is_open : ""
      }`}
      ref={intentRef}
    >
      <div
        className={`${styles.intent} ${isSelected ? styles.selected : ""}`}
        tabIndex={0}
        onClick={() => {
          if (openIntent === intent) {
            setOpenIntent(null);
          } else {
            setOpenIntent(intent);
          }
        }}
      >
        <h3 className={styles.toptext}>
          <Highlight highlight={query.toLocaleLowerCase()}>
            {getTopText().toLocaleLowerCase()}
          </Highlight>
        </h3>
        <div className={styles.bottomtext}>
          <Highlight highlight={query.toLocaleLowerCase()}>
            {getBottomText().toLocaleLowerCase()}
          </Highlight>
        </div>
      </div>
      {isSelected && (
        <div className={styles.intentOpen}>
          <div className={styles.header}>
            {isRenaming ? (
              <div className={styles.rename}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
            ) : (
              <h2 className={styles.title}>
                <Highlight highlight={query.toLocaleLowerCase()}>
                  {intent.toLocaleLowerCase()}
                </Highlight>
              </h2>
            )}
            <div className={styles.metadata}>
              <div className={styles.options}>
                <button
                  className={`${styles.option} ${styles.edit}`}
                  title="Edit intent name"
                  onClick={() => {
                    setIsRenaming(!isRenaming);

                    if (isRenaming) {
                      handleRename();
                    }
                  }}
                >
                  {isRenaming ? <Check /> : <PencilSimple />}
                </button>
                <button
                  className={`${styles.option} ${styles.delete}`}
                  title="Delete intent"
                  onClick={handleDeleteIntent}
                >
                  <TrashSimple />
                </button>
              </div>
            </div>
          </div>
          <div className={styles.enhance}>
            <Checkbox
              label="Enable enhancement"
              checked={enhance}
              onChange={(e) => {
                handleSetEnhanced(e.target.checked);
              }}
            />
          </div>
          <div className={styles.utterances}>
            <h3>Utterances</h3>
            <ul className={styles.utterancesList}>
              {utterances.map((utterance, index) => (
                <li key={index}>
                  <Utterance
                    utterance={utterance}
                    intent={intent}
                    reloadData={reloadData}
                  />
                </li>
              ))}
            </ul>
            <div className={styles.addNew}>
              <input
                type="text"
                value={newUtterance}
                onChange={(e) => setNewUtterance(e.target.value)}
                placeholder="Add new utterance"
              />
              <button
                className={styles.addNewButton}
                onClick={handleAddUtterance}
                title="Add new utterance"
              >
                <Plus weight="bold" />
              </button>
            </div>
          </div>
          <div className={styles.answers}>
            <h3>Answers</h3>
            <ul className={styles.answersList}>
              {answers.map((answer, index) => (
                <li key={index}>
                  <Answer
                    answer={answer}
                    intent={intent}
                    reloadData={reloadData}
                  />
                </li>
              ))}
            </ul>
            <div className={styles.addNew}>
              <input
                type="text"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Add new answer"
              />
              <button
                className={styles.addNewButton}
                onClick={handleAddAnswer}
                title="Add new answer"
              >
                <Plus weight="bold" />
              </button>
            </div>
          </div>
          <div className={styles.intentButtons}>
            <h3>Buttons</h3>
            <div className={styles.buttonsList}>
              <ul className={styles.button}>
                {buttons?.map((button, index) => (
                  <li key={index + button.type}>
                    <ButtonItem
                      button={button}
                      intent={intent}
                      reloadData={reloadData}
                    />
                  </li>
                ))}
              </ul>
              <div className={styles.addNew}>
                <Autocomplete
                  title="Select button type"
                  data={allButtons
                    .map((button) => button.type)
                    .filter(
                      (button) =>
                        !buttons?.map((button) => button.type).includes(button)
                    )}
                  onChange={(value) => setNewButton(value)}
                  placeholder="Select button type"
                  style={{
                    width: "85%",
                  }}
                  styles={{
                    input: {
                      width: "100% !important",
                      fontSize: "16px",
                    },
                  }}
                />
                <button
                  className={styles.addNewButton}
                  onClick={handleAddButton}
                  title="Add new button"
                >
                  <Plus weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Utterance = ({
  utterance,
  intent,
  reloadData,
}: {
  utterance: string;
  intent: string;
  reloadData: () => void;
}) => {
  const { query } = useSearch();

  const handleRemoveUtterance = async () => {
    const { success } = await removeUtteranceFromIntent({
      intent,
      utterance,
    });

    if (success) {
      reloadData();
    }
  };

  return (
    <div className={styles.utterance}>
      <Highlight highlight={query.toLocaleLowerCase()}>
        {utterance.toLocaleLowerCase()}
      </Highlight>
      <div className={styles.buttons}>
        <button
          className={`${styles.button} ${styles.cancel}`}
          onClick={() => {
            handleRemoveUtterance();
          }}
          title="Remove this utterance"
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export const Answer = ({
  answer,
  intent,
  reloadData,
}: {
  answer: string;
  intent: string;
  reloadData: () => void;
}) => {
  const { query } = useSearch();

  const handleRemoveAnswer = async () => {
    const { success } = await removeAnswerFromIntent({
      intent,
      answer,
    });

    if (success) {
      reloadData();
    }
  };

  return (
    <div className={styles.answer}>
      <Highlight highlight={query.toLocaleLowerCase()}>
        {answer.toLocaleLowerCase()}
      </Highlight>
      <div className={styles.buttons}>
        <button
          className={`${styles.button} ${styles.cancel}`}
          onClick={() => {
            handleRemoveAnswer();
          }}
          title="Remove this answer"
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export const ButtonItem = ({
  button,
  reloadData,
  intent,
}: {
  button: {
    type: string;
    metadata?: Record<string, unknown>;
  };
  reloadData: () => void;
  intent: string;
}) => {
  const { query } = useSearch();

  const handleRemoveButton = async () => {
    const { success } = await removeButtonFromIntent({
      intent,
      button,
    });

    if (success) {
      reloadData();
    }
  };

  return (
    <div className={styles.buttonItem}>
      <Button variant="filled">
        <Highlight highlight={query.toLocaleLowerCase()}>
          {button.type.toLocaleLowerCase()}
        </Highlight>
      </Button>
      <div className={styles.buttons}>
        <button
          className={`${styles.button} ${styles.cancel}`}
          onClick={() => {
            handleRemoveButton();
          }}
          title="Remove this button"
        >
          <X />
        </button>
      </div>
    </div>
  );
};
