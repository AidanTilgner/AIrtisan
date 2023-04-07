import React, { useEffect, useLayoutEffect } from "react";
import withStyles from "react-css-modules";
import chatStyles from "./Chat.module.scss";
import { postChat, markChatAsShouldReview } from "../../helpers/fetching";
import { Warning } from "phosphor-react";

const generateRandomSessionId = () => {
  const random = Math.random();
  // convert to base 36 and remove the decimal
  const randomString = random.toString(36).substring(2);
  return randomString;
};

function ChatBox() {
  const [messages, setMessages] = React.useState([
    {
      content: "Hey there, I’m Onyx. Can I help you with anything?",
      side: "bot",
      chat_id: null,
    },
  ]);

  const [botMessageLoading, setBotMessageLoading] = React.useState(false);

  useEffect(() => {
    const sessionId =
      sessionStorage.getItem("session_id") || generateRandomSessionId();
    sessionStorage.setItem("session_id", sessionId);
  }, []);

  const handleSubmitMessage = (message) => {
    if (!message) return;
    const newMessage = {
      content: message,
      side: "user",
      chat_id: null,
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setBotMessageLoading(true);
    postChat({
      message,
      session_id: sessionStorage.getItem("session_id") || "test",
    })
      .then(({ answer, botChat }) => {
        setTimeout(() => {
          setBotMessageLoading(false);
          setMessages([
            ...newMessages,
            {
              content: answer,
              side: "bot",
              chat_id: botChat,
            },
          ]);
        }, 1000);
      })
      .catch((err) => {
        setTimeout(() => {
          setBotMessageLoading(false);
          setMessages([
            ...newMessages,
            {
              content: "There was an error, please try again later.",
              side: "bot",
              chat_id: null,
            },
          ]);
        }, 1000);
      });
  };

  const endRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [isFocused, setIsFocused] = React.useState(false);

  useEffect(() => {
    if (!botMessageLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [botMessageLoading]);

  const submitChatForReview = (chat_id) => {};

  return (
    <div className={chatStyles.chatBox}>
      <div className={chatStyles.chatBoxMessages}>
        {messages.map((message, index) => (
          <Chat
            content={message.content}
            side={message.side}
            key={index}
            id={message.chat_id}
          />
        ))}
        {botMessageLoading && (
          <Chat content="..." side="bot" loading={true} id={null} />
        )}
        <div ref={endRef} />
      </div>
      <div className={chatStyles.chatBoxInput}>
        {isFocused && (
          <div className={chatStyles.tooltip}>
            <p>Press enter to send</p>
          </div>
        )}
        <input
          ref={inputRef}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          type="text"
          placeholder="It’s like you’re talking to a person"
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const message = e.target.value;
              handleSubmitMessage(message);
              e.target.value = "";
            }
          }}
          disabled={botMessageLoading}
        />
        <button>Say it.</button>
      </div>
    </div>
  );
}

export default withStyles(chatStyles)(ChatBox);

function Chat({ content, side, loading, id }) {
  const [reported, setReported] = React.useState(false);

  const submitChatForReview = () => {
    // first prompt user for a reason
    const reason = window.prompt("Why do you want to report this chat?");

    // if user cancels, return
    if (!reason) return;

    // if user submits, send request to server
    markChatAsShouldReview({
      chat_id: id,
      reason,
    })
      .then((res) => {
        window.alert("Chat reported successfully!");
        setReported(true);
      })
      .catch((err) => {
        window.alert("There was an error, please try again later.");
      });
  };

  return (
    <div
      className={`${chatStyles.chat} ${chatStyles[side]} ${chatStyles.chatLoading}`}
    >
      {loading ? (
        <div className={chatStyles["lds-ring"]}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : side === "bot" ? (
        <>
          <p
            className={chatStyles.chatMessage}
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          ></p>
          <div className={chatStyles.options}>
            {!reported && !!id && (
              <button
                className={chatStyles.options__report}
                onClick={submitChatForReview}
                title="Report this chat"
              >
                <Warning />
              </button>
            )}
          </div>
        </>
      ) : (
        <p className={chatStyles.chatMessage}>{content}</p>
      )}
    </div>
  );
}
