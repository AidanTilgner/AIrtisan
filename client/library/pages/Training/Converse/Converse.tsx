import React from "react";
import styles from "./Converse.module.scss";
import { useSearchParams } from "react-router-dom";
import { Chat as ChatType, Conversation } from "../../../../documentation/main";
import { getConversation } from "../../../helpers/fetching/chats";
import { showNotification } from "@mantine/notifications";
import { PaperPlaneTilt } from "phosphor-react";

function Converse() {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [conversation, setConversation] = React.useState<Conversation>();

  console.log("Conversation: ", conversation);

  const loadConversation = () => {
    if (!urlSearchParams.get("load_conversation")) return;

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
      });
  };

  React.useEffect(() => {
    loadConversation();
  }, []);

  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className={styles.converse}>
      <div className={styles.header}>
        <h3>
          {conversation
            ? conversation.generated_name || "Unnamed Conversation"
            : "New Conversation"}
        </h3>
      </div>
      <div className={styles.content}>
        {conversation?.chats.length ? (
          conversation.chats.map((chat) => <Chat key={chat.id} {...chat} />)
        ) : (
          <p className={styles.disclaimer}>
            No chats yet. Start a conversation by typing a message below.
          </p>
        )}
        <div ref={endRef} />
      </div>
      <div className={styles.textboxContainer}>
        <TextBox
          sendChat={(message) => {
            console.log("Sending message: ", message);
          }}
        />
      </div>
    </div>
  );
}

export default Converse;

const Chat = ({ id, message, role, ...chat }: ChatType) => {
  return (
    <div className={`${styles.chat} ${styles[role]}`}>
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
