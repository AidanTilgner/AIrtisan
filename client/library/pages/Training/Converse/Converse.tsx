import React from "react";
import styles from "./Converse.module.scss";
import { useSearchParams } from "react-router-dom";
import { Chat as ChatType, Conversation } from "../../../../documentation/main";
import {
  getConversation,
  postTrainingChat,
} from "../../../helpers/fetching/chats";
import { showNotification } from "@mantine/notifications";
import { PaperPlaneTilt } from "phosphor-react";
import { Button } from "@mantine/core";

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

  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
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
        >
          New Conversation
        </Button>
      </div>
      <div className={styles.content}>
        {conversation?.chats.length ? (
          conversation.chats.map((chat) => (
            <Chat key={chat.id} chat={chat} initial_load={initialLoad} />
          ))
        ) : (
          <p className={styles.disclaimer}>
            No chats yet. Start a conversation by typing a message below.
          </p>
        )}
        {loading && (
          <div className={styles.loading}>
            <div className={styles["lds-ring"]}>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
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

const Chat = ({
  chat: { id, message, role, ...chat },
  initial_load,
}: {
  chat: ChatType;
  initial_load: boolean;
}) => {
  const calculateChatDelay = () => {
    // should be a logorithmic function so that the delay decreases as the number of chats increases
    return Math.log(chat.order) * 0.5;
  };

  return (
    <div
      className={`${styles.chat} ${styles[role]}`}
      style={{
        animationDelay: initial_load ? `${calculateChatDelay()}s` : "0s",
      }}
    >
      <p
        className={styles.chat__message}
        dangerouslySetInnerHTML={
          role === "assistant" ? { __html: message } : null
        }
      >
        {role === "user" ? message : null}
      </p>
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
