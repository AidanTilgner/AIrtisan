import React from "react";
import styles from "./Converse.module.scss";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Chat as ChatType, Conversation } from "../../../../documentation/main";
import {
  getConversation,
  postTrainingChat,
  retryChat,
  markChatAsReviewed,
} from "../../../helpers/fetching/chats";
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
} from "phosphor-react";
import { Button } from "@mantine/core";
import Loaders from "../../../components/Utils/Loaders";
import { useUser } from "../../../contexts/User";
import { useSearch } from "../../../contexts/Search";

type ChatPairType = {
  user: ChatType;
  assistant: ChatType;
};

function Converse() {
  const [urlSearchParams] = useSearchParams();
  const [conversation, setConversation] = React.useState<Conversation>();
  const [loading, setLoading] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);

  const loadConversation = () => {
    if (!urlSearchParams.get("load_conversation")) return;

    setLoading(true);

    getConversation(urlSearchParams.get("load_conversation") as string)
      .then(({ conversation }) => {
        if (!conversation) {
          showNotification({
            title: "Error",
            message: "Failed to load conversation",
          });
          return;
        }
        setConversation(conversation);
      })
      .catch((err) => {
        console.error(err);
        showNotification({
          title: "Error",
          message: "Failed to load conversation",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    loadConversation();
  }, []);

  const reloadConversation = () => {
    if (!conversation || !conversation.id) return;
    setLoading(true);

    getConversation(conversation.id)
      .then(({ conversation }) => {
        if (!conversation) {
          showNotification({
            title: "Error",
            message: "Failed to load conversation",
          });
          return;
        }
        setConversation(conversation);
      })
      .catch((err) => {
        console.error(err);
        showNotification({
          title: "Error",
          message: "Failed to load conversation",
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

  const sendChat = async (message: string) => {
    setInitialLoad(false);
    if (!message) return;
    setLoading(true);

    const session_id = conversation?.session_id || getRandomSessionId();

    const { conversation: newConversation, success } = await postTrainingChat({
      message,
      session_id,
    });

    if (!success || !newConversation) {
      showNotification({
        title: "Error",
        message: "Failed to send message",
      });
      return;
    }

    setTimeout(() => {
      setConversation(newConversation);
      setLoading(false);
    }, 1000);
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

  return (
    <div className={styles.converse}>
      <div className={styles.header}>
        <h3>
          {conversation
            ? conversation.generated_name || "Unnamed Conversation"
            : "New Conversation"}
        </h3>
        <Button
          onClick={() => {
            setConversation(undefined);
            setInitialLoad(true);
          }}
          variant="outline"
        >
          <Plus weight="bold" />
        </Button>
      </div>
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
            <Link to="/review/conversations">conversations page</Link>.
          </p>
        )}
        {loading && (
          <div className={styles.loading}>
            <Loaders.Spinner />
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className={styles.textboxContainer}>
        <TextBox sendChat={sendChat} />
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

  const navigate = useNavigate();

  const handleRetryChat = async () => {
    if (!assistant.id) return;

    setAssistantLoading(true);

    const res = await retryChat(assistant.id);

    if (res.success && res.answer) {
      showNotification({
        title: "Success",
        message: "Chat successfully retried",
      });
    } else {
      showNotification({
        title: "Error",
        message: "Failed to retry chat",
      });
    }
    reloadConversation();
    setAssistantLoading(false);
  };

  const handleMarkReviewed = async () => {
    if (!assistant.id || !userContext?.username) return;

    setAssistantLoading(true);

    const res = await markChatAsReviewed(assistant.id, userContext.username);

    if (res.success && res.answer) {
      showNotification({
        title: "Success",
        message: "Chat successfully marked as reviewed",
      });
    } else {
      showNotification({
        title: "Error",
        message: "Failed to mark chat as reviewed",
      });
    }
    reloadConversation();
    setAssistantLoading(false);
  };

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
                          assistant.intent === "None" ? "#ff0000" : "#000000",
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
                    navigate("/corpus");
                  }}
                  title="Modify the corpus"
                >
                  <File weight="regular" />
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

const TextBox = ({ sendChat }: { sendChat: (message: string) => void }) => {
  const [message, setMessage] = React.useState("");

  const sendMessage = () => {
    sendChat(message);
    setMessage("");
  };

  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={styles.textbox}>
      <textarea
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
