import React, { useEffect } from "react";
import styles from "./ReviewConversations.module.scss";
import {
  getConversationsThatNeedReview,
  markChatAsReviewed,
  getConversations,
} from "../../helpers/fetching/chats";
import { Button } from "@mantine/core";
import { useUser } from "../../contexts/User";
import { MagicWand, WarningCircle, ArrowsClockwise } from "phosphor-react";
import { useNavigate } from "react-router-dom";
import {
  Chat,
  Conversation as ConversationType,
  ConversationToReview,
} from "../../../documentation/main";

function ReviewConversations() {
  const [conversations, setConversations] = React.useState<
    ConversationToReview[]
  >([]);
  const [allConversations, setAllConversations] = React.useState<
    ConversationType[]
  >([]);

  React.useEffect(() => {
    (async () => {
      const conversations = await getConversationsThatNeedReview();
      setConversations(conversations);

      const allConversations = await getConversations();
      setAllConversations(allConversations);
    })();
  }, []);

  const [openedConversation, setOpenedConversation] =
    React.useState<ConversationToReview | null>(null);

  const reloadConversations = async () => {
    const conversations = await getConversationsThatNeedReview();
    setConversations(conversations);
  };

  const [viewAllConversations, setViewAllConversations] = React.useState(false);

  const conversationsToView = viewAllConversations
    ? allConversations
    : conversations;

  return (
    <div className={styles.ReviewConversations}>
      <div className={styles.header}>
        <h1>Review Conversations</h1>
        <Button
          variant="outline"
          onClick={() => {
            setViewAllConversations(!viewAllConversations);
          }}
        >
          {viewAllConversations ? "View To Review" : "View All"}
        </Button>
      </div>
      <div className={styles.interface_container}>
        <div className={styles.conversations}>
          {conversationsToView.length ? (
            conversationsToView.map((conversation) => (
              <Conversation
                key={conversation.id}
                conversation={conversation}
                openedConversation={openedConversation}
                setOpenedConversation={setOpenedConversation}
                reloadConversations={reloadConversations}
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

export default ReviewConversations;

function Conversation({
  conversation,
  openedConversation,
  setOpenedConversation,
  reloadConversations,
}: {
  conversation: ConversationToReview | ConversationType;
  openedConversation: ConversationToReview | ConversationType | null;
  setOpenedConversation: (conversation: ConversationToReview | null) => void;
  reloadConversations: () => void;
}) {
  const [seeFullConversation, setSeeFullConversation] = React.useState(true);
  const [chats, setChats] = React.useState<Chat[]>([]);
  const { user } = useUser();

  const getConversationChats = seeFullConversation
    ? conversation.chats
    : conversation.chats?.filter((c, i, chats) => {
        // chat is either in chats_to_review, or the next chat is in chats_to_review
        return c.needs_review || chats[i + 1]?.needs_review;
      });

  const reloadChats = () => {
    const chats = getConversationChats || [];
    setChats(chats);
  };

  useEffect(() => {
    reloadChats();
  }, [seeFullConversation]);

  const getFormattedTitle = (conversation: ConversationType) => {
    const generatedName = conversation.generated_name || "Unnamed Conversation";
    return getShortenedText(generatedName, 18);
  };

  const getShortenedText = (text: string, maxLength = 36) => {
    if (!text) return "";
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const handleMarkReviewed = async (chatId: number) => {
    if (!user) return;
    await markChatAsReviewed(chatId, user.username);
    reloadConversations();
  };

  const navigate = useNavigate();

  const handleRetryChat = async (chatContent: string) => {
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
          if (
            openedConversation &&
            openedConversation?.id === conversation.id
          ) {
            setOpenedConversation(null);
          } else {
            setOpenedConversation({
              ...conversation,
              chats_to_review:
                "chats_to_review" in conversation
                  ? conversation.chats_to_review
                  : [],
            });
          }
        }}
      >
        <h3 className={styles.title}>{getFormattedTitle(conversation)}</h3>
        <p className={styles.bottomtext}>{conversation.chats[0].message}</p>
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
                      User gave reason: {'"'}
                      <b>{chat.review_text}</b>
                      {'"'}
                    </p>
                  </div>
                )}
                <div
                  key={chat.id}
                  className={`${styles.chat} ${styles[chat.role]} ${
                    chat.enhanced ? styles.enhanced : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
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
                            if (!chat?.id) return;
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
              {seeFullConversation ? "Just To Review" : "Full Conversation"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
