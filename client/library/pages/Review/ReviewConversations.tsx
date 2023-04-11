import React, { useEffect } from "react";
import styles from "./ReviewConversations.module.scss";
import {
  getConversationsThatNeedReview,
  markChatAsReviewed,
  getConversations,
  createTrainingCopyOfConversation,
  deleteConversation,
} from "../../helpers/fetching/chats";
import { Button, SegmentedControl } from "@mantine/core";
import { useUser } from "../../contexts/User";
import {
  MagicWand,
  WarningCircle,
  ArrowsClockwise,
  TrashSimple,
  Lightning,
  ArrowRight,
} from "phosphor-react";
import { useNavigate } from "react-router-dom";
import {
  Chat,
  Conversation as ConversationType,
  ConversationToReview,
} from "../../../documentation/main";
import { showNotification } from "@mantine/notifications";

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
    const allConversations = await getConversations();
    setAllConversations(allConversations);
  };

  const [viewAllConversations, setViewAllConversations] = React.useState(true);

  const conversationsToView = viewAllConversations
    ? allConversations
    : conversations;

  return (
    <div className={styles.ReviewConversations}>
      <div className={styles.header}>
        <h1>Conversations</h1>
        <SegmentedControl
          data={[
            {
              label: "All Conversations",
              value: "all",
            },
            {
              label: "Marked for Review",
              value: "to_review",
            },
          ]}
          onChange={(v) => {
            switch (v) {
              case "to_review":
                setViewAllConversations(false);
                break;
              case "all":
                setViewAllConversations(true);
                break;
            }
          }}
        >
          {viewAllConversations ? "View To Review" : "View All"}
        </SegmentedControl>
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
            <p>
              {viewAllConversations
                ? "No conversations yet."
                : "No conversations marked for review"}
            </p>
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

  const navigate = useNavigate();

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
    return getShortenedText(generatedName, 36);
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

  const handleCreateTrainingCopy = async (chatId: number) => {
    if (!user) return;
    const { success, new_conversation_id } =
      await createTrainingCopyOfConversation(chatId);
    if (!success || !new_conversation_id) {
      console.error("Failed to create training copy of conversation");
      showNotification({
        title: "Error",
        message: "Failed to create training copy of conversation",
        color: "red",
      });
      return;
    }

    showNotification({
      title: "Success",
      message: "Created training copy of conversation",
    });

    const newParams = new URLSearchParams({
      load_conversation: new_conversation_id.toString(),
      tab: "converse",
    }).toString();

    reloadConversations();

    navigate(`/train?${newParams}`);
  };

  const handleDeleteConversation = async (chatId: number) => {
    if (!user) return;
    const res = await deleteConversation(chatId);

    if (!res.success) {
      console.error("Failed to delete conversation");
      showNotification({
        title: "Error",
        message: "Failed to delete conversation",
      });
      reloadConversations();
      return;
    }

    showNotification({
      title: "Success",
      message: "Deleted conversation",
      color: "red",
    });

    setOpenedConversation(null);
    reloadConversations();
  };

  const handleRetryChat = async (chatContent: string) => {
    const urlSearchParams = new URLSearchParams({
      run: chatContent,
      tab: "interactive",
    }).toString();
    navigate(`/train?${urlSearchParams}`);
  };

  const handleOpenInTraining = async (chatId: number) => {
    const urlSearchParams = new URLSearchParams({
      load_conversation: chatId.toString(),
      tab: "converse",
    }).toString();
    navigate(`/train?${urlSearchParams}`);
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
        <p className={styles.bottomtext}>
          {getShortenedText(conversation.chats[0].message, 48)}
        </p>
        <div className={styles.tags}>
          {conversation.chats.some((c) => !!c.enhanced) ||
            (true && (
              <div className={`${styles.tag} ${styles.tag_enhanced}`}>
                enhanced
              </div>
            ))}
          {conversation.training_copy && (
            <div className={`${styles.tag} ${styles.tag_training_copy}`}>
              training copy
            </div>
          )}
        </div>
      </div>
      {openedConversation && openedConversation.id === conversation.id && (
        <div className={styles.opened_conversation}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {openedConversation.generated_name || "No Generated Name"}
            </h2>
            <div className={styles.metadata}>
              <p className={styles.subtitle}>{openedConversation.session_id}</p>
              <div className={styles.options}>
                <button
                  className={`${styles.option} ${styles.delete}`}
                  title="Delete this conversation"
                  onClick={() => handleDeleteConversation(conversation.id)}
                >
                  <TrashSimple />
                </button>
                {!conversation.training_copy && (
                  <button
                    className={`${styles.option} ${styles.copy}`}
                    title="Retry a copy of this conversation"
                    onClick={() => handleCreateTrainingCopy(conversation.id)}
                  >
                    <ArrowsClockwise />
                  </button>
                )}
                {conversation.training_copy && (
                  <button
                    className={`${styles.option} ${styles.is_copy}`}
                    title="Open in training"
                    onClick={() => {
                      handleOpenInTraining(conversation.id);
                    }}
                  >
                    <ArrowRight />
                  </button>
                )}
              </div>
            </div>
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
                      <Lightning />
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
