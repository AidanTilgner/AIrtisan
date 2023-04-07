import React, { useEffect } from "react";
import withStyles from "react-css-modules";
import styles from "./ReviewConversations.module.scss";
import {
  getConversationsThatNeedReview,
  markChatAsReviewed,
} from "../../helpers/fetching/chats";
import { Button } from "@mantine/core";
import { useUser } from "../../contexts/User";
import {
  MagicWand,
  WarningCircle,
  TestTube,
  ArrowsClockwise,
} from "phosphor-react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function ReviewConversations() {
  const [conversations, setConversations] = React.useState([]);
  const { user } = useUser();

  React.useEffect(() => {
    (async () => {
      const conversations = await getConversationsThatNeedReview();
      setConversations(conversations);
    })();
  }, []);

  const [openedConversation, setOpenedConversation] = React.useState(null);
  const [seeFullConversation, setSeeFullConversation] = React.useState(false);

  const getConversationChats = (conversation) => {
    if (seeFullConversation) {
      return conversation.chats;
    } else {
      return conversation.chats.filter((c, i, chats) => {
        // chat is either in chats_to_review, or the next chat is in chats_to_review
        return c.needs_review || chats[i + 1]?.needs_review;
      });
    }
  };

  return (
    <div className={styles.ReviewConversations}>
      <h1>Review Conversations</h1>
      <div className={styles.interface_container}>
        <div className={styles.conversations}>
          {conversations.length ? (
            conversations.map((conversation) => (
              <Conversation
                key={conversation.id}
                conversation={conversation}
                openedConversation={openedConversation}
                setOpenedConversation={setOpenedConversation}
                getConversationChats={getConversationChats}
                seeFullConversation={seeFullConversation}
                setSeeFullConversation={setSeeFullConversation}
                setConversations={setConversations}
              />
            ))
          ) : (
            <p>No chats to review.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles)(ReviewConversations);

function Conversation({
  conversation,
  openedConversation,
  setOpenedConversation,
  getConversationChats,
  seeFullConversation,
  setSeeFullConversation,
  setConversations,
}) {
  const [chats, setChats] = React.useState([]);
  const { user } = useUser();

  useEffect(() => {
    setChats(getConversationChats(conversation));
  }, []);

  const reloadChats = () => {
    setChats(getConversationChats(conversation));
  };

  const getFormattedTitle = (conversation) => {
    const lastChat = conversation.chats_to_review[0];
    return getShortenedText(lastChat.message, 18);
  };

  const getShortenedText = (text, maxLength = 36) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const handleMarkReviewed = async (chatId) => {
    await markChatAsReviewed(chatId, user.username);
    const conversations = await getConversationsThatNeedReview();
    setConversations(conversations);
  };

  const navigate = useNavigate();

  const handleRetryChat = async (chatContent) => {
    const urlSearchParams = new URLSearchParams({
      run: chatContent,
    }).toString();
    navigate(`/interactive?${urlSearchParams}`);
  };

  return (
    <div
      key={conversation.id}
      className={`${styles.conversation_interface} ${
        openedConversation ? styles.conversation_is_open : ""
      }`}
    >
      <div
        className={`${styles.conversation} ${
          openedConversation && openedConversation.id === conversation.id
            ? styles.opened
            : ""
        }`}
        onClick={() => {
          if (openedConversation && openedConversation.id === conversation.id) {
            setOpenedConversation(null);
          } else {
            setOpenedConversation(conversation);
          }
        }}
      >
        <h3 className={styles.title}>{getFormattedTitle(conversation)}</h3>
        <p className={styles.bottomtext}>
          {conversation.chats_to_review[0].intent}
        </p>
        {conversation.chats.some((c) => !!c.enhanced) && (
          <div className={styles.tag}>enhanced</div>
        )}
      </div>
      {openedConversation && openedConversation.id === conversation.id && (
        <div className={styles.opened_conversation}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {openedConversation.generated_name || "No Generated Name"}
            </h2>
            <p className={styles.subtitle}>{openedConversation.session_id}</p>
          </div>
          <div className={styles.chats}>
            {chats.map((chat) => (
              <div key={chat.id}>
                {chat.needs_review && (
                  <div className={styles.review_info}>
                    <p>
                      Intent classified as <b>{chat.intent}</b>{" "}
                      {chat.confidence
                        ? `with a confidence of ${chat.confidence}%`
                        : ""}
                      .
                    </p>
                    <p>
                      User gave reason: "<b>{chat.review_text}</b>"
                    </p>
                  </div>
                )}
                <div
                  key={chat.id}
                  className={`${styles.chat} ${styles[chat.role]} ${
                    chat.enhanced ? styles.enhanced : ""
                  }`}
                >
                  <p
                    className={styles.content}
                    dangerouslySetInnerHTML={{
                      __html: chat.message,
                    }}
                  />
                  {chat.enhanced && (
                    <div
                      className={styles.enhanced_tag}
                      title="This chat was enhanced."
                    >
                      <MagicWand />
                    </div>
                  )}
                  {chat.needs_review && (
                    <>
                      <div
                        className={styles.review_tag}
                        title="This chat needs review."
                      >
                        <WarningCircle />
                      </div>
                      <div className={styles.review_button}>
                        <Button
                          onClick={() => {
                            handleMarkReviewed(chat.id);
                            reloadChats();
                          }}
                          variant="default"
                          size="xs"
                        >
                          Mark as reviewed
                        </Button>
                      </div>
                    </>
                  )}
                  {chat.role === "user" && (
                    <div
                      className={styles.test_tag}
                      title="Retry this chat."
                      onClick={() => {
                        handleRetryChat(chat.message);
                      }}
                    >
                      <ArrowsClockwise />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.buttons}>
            <Button
              onClick={() => {
                setOpenedConversation(null);
              }}
              variant="default"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setSeeFullConversation(!seeFullConversation);
              }}
              variant="default"
            >
              {seeFullConversation ? "To Review" : "Full Conversation"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
