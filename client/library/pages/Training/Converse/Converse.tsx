import React from "react";
import styles from "./Converse.module.scss";
import { useSearchParams } from "react-router-dom";
import { Chat as ChatType, Conversation } from "../../../../documentation/main";
import { showNotification } from "@mantine/notifications";
import {
  ArrowCounterClockwise,
  DotsThree,
  MagicWand,
  PaperPlaneTilt,
  PencilSimple,
  Plus,
  Warning,
  WarningCircle,
  X,
  Check,
  File,
  ArrowRight,
} from "@phosphor-icons/react";
import Loaders from "../../../components/Utils/Loaders";
import { useUser } from "../../../contexts/User";
import { useSearch } from "../../../contexts/Search";
import { useModal } from "../../../contexts/Modals";
import Intent from "../../../components/Forms/Intent/Intent";
import {
  useGetConversation,
  useMarkChatAsReviewed,
  useRetryChat,
  useSendTrainingChat,
} from "../../../hooks/fetching/common";
import { useBot } from "../../../contexts/Bot";
import { useSearchParamsUpdate } from "../../../hooks/navigation";

type ChatPairType = {
  user: ChatType;
  assistant: ChatType;
};

function Converse() {
  const [urlSearchParams] = useSearchParams();
  const [conversation, setConversation] = React.useState<Conversation>();
  const [loading, setLoading] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);

  const { bot } = useBot();
  const conversationId =
    conversation?.id || urlSearchParams.get("load_conversation") || "";

  const { getConversation: getInitialConversation } = useGetConversation(
    urlSearchParams.get("load_conversation") as string
  );

  const loadConversation = () => {
    if (!urlSearchParams.get("load_conversation")) {
      return;
    }
    setLoading(true);

    getInitialConversation()
      .then((response) => {
        if (!response || !response.data) {
          showNotification({
            title: "Error",
            message: "Failed to load conversation",
            color: "red",
          });
          return;
        }
        const { data } = response;
        setConversation(data);
      })
      .catch((err) => {
        console.error(err);
        showNotification({
          title: "Error",
          message: "Failed to load conversation",
          color: "red",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    if (bot?.id) {
      loadConversation();
    }
  }, [bot?.id]);

  const { getConversation: getSpecificConversation } =
    useGetConversation(conversationId);

  const reloadConversation = () => {
    if (!conversation || !conversation.id) return;
    setLoading(true);

    getSpecificConversation()
      .then((response) => {
        if (!response || !response.data) {
          showNotification({
            title: "Error",
            message: "Failed to load conversation",
            color: "red",
          });
          return;
        }

        const { data } = response;

        setConversation(data);
      })
      .catch((err) => {
        console.error(err);
        showNotification({
          title: "Error",
          message: "Failed to load conversation",
          color: "red",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const endRef = React.useRef<HTMLDivElement>(null);

  const previousChatLength = React.useRef<number>(
    conversation?.chats.length || 0
  );

  React.useEffect(() => {
    if (conversation?.chats.length !== previousChatLength.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      previousChatLength.current = conversation?.chats.length || 0;
    }
  }, [conversation, loading]);

  const getRandomSessionId = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  const [newMessage, setNewMessage] = React.useState("");
  const session_id = conversation?.session_id || getRandomSessionId();

  const { sendTrainingChat } = useSendTrainingChat({
    message: newMessage,
    session_id,
  });

  const sendChat = async () => {
    setInitialLoad(false);
    if (!newMessage) return;
    setLoading(true);

    const response = await sendTrainingChat();

    if (!response || !response.data) {
      showNotification({
        title: "Error",
        message: "Failed to send message",
        color: "red",
      });
      setLoading(false);
      return;
    }

    const { conversation: newConversation } = response.data;

    // setTimeout(() => {
    setConversation(newConversation);
    setLoading(false);
    // }, 1000);
  };

  // chats can be grouped into pairs, where every two chats is a user, assistant interaction
  const groupedChats: ChatPairType[] | undefined = conversation?.chats.reduce(
    (acc, chat, index) => {
      if (index % 2 === 0 && chat.role === "user") {
        acc.push({
          user: chat,
          assistant: conversation.chats[index + 1],
        });
      }
      return acc;
    },
    [] as ChatPairType[]
  );

  const updateSearchParams = useSearchParamsUpdate();

  const removeLoadConversation = () => {
    updateSearchParams(
      new Map([
        [
          "load_conversation",
          conversation?.generated_name || String(conversation?.id),
        ],
      ])
    );
  };

  const searchParamsUpdate = useSearchParamsUpdate();

  const { isRunning } = useBot();

  return (
    <div className={styles.converse}>
      <div className={styles.header}>
        <h3>
          {conversation
            ? conversation.generated_name || "Unnamed Conversation"
            : "New Conversation"}
        </h3>
        <div className={styles.menu_options}>
          <button
            onClick={() => {
              setConversation(undefined);
              setInitialLoad(true);
              removeLoadConversation();
            }}
            title="Start a new conversation"
            disabled={loading || !conversation}
            className={styles.button__new}
          >
            <Plus weight="bold" />
          </button>
          {urlSearchParams.get("load_conversation") && (
            <button
              onClick={() => {
                searchParamsUpdate(
                  new Map([
                    ["tab", "review"],
                    ["load_conversation", String(conversation?.id)],
                  ])
                );
              }}
              title="View conversation details"
              disabled={loading || !conversation}
              className={styles.button__details}
            >
              <ArrowRight weight="bold" />
            </button>
          )}
        </div>
      </div>
      {isRunning ? (
        <div className={styles.content}>
          {groupedChats?.length ? (
            groupedChats.map(({ user, assistant }) => (
              <div key={`${user.id}-${assistant.id}`}>
                <ChatPair
                  user={user}
                  assistant={assistant}
                  initialLoad={initialLoad}
                  reloadConversation={reloadConversation}
                />
              </div>
            ))
          ) : (
            <p className={styles.disclaimer}>
              No chats yet. Start a conversation by typing a message below, or
              select an old one from the{" "}
              <span
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "var(--text-link)",
                }}
                onClick={() => {
                  updateSearchParams(new Map([["tab", "review"]]));
                }}
              >
                conversations page
              </span>
              .
            </p>
          )}
          {loading && (
            <div className={styles.loading}>
              <Loaders.Spinner />
            </div>
          )}
          <div ref={endRef} />
        </div>
      ) : (
        <p>
          The bot is not running, please start the bot in the overview tab to
          converse with it.
        </p>
      )}
      <div className={styles.textboxContainer}>
        <TextBox
          sendChat={sendChat}
          message={newMessage}
          setMessage={setNewMessage}
        />
      </div>
    </div>
  );
}

export default Converse;

const ChatPair = ({
  user,
  assistant,
  initialLoad,
  reloadConversation,
}: {
  user: ChatType;
  assistant: ChatType;
  initialLoad: boolean;
  reloadConversation: () => void;
}) => {
  const { setQuery } = useSearch();

  const chatPairContainsError = () => {
    const hasNoneIntent = user.intent === "None" || assistant.intent === "None";
    const hasEmptyMessage = user.message === "" || assistant.message === "";
    return hasNoneIntent || hasEmptyMessage;
  };

  const { user: userContext } = useUser();

  const extractChatPairError = () => {
    if (user.intent === "None") {
      return "Intent classified as None";
    }
    if (assistant.intent === "None") {
      return "Intent classified as None";
    }
    if (user.message === "") {
      return "User message was empty";
    }
    if (assistant.message === "") {
      return "Assistant message was empty";
    }
    return "Unknown error";
  };

  const chatPairContainsWarning = () => {
    const chatReportedWarning = assistant.needs_review;

    const intentMismatch = user.intent !== assistant.intent;

    return chatReportedWarning || intentMismatch;
  };

  const extractChatPairWarning = () => {
    if (assistant.needs_review) {
      return `Chat reported${
        assistant.review_text ? ` with message: ${assistant.review_text}` : ""
      }`;
    }

    if (user.intent !== assistant.intent) {
      return "Intent mismatch";
    }

    return "Unknown warning";
  };

  const getChatPairDelay = () => {
    return `${Math.log(user.order) * 0.25}s`;
  };

  const chatRef = React.useRef<HTMLDivElement>(null);

  const [openMetadata, setOpenMetadata] = React.useState(false);

  const [assistantLoading, setAssistantLoading] = React.useState(false);

  const { retryChat } = useRetryChat(assistant.id as number);

  const handleRetryChat = async () => {
    if (!assistant.id) return;

    setAssistantLoading(true);

    const res = await retryChat();

    if (!res || !res.data) {
      showNotification({
        title: "Error",
        message: "Failed to retry chat",
        color: "red",
      });
      return;
    }

    // const { answer, conversation } = res.data;

    showNotification({
      title: "Success",
      message: "Chat successfully retried",
    });

    reloadConversation();
    setAssistantLoading(false);
  };

  const { markChatAsReviewed } = useMarkChatAsReviewed({
    chatId: assistant.id as number,
    username: userContext?.username as string,
  });

  const handleMarkReviewed = async () => {
    if (!assistant.id || !userContext?.username) return;

    setAssistantLoading(true);

    const res = await markChatAsReviewed();

    if (!res || !res.success) {
      showNotification({
        title: "Error",
        message: "Failed to mark chat as reviewed",
        color: "red",
      });
      return;
    }

    showNotification({
      title: "Success",
      message: "Chat successfully marked as reviewed",
    });

    reloadConversation();
    setAssistantLoading(false);
  };

  const { setModal, closeModal } = useModal();

  const handleEditIntent = async () => {
    setModal({
      title: "Edit Intent",
      type: "form",
      onClose: closeModal,
      buttons: [],
      content: () => (
        <div className={styles.intentFormContainer}>
          <Intent
            type="either"
            afterSubmit={() => {
              closeModal();
              handleRetryChat();
            }}
            loadedUtterances={[user.message]}
            loadedIntent={assistant.intent}
            preSelectedForEither={
              assistant.intent === "None" ? "new" : "existing"
            }
            onClose={closeModal}
          />
        </div>
      ),
      size: "lg",
    });
  };

  const searchParamsUpdate = useSearchParamsUpdate();

  return (
    <div
      className={`${styles.chatPair}`}
      style={{
        animationDelay: `${getChatPairDelay()}`,
      }}
      ref={chatRef}
    >
      <div className={styles.importantText}>
        {chatPairContainsWarning() && (
          <div className={styles.chatPairWarningText}>
            <Warning weight="regular" />
            <span>{extractChatPairWarning()}</span>
          </div>
        )}
        {chatPairContainsError() && (
          <div className={styles.chatPairErrorText}>
            <WarningCircle weight="regular" />
            <span>{extractChatPairError()}</span>
          </div>
        )}
      </div>
      <div
        className={`${styles.chatPairChats} ${
          openMetadata ? styles.openMetadata : ""
        } ${chatPairContainsWarning() ? styles.warningChatPair : ""} ${
          chatPairContainsError() ? styles.errorChatPair : ""
        }`}
      >
        <Chat chat={user} initial_load={initialLoad} loading={false} />
        <div className={styles.metadataContainer}>
          {openMetadata ? (
            <>
              <div className={styles.metadata}>
                <p className={styles.intent_summary}>
                  Intent classified as{" "}
                  <strong>
                    <span
                      style={{
                        color:
                          assistant.intent === "None"
                            ? "var(--danger-color)"
                            : "var(--text-color)",
                      }}
                    >
                      {assistant.intent}
                    </span>
                  </strong>{" "}
                  with <strong>{assistant.confidence}%</strong> confidence.
                </p>
                {assistant.enhanced && (
                  <p className={styles.enhanced_summary}>
                    <MagicWand /> <span>Chat was enhanced with ChatGPT.</span>
                  </p>
                )}
              </div>
              <div className={styles.metadataOptions}>
                <button
                  className={`${styles.close_button} ${styles.metadataOption}`}
                  onClick={() => setOpenMetadata(false)}
                  title="See less information"
                >
                  <X weight="regular" />
                </button>
                <button
                  className={`${styles.edit_button} ${styles.metadataOption}`}
                  onClick={() => {
                    setQuery(user.message);
                    searchParamsUpdate(new Map([["tab", "documents"]]));
                  }}
                  title="Modify the corpus"
                >
                  <File weight="regular" />
                </button>
                <button
                  className={`${styles.intent_button} ${styles.metadataOption}`}
                  onClick={() => {
                    handleEditIntent();
                  }}
                  title="Edit the intent in place"
                >
                  <PencilSimple weight="regular" />
                </button>
                <button
                  className={`${styles.retry_button} ${styles.metadataOption}`}
                  onClick={() => {
                    handleRetryChat();
                  }}
                  title="Rerun this chat response"
                >
                  <ArrowCounterClockwise weight="regular" />
                </button>
                {assistant.needs_review && (
                  <button
                    className={`${styles.unreport_button} ${styles.metadataOption}`}
                    onClick={() => {
                      handleMarkReviewed();
                    }}
                    title="Mark this chat as reviewed"
                  >
                    <Check weight="regular" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className={styles.metadataOptions}>
              <button
                className={`${styles.open_button} ${styles.metadataOption}`}
                onClick={() => setOpenMetadata(true)}
                title="See more information"
              >
                <DotsThree weight="regular" />
              </button>
            </div>
          )}
        </div>
        <Chat
          chat={assistant}
          initial_load={initialLoad}
          loading={assistantLoading}
        />
      </div>
    </div>
  );
};

const Chat = ({
  chat: { message, role, ...chat },
  initial_load,
  loading,
}: {
  chat: ChatType;
  initial_load: boolean;
  loading: boolean;
}) => {
  const calculateChatDelay = () => {
    // should be a logorithmic function so that the delay decreases as the number of chats increases
    return Math.log(chat.order) * 0.25;
  };

  return (
    <div
      className={`${styles.chatContainer} ${
        chat.intent === "None" ? styles.errorChat : ""
      }`}
      style={{
        animationDelay: initial_load ? `${calculateChatDelay()}s` : "0s",
      }}
    >
      <div className={`${styles.chat} ${styles[role]}`}>
        {loading ? (
          <div className={styles.loading}>
            <Loaders.Spinner />
          </div>
        ) : (
          <p
            className={styles.chat__message}
            dangerouslySetInnerHTML={
              role === "assistant" ? { __html: message } : undefined
            }
          >
            {role === "user" ? message : null}
          </p>
        )}
        <div className={styles.chatTags}>
          {chat.enhanced && (
            <div
              className={`${styles.chatTag} ${styles.enhancedTag}`}
              title="Chat was enhanced"
            >
              <MagicWand />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TextBox = ({
  sendChat,
  setMessage,
  message,
}: {
  sendChat: () => void;
  setMessage: (message: string) => void;
  message: string;
}) => {
  const sendMessage = () => {
    sendChat();
    setMessage("");
  };

  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { isRunning } = useBot();

  return (
    <div className={styles.textbox}>
      <textarea
        disabled={!isRunning}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Say something..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
          }
        }}
        ref={inputRef}
      />
      <button onClick={sendMessage}>
        <PaperPlaneTilt weight="bold" />
      </button>
    </div>
  );
};
