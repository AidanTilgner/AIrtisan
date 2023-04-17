import React, { useEffect } from "react";
import { Warning } from "phosphor-react";
import chatStyles from "./Chat.module.scss";
import { buttonMappings } from "./buttons";

interface ChatURL {
  url: (...args: unknown[]) => string;
  headers: {
    "Content-Type": string;
    "x-access-token": string;
  };
}

const useChatEndpoint =
  (
    window as unknown as {
      chat_urls: {
        [key: string]: ChatURL;
      };
    }
  ).chat_urls?.useChatEndpoint || null;

const postChat = async (chat: {
  message: string;
  session_id: string;
}): Promise<{
  answer: string;
  botChat: number | null;
  buttons: { type: string; metadata: unknown }[];
}> => {
  try {
    const chatHookExists = !!useChatEndpoint;
    const useUrl = chatHookExists ? useChatEndpoint.url() : "/api/chat";
    const useHeaders = chatHookExists
      ? useChatEndpoint.headers
      : {
          "Content-Type": "application/json",
        };

    const response = await fetch(useUrl, {
      method: "POST",
      headers: useHeaders,
      body: JSON.stringify(chat),
    });
    const data = await response.json();
    const { answer, botChat, attachments } = data.data;
    const buttons = attachments?.buttons || [];
    return {
      answer:
        answer ||
        "There was an error, it has been reported, please try again later.",
      botChat: botChat || null,
      buttons,
    };
  } catch (error) {
    console.error(error);
    return {
      answer:
        "There was an error, it has been reported, please try again later.",
      botChat: null,
      buttons: [],
    };
  }
};

const customChatReviewHook =
  (
    window as unknown as {
      chat_urls: {
        [key: string]: ChatURL;
      };
    }
  ).chat_urls?.reviewChatURL || null;

export const markChatAsShouldReview = async (chat: {
  chat_id: string | number;
  reason: string;
}) => {
  try {
    const chatReviewHookExists = !!customChatReviewHook;
    const reviewUrl = chatReviewHookExists
      ? customChatReviewHook.url(chat.chat_id)
      : `/api/chat/${chat.chat_id}/review`;
    const reviewHeaders = chatReviewHookExists
      ? customChatReviewHook.headers
      : {
          "Content-Type": "application/json",
        };

    const response = await fetch(reviewUrl, {
      method: "POST",
      headers: reviewHeaders,
      body: JSON.stringify({
        chat_id: chat.chat_id,
        review_message: chat.reason,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const generateRandomSessionId = () => {
  const random = Math.random();
  // convert to base 36 and remove the decimal
  const randomString = random.toString(36).substring(2);
  return randomString;
};

function ChatBox() {
  const [messages, setMessages] = React.useState<
    {
      content: string;
      side: "user" | "bot";
      chat_id: string | null;
    }[]
  >([
    {
      content: "Hey there, I’m Onyx. Can I help you with anything?",
      side: "bot",
      chat_id: null,
    },
  ]);

  const disclaimers: JSX.Element[] = [
    <p className={chatStyles.disclaimer} key="disclaimer1">
      Responses don{"'"}t necessarily represent the views of VVibrant Web
      Solutions.
    </p>,
    <p className={chatStyles.disclaimer} key="disclaimer2">
      If you see any weird responses, please hit the <Warning weight="bold" />{" "}
      icon to report it.
    </p>,
  ];

  const [botMessageLoading, setBotMessageLoading] = React.useState(false);
  const [showButtons, setShowButtons] = React.useState<
    {
      type: string;
      metadata: unknown;
    }[]
  >([
    {
      type: "send_greeting",
      metadata: {
        message_to_send: "Hello!",
      },
    },
  ]);

  useEffect(() => {
    const sessionId =
      sessionStorage.getItem("session_id") || generateRandomSessionId();
    sessionStorage.setItem("session_id", sessionId);

    const savedMessages = sessionStorage.getItem("messages");
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      setMessages(parsedMessages);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("messages", JSON.stringify(messages));
  }, [messages]);

  const handleSubmitMessage = (message: string) => {
    const session_id = sessionStorage.getItem("session_id");
    if (!message || !session_id) return;
    const newMessage = {
      content: message,
      side: "user" as "user" | "bot",
      chat_id: null,
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setBotMessageLoading(true);
    postChat({
      message,
      session_id,
    })
      .then(({ answer, botChat, buttons }) => {
        setTimeout(() => {
          setBotMessageLoading(false);
          setMessages([
            ...newMessages,
            {
              content: answer,
              side: "bot",
              chat_id: String(botChat),
            },
          ]);
          if (buttons.length > 0) {
            setShowButtons(buttons);
          }
        }, 1000);
      })
      .catch((err) => {
        console.error(err);
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

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (scrollRef.current && messages.length > 1) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const [isFocused, setIsFocused] = React.useState(false);
  const hasFocused = React.useRef(false);

  useEffect(() => {
    if (!botMessageLoading && inputRef.current && hasFocused.current) {
      inputRef.current.focus();
    }
  }, [botMessageLoading]);

  return (
    <div className={chatStyles.chatBox}>
      <div className={chatStyles.header}>
        <div className={chatStyles.tag}>Beta</div>
        <h3>Onyx Chat</h3>
      </div>
      <div className={chatStyles.chatBoxMessages} ref={scrollRef}>
        <div className={chatStyles.disclaimers}>{disclaimers}</div>
        {messages.map((message, index) => (
          <Chat
            loading={false}
            content={message.content}
            side={message.side}
            key={index}
            id={message.chat_id}
          />
        ))}
        {botMessageLoading && (
          <Chat content="..." side="bot" loading={true} id={null} />
        )}
      </div>
      <div className={chatStyles.chatBoxInput}>
        <div className={chatStyles.buttons}>
          {showButtons
            .filter((b) => {
              return b.type in buttonMappings;
            })
            .map((button, index) => {
              const mappedButton =
                button.type in buttonMappings && buttonMappings[button.type];
              if (!mappedButton) return null;
              const setMessage = (message: string) => {
                handleSubmitMessage(message);
                setShowButtons([]);
              };
              return (
                <button
                  key={index}
                  onClick={() => {
                    mappedButton.action(setMessage, button.metadata);
                    // setShowButtons([]);
                  }}
                  className={`${chatStyles.button} ${
                    chatStyles[mappedButton.type]
                  }`}
                >
                  <span>{mappedButton.label}</span>
                </button>
              );
            })}
        </div>
        {isFocused && (
          <div className={chatStyles.tooltip}>
            <p>Press enter to send</p>
          </div>
        )}
        <input
          ref={inputRef}
          onFocus={() => {
            setIsFocused(true);
            if (!hasFocused.current) {
              hasFocused.current = true;
            }
          }}
          onBlur={() => {
            setIsFocused(false);
          }}
          type="text"
          placeholder="Say anything..."
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const message = e.currentTarget.value;
              handleSubmitMessage(message);
              e.currentTarget.value = "";
            }
          }}
          disabled={botMessageLoading}
        />
        <button
          onClick={() => {
            const message = inputRef.current?.value;
            if (!message) return;
            handleSubmitMessage(message);
            inputRef.current.value = "";
          }}
          className={chatStyles.sendButton}
        >
          Say it.
        </button>
      </div>
    </div>
  );
}

export default ChatBox;

function Chat({
  content,
  side,
  loading,
  id,
}: {
  content: string;
  side: "bot" | "user";
  loading: boolean;
  id: string | null;
}) {
  const [reported, setReported] = React.useState(false);

  const submitChatForReview = () => {
    // first prompt user for a reason
    const reason = window.prompt("Why do you want to report this chat?");

    // if user cancels, return
    if (!reason) return;

    if (!id) return console.error("Chat id is null");

    // if user submits, send request to server
    markChatAsShouldReview({
      chat_id: id,
      reason,
    })
      .then(() => {
        window.alert("Chat reported successfully!");
        setReported(true);
      })
      .catch((err) => {
        console.error(err);
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
