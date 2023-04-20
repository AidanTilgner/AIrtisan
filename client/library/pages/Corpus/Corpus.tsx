import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import styles from "./Corpus.module.scss";
import {
  ButtonType,
  CorpusDataPoint,
  Corpus as CorpusType,
} from "../../../documentation/main";
import { showNotification } from "@mantine/notifications";
import Search from "../../components/Search/Search";
import { useSearch } from "../../contexts/Search";
import { Autocomplete, Button, Checkbox, Highlight } from "@mantine/core";
import {
  Check,
  PencilSimple,
  Plus,
  TrashSimple,
  X,
} from "@phosphor-icons/react";
import { useMediaQuery } from "@mantine/hooks";
import { useModal } from "../../contexts/Modals";
import IntentForm from "../../components/Forms/Intent/Intent";
import useFetch from "../../hooks/useFetch";
import {
  useAddAnswerToIntent,
  useAddUtteranceToIntent,
  useDeleteDataPoint,
  useGetAllButtons,
  useRemoveAnswerFromIntent,
  useRemoveButtonFromIntent,
  useRemoveUtteranceFromIntent,
  useRenameIntent,
  useUpdateButtonsOnIntent,
  useUpdateEnhanceForIntent,
} from "../../hooks/fetching/common";

function Corpus() {
  const { query, setQuery } = useSearch();

  const [fullCorpus, setFullCorpus] = React.useState<CorpusType>();

  const onSuccess = useCallback((data: CorpusType) => {
    if (!data) return;
    if (data !== fullCorpus) setFullCorpus(data);
  }, []);

  const { load } = useFetch<undefined, CorpusType>({
    url: "/training/corpus",
    onSuccess,
    runOnMount: true,
  });

  const reloadData = async () => {
    load();
  };

  const filteredData = fullCorpus?.data?.filter((dataPoint) => {
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

  useLayoutEffect(() => {
    (
      [...document.getElementsByClassName(styles.intent)] as HTMLElement[]
    ).forEach((c, i) => {
      c.style.animationDelay = `${Math.log(i) * 0.25}s`;
    });
  }, [filteredData]);

  const [openIntent, setOpenIntentState] = React.useState<string | null>(null);

  const setOpenIntent = (intent: string | null) => {
    setOpenIntentState(intent);
  };

  const { data: allButtons } = useGetAllButtons([], {
    runOnMount: true,
  });

  useEffect(() => {
    if (!fullCorpus) return;
    if (filteredData?.find((data) => data.intent === openIntent)) return;
    setOpenIntent(null);
  }, [filteredData, query]);

  const [addingIntent, setAddingIntent] = useState(false);

  return (
    <div className={styles.Corpus}>
      <div className={styles.header}>
        <h1>
          {fullCorpus?.name || "Corpus"}
          <span>{fullCorpus?.locale}</span>
        </h1>
        <div className={styles.addIntentButton}>
          {addingIntent ? (
            <Button
              variant="subtle"
              title="Stop adding intent"
              onClick={() => setAddingIntent(false)}
            >
              <X weight="bold" />
            </Button>
          ) : (
            <Button
              variant="subtle"
              title="Add intent"
              onClick={() => setAddingIntent(true)}
            >
              <Plus weight="bold" />
            </Button>
          )}
        </div>
      </div>
      {addingIntent && (
        <div className={styles.addIntentContainer}>
          <IntentForm
            afterSubmit={(intent) => {
              setAddingIntent(false);
              setQuery(intent || "");
              reloadData();
            }}
            type="add"
            onClose={() => {
              setAddingIntent(false);
            }}
          />
        </div>
      )}
      <div className={styles.searchArea}>
        <div className={styles.searchContainer}>
          <Search withShadow />
        </div>
      </div>
      <div className={styles.interface_container}>
        <div className={styles.data}>
          {filteredData?.length ? (
            filteredData?.map((dataPoint) => (
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
            <p className={styles.disclaimer}>
              {query ? "No results found." : "No data yet."}
            </p>
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
  allButtons: ButtonType[];
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

  const { addUtteranceToIntent } = useAddUtteranceToIntent({
    intent,
    utterance: newUtterance,
  });

  const handleAddUtterance = async () => {
    const response = await addUtteranceToIntent();

    if (!response || !response.success || !response.data) {
      showNotification({
        title: "Error",
        message: "Error while adding utterance",
        color: "red",
      });
      return;
    }

    const { success } = response;
    if (success) {
      reloadData();
    }

    setNewUtterance("");
  };

  const { addAnswerToIntent } = useAddAnswerToIntent({
    intent,
    answer: newAnswer,
  });

  const handleAddAnswer = async () => {
    const response = await addAnswerToIntent();
    if (!response) {
      return;
    }

    if (!response.success || !response.data) {
      showNotification({
        title: "Error",
        message: "Error while adding answer",
        color: "red",
      });
      return;
    }

    const { success } = response;

    if (success) {
      reloadData();
    }

    setNewAnswer("");
  };

  const { deleteDataPoint } = useDeleteDataPoint({
    intent,
  });

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
            const response = await deleteDataPoint();

            if (!response || !response.success || !response.data) {
              showNotification({
                title: "Error",
                message: "Error while deleting intent",
                color: "red",
              });
              return;
            }

            const { success } = response;

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
      size: "sm",
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
  }, [isSelected, query]);

  const [isRenaming, setIsRenaming] = React.useState<boolean>(false);
  const [newName, setNewName] = React.useState<string>(intent);
  const [newButton, setNewButton] = React.useState<string>("");

  const { renameIntent } = useRenameIntent({
    intent,
    newIntent: newName,
  });

  const handleRename = async () => {
    if (newName === intent) {
      setIsRenaming(false);
      return;
    }

    const response = await renameIntent();

    if (!response || !response.success || !response.data) {
      showNotification({
        title: "Error",
        message: "Error while renaming intent",
        color: "red",
      });
      return;
    }

    const { success } = response;

    if (success) {
      reloadData();
    }

    setIsRenaming(false);
  };

  const { updateButtonsOnIntent } = useUpdateButtonsOnIntent({
    intent,
    buttons: [
      ...(buttons || []),
      {
        type: newButton,
      },
    ],
  });

  const handleAddButton = async () => {
    const response = await updateButtonsOnIntent();

    if (!response || !response.success || !response.data) {
      showNotification({
        title: "Error",
        message: "Error while adding button",
        color: "red",
      });
      return;
    }

    const { success } = response;

    if (success) {
      reloadData();
    }
  };

  const { updateEnhanceForIntent } = useUpdateEnhanceForIntent({
    intent,
    enhance: !enhance,
  });

  const handleSetEnhanced = async () => {
    const response = await updateEnhanceForIntent();

    if (!response || !response.success || !response.data) {
      showNotification({
        title: "Error",
        message: "Error while updating enhance",
        color: "red",
      });
      return;
    }

    const { success } = response;

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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (openIntent === intent) {
              setOpenIntent(null);
            } else {
              setOpenIntent(intent);
            }
          }
        }}
      >
        <h3 className={styles.toptext}>
          <Highlight highlight={query}>{getTopText()}</Highlight>
        </h3>
        <div className={styles.bottomtext}>
          <Highlight highlight={query}>{getBottomText()}</Highlight>
        </div>
      </div>
      {isSelected && (
        <div className={styles.intentOpen}>
          <div className={styles.intentHeader}>
            {isRenaming ? (
              <div className={styles.rename}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="The user's goal is to..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleRename();
                      setIsRenaming(false);
                    }
                  }}
                />
              </div>
            ) : (
              <h2 className={styles.title}>
                <Highlight highlight={query}>{intent}</Highlight>
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
              onChange={() => {
                handleSetEnhanced();
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

  const { removeUtteranceFromIntent } = useRemoveUtteranceFromIntent({
    intent,
    utterance,
  });

  const handleRemoveUtterance = async () => {
    const response = await removeUtteranceFromIntent();

    if (!response || !response.success || !response.data) {
      showNotification({
        title: "Error",
        message: "Failed to remove utterance",
        color: "red",
      });
      return;
    }

    const { success } = response;

    if (success) {
      reloadData();
    }
  };

  return (
    <div className={styles.utterance}>
      <Highlight highlight={query}>{utterance}</Highlight>
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

  const { removeAnswerFromIntent } = useRemoveAnswerFromIntent({
    intent,
    answer,
  });

  const handleRemoveAnswer = async () => {
    const response = await removeAnswerFromIntent();

    if (!response || !response.success || !response.data) {
      showNotification({
        title: "Error",
        message: "Failed to remove answer",
        color: "red",
      });
      return;
    }

    const { success } = response;

    if (success) {
      reloadData();
    }
  };

  return (
    <div className={styles.answer}>
      <Highlight highlight={query}>{answer}</Highlight>
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

  const { removeButtonFromIntent } = useRemoveButtonFromIntent({
    intent,
    button,
  });

  const handleRemoveButton = async () => {
    const response = await removeButtonFromIntent();

    if (!response || !response.success || !response.data) {
      showNotification({
        title: "Error",
        message: "Failed to remove button",
        color: "red",
      });
      return;
    }

    const { success } = response;

    if (success) {
      reloadData();
    }
  };

  return (
    <div className={styles.buttonItem}>
      <Button variant="filled">
        <Highlight highlight={query}>{button.type}</Highlight>
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
