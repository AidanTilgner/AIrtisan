import React, { useEffect, useMemo, useRef } from "react";
import styles from "./Floating.module.scss";
import chatStyles from "./Chatbox.module.scss";
import { Chat as ChatIcon, Warning, X } from "@phosphor-icons/react";
import { buttonMappings } from "./buttons";

const AIrtisanSettings = (window as unknown as SettingsWindow).AIrtisanSettings;

export const markChatAsShouldReview = async (chat: {
  chat_id: string | number;
  reason: string;
}) => {
  try {
    const bot_slug = AIrtisanSettings.bot_slug;
    if (!bot_slug) return console.error("Bot slug not found");
    const foundUrl = AIrtisanSettings.api_url;
    const foundUrlToUse = foundUrl
      ? foundUrl + `/chats/${chat.chat_id}/should_review`
      : `https://airtisan.app/api/v1/chats/${chat.chat_id}/should_review`;
    const reviewHeaders = {
      "Content-Type": "application/json",
    };

    const response = await fetch(foundUrlToUse, {
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

const postChat = async (chat: {
  message: string;
  session_id: string;
}): Promise<{
  answer: string;
  botChat: number | null;
  buttons: { type: string; metadata: unknown }[];
}> => {
  try {
    const bot_slug = AIrtisanSettings.bot_slug;
    const foundUrl = AIrtisanSettings.api_url;
    const foundUrlToUse = foundUrl
      ? foundUrl + `/bots/${bot_slug}/public/chat`
      : `https://airtisan.app/api/v1/bots/${bot_slug}/public/chat`;

    const useHeaders = {
      "Content-Type": "application/json",
    };

    const response = await fetch(foundUrlToUse, {
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

const generateRandomSessionId = () => {
  const random = Math.random();
  // convert to base 36 and remove the decimal
  const randomString = random.toString(36).substring(2);
  return randomString;
};

function Index() {
  const [clicked, setClicked] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout>();
  const [elementPosition, setElementPosition] = React.useState<number>();

  const onyxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("mousemove", (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    });
  }, []);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // if the mouse position is more than 100px from the element, then move it

    const distanceFromElement = Math.abs(
      mousePosition.y - (elementPosition || 0)
    );

    if (distanceFromElement > 100) {
      const newTimeout = setTimeout(() => {
        if (mousePosition.x < window.innerWidth - 100) {
          setElementPosition(mousePosition.y - 28);
        }
      }, 500);

      setTimeoutId(newTimeout);
    }
  }, [mousePosition]);

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  window.addEventListener("resize", () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  });

  const [opened, setOpened] = React.useState(false);

  useEffect(() => {
    if (opened && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobile, opened]);

  const [focusTrap, setFocusTrap] = React.useState(false);

  const getElementPosition = () => {
    if (opened && isMobile) {
      return "14px";
    }
    if (isMobile || opened) {
      return "calc(100vh - 92px)";
    }
    if (elementPosition) {
      if (elementPosition < 82 || elementPosition > window.innerHeight - 82) {
        return "calc(100vh - 92px)";
      } else {
        return `${elementPosition}px`;
      }
    }
    return "calc(100vh - 92px)";
  };

  useEffect(() => {
    const focusTrapTrue = setTimeout(() => {
      setFocusTrap(true);
    }, 500);

    const focusTrapFalse = setTimeout(() => {
      setFocusTrap(false);
    }, 3000);

    return () => {
      clearTimeout(focusTrapTrue);
      clearTimeout(focusTrapFalse);
    };
  }, []);

  return useMemo(
    () => (
      <>
        <div
          className={`${styles.onyx} ${clicked ? styles.clicked : ""} ${
            focusTrap ? styles.focusTrap : ""
          } ${opened ? styles.opened : ""}`}
          onClick={() => {
            setClicked(true);
            setTimeout(() => {
              setClicked(false);
              setOpened(!opened);
            }, 500);
          }}
          ref={onyxRef}
          style={{
            top: getElementPosition(),
          }}
        >
          <div className={styles.backgroundCircleOne} />
          <div className={styles.backgroundCircleTwo} />
          <div className={styles.backgroundCircleThree} />
          <div className={styles.backgroundCircleFour} />
          <div className={styles.container}>
            {opened ? <X /> : <ChatIcon />}
          </div>
        </div>
        {opened && <ChatInterface />}
      </>
    ),
    [clicked, opened, elementPosition, isMobile, focusTrap]
  );
}

export default Index;

function ChatInterface() {
  return (
    <div className={styles.chatContainer}>
      <ChatBox />
    </div>
  );
}

function ChatBox() {
  const name = AIrtisanSettings?.bot_name || "AIrtisan Bot";

  const [messages, setMessages] = React.useState<
    {
      content: string;
      side: "user" | "bot";
      chat_id: string | null;
    }[]
  >([
    {
      content: `Hey there, my name's ${name}. How can I help you?`,
      side: "bot",
      chat_id: null,
    },
  ]);

  const disclaimers: JSX.Element[] = [
    <p className={chatStyles.disclaimer} key="disclaimer2">
      If you see any weird responses, please hit the <Warning weight="bold" />{" "}
      icon to report it.
    </p>,
    <p className={chatStyles.disclaimer} key="disclaimer3">
      Conversations may be recorded for quality assurance purposes.
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
        <h3>{name}</h3>
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
