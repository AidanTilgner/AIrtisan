import React, { useEffect, useLayoutEffect, useRef } from "react";
import styles from "./ReviewConversations.module.scss";
import { Button, Chip, Highlight, SegmentedControl } from "@mantine/core";
import { useUser } from "../../contexts/User";
import {
  MagicWand,
  WarningCircle,
  ArrowsClockwise,
  TrashSimple,
  ArrowRight,
  Graph,
} from "@phosphor-icons/react";
import { useSearchParams } from "react-router-dom";
import {
  Chat,
  Conversation as ConversationType,
  ConversationToReview,
} from "../../../documentation/main";
import { showNotification } from "@mantine/notifications";
import Search from "../../components/Search/Search";
import { useSearch } from "../../contexts/Search";
import { useModal } from "../../contexts/Modals";
import {
  useCreateTrainingCopyOfConversation,
  useDeleteConversation,
  useGetConversations,
  useGetConversationsThatNeedReview,
  useGetRecentConversations,
  useMarkChatAsReviewed,
} from "../../hooks/fetching/common";
import { useSearchParamsUpdate } from "../../hooks/navigation";

function ReviewConversations() {
  const { query } = useSearch();

  // const [conversations, setConversations] = React.useState<
  //   ConversationToReview[]
  // >([]);
  // const [allConversations, setAllConversations] = React.useState<
  //   ConversationType[]
  // >([]);

  const { data: allConversations, getConversations } = useGetConversations({
    runOnMount: true,
  });
  const { data: conversations, getConversationsThatNeedReview } =
    useGetConversationsThatNeedReview({
      runOnMount: true,
    });

  const { data: recentConversations } = useGetRecentConversations({
    runOnMount: true,
  });

  const [openedConversation, setOpenedConversation] =
    React.useState<ConversationToReview | null>(null);

  const reloadConversations = async () => {
    await getConversationsThatNeedReview();
    await getConversations();
  };

  const [viewMode, setViewMode] = React.useState<"all" | "review" | "recent">(
    "all"
  );

  const [allowEnhanced, setAllowEnhanced] = React.useState(true);
  const [allowNoneIntent, setAllowNoneIntent] = React.useState(true);
  const [allowTrainingCopy, setAllowTrainingCopy] = React.useState(true);
  const [showUnnamed, setShowUnnamed] = React.useState(false);

  const conversationContainsNoneIntent = (conversation: ConversationType) => {
    return conversation.chats.find(
      (chat) => chat.intent.toLowerCase() === "none"
    );
  };

  const [searchParams] = useSearchParams();

  const filterConversations = (convs: ConversationType[]) => {
    const lowercaseQuery = query.toLowerCase();
    const filtered = convs.filter((conv) => {
      const isEnhanced = conv.chats.find((chat) => !!chat.enhanced);
      const passesEnhanced = allowEnhanced ? true : !isEnhanced;
      const passesTrainingCopy = allowTrainingCopy ? true : !conv.training_copy;
      const passesNoneIntent = allowNoneIntent
        ? true
        : !conversationContainsNoneIntent(conv);
      const passesShowUnnamed = showUnnamed ? true : !!conv.generated_name;

      if (!query) {
        return (
          passesEnhanced &&
          passesTrainingCopy &&
          passesNoneIntent &&
          passesShowUnnamed
        );
      }

      const generated_name_contains_query = conv.generated_name
        ? conv.generated_name?.toLowerCase().includes(lowercaseQuery)
        : "Unnamed Conversation".toLowerCase().includes(lowercaseQuery);

      const conversation_id_contains_query = String(conv.id)
        .toLowerCase()
        .includes(lowercaseQuery);

      const session_id_contains_query = conv.session_id
        .toLowerCase()
        .includes(lowercaseQuery);

      const conversation_is_training_copy = conv.training_copy
        ? ["training", "copy"].includes(lowercaseQuery)
        : false;

      const someChatPassesQuery = conv.chats.some((chat) => {
        const message_contains_query = chat.message
          .toLowerCase()
          .includes(lowercaseQuery);

        const chat_id_contains_query = String(chat.id)
          .toLowerCase()
          .includes(lowercaseQuery);

        const reviewer_contains_query = chat.reviewer
          ?.toLowerCase()
          .includes(lowercaseQuery);

        const review_text_contains_query = chat.review_text
          ?.toLowerCase()
          .includes(lowercaseQuery);

        const chat_time_contains_query =
          String(chat.created_at).includes(lowercaseQuery) ||
          String(chat.updated_at).includes(lowercaseQuery);

        return (
          message_contains_query ||
          chat_id_contains_query ||
          reviewer_contains_query ||
          review_text_contains_query ||
          chat_time_contains_query
        );
      });

      const passesQuery =
        generated_name_contains_query ||
        conversation_id_contains_query ||
        session_id_contains_query ||
        conversation_is_training_copy ||
        someChatPassesQuery;

      return (
        passesQuery &&
        passesEnhanced &&
        passesTrainingCopy &&
        passesNoneIntent &&
        passesShowUnnamed
      );
    });

    return filtered;
  };

  const conversationsToView =
    viewMode === "all"
      ? filterConversations(allConversations || [])
      : viewMode === "review"
      ? filterConversations(conversations || [])
      : viewMode === "recent"
      ? filterConversations(recentConversations || [])
      : [];

  useEffect(() => {
    if (searchParams.get("load_conversation")) {
      setViewMode("all");
      const foundConversation = conversationsToView?.find((conv) => {
        const is = conv.id === Number(searchParams.get("load_conversation"));
        return is;
      });

      if (openedConversation && openedConversation.id === foundConversation?.id)
        return;
      setOpenedConversation(
        {
          ...(foundConversation as ConversationToReview),
        } || null
      );
    }
  }, [searchParams, conversationsToView]);

  useLayoutEffect(() => {
    (
      [...document.getElementsByClassName(styles.conversation)] as HTMLElement[]
    ).forEach((c, i) => {
      c.style.animationDelay = `${i * 0.1}s`;
    });
  }, [conversationsToView]);

  const conversationNoLongerExists = (id: number) => {
    return !conversationsToView.find((c) => c.id === id);
  };

  useEffect(() => {
    if (
      openedConversation &&
      openedConversation.id &&
      conversationNoLongerExists(openedConversation.id)
    ) {
      setOpenedConversation(null);
    }
  }, [conversationsToView]);

  const updateSearchParams = useSearchParamsUpdate();

  useEffect(() => {
    if (
      openedConversation &&
      openedConversation.id &&
      openedConversation?.id !== Number(searchParams.get("load_conversation"))
    ) {
      updateSearchParams(new Map([["load_conversation", ""]]));
    }
  }, [openedConversation]);

  return (
    <div className={styles.ReviewConversations}>
      <div className={styles.header}>
        <h1>Conversations</h1>
        <SegmentedControl
          data={[
            {
              label: "All",
              value: "all",
            },
            {
              label: "For Review",
              value: "review",
            },
            {
              label: "Recent",
              value: "recent",
            },
          ]}
          onChange={(v) => {
            if (!v) return;
            setViewMode(v as "all" | "review" | "recent");
          }}
        />
      </div>
      <div className={styles.searchContainer}>
        <Search />
      </div>
      <div className={styles.filtersContainer}>
        <div className={styles.filter}>
          <Chip checked={allowEnhanced} onChange={(v) => setAllowEnhanced(v)}>
            Enhanced
          </Chip>
        </div>
        <div className={styles.filter}>
          <Chip
            checked={allowNoneIntent}
            onChange={(v) => setAllowNoneIntent(v)}
          >
            None Intent
          </Chip>
        </div>
        <div className={styles.filter}>
          <Chip
            checked={allowTrainingCopy}
            onChange={(v) => setAllowTrainingCopy(v)}
          >
            For Training
          </Chip>
        </div>
        <div className={styles.filter}>
          <Chip checked={showUnnamed} onChange={(v) => setShowUnnamed(v)}>
            Show Unnamed
          </Chip>
        </div>
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
            <p className={styles.disclaimer}>
              {viewMode === "all" || viewMode === "recent"
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
  const { setQuery, query } = useSearch();

  const getConversationChats = seeFullConversation
    ? conversation.chats
    : conversation.chats?.filter((c, i, chats) => {
        // chat is either in chats_to_review, or the next chat is in chats_to_review
        return c.needs_review || chats[i + 1]?.needs_review;
      });

  const reloadChats = () => {
    const cs = getConversationChats;
    setChats(cs);
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

  const { markChatAsReviewed } = useMarkChatAsReviewed({
    username: user?.username || "N/A",
  });

  const handleMarkReviewed = async (chatId: number) => {
    if (!user) return;
    await markChatAsReviewed({
      updatedUrl: `/chat/as_admin/${chatId}/reviewed/`,
    });
    reloadConversations();
  };

  const { createTrainingCopyOfConversation } =
    useCreateTrainingCopyOfConversation(conversation.id as number);

  const updateSearchParams = useSearchParamsUpdate();

  const handleCreateTrainingCopy = async () => {
    if (!user) return;
    const response = await createTrainingCopyOfConversation();

    if (!response || !response.data) {
      console.error("Failed to create training copy of conversation");
      showNotification({
        title: "Error",
        message: "Failed to create training copy of conversation",
        color: "red",
      });
      return;
    }

    const { id: new_id } = response.data;

    if (!new_id) {
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

    updateSearchParams(
      new Map([
        ["load_conversation", `${new_id}`],
        ["tab", "training"],
      ])
    );
    reloadConversations();
  };

  const { setModal, closeModal } = useModal();

  const { deleteConversation } = useDeleteConversation(
    conversation.id as number
  );

  const handleDeleteConversation = async () => {
    if (!user) return;
    setModal({
      title: "Delete Conversation",
      content: () => <p>Are you sure you want to delete this conversation?</p>,
      buttons: [
        {
          text: "Cancel",
          onClick: () => closeModal(),
          variant: "default",
          visible: true,
        },
        {
          text: "Delete",
          visible: true,
          onClick: async () => {
            const res = await deleteConversation();

            if (!res || !res.success || !res.data) {
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
            });

            setOpenedConversation(null);
            reloadConversations();
          },
          variant: "filled",
          color: "red",
        },
      ],
      type: "confirmation",
      onClose: () => closeModal(),
      size: "sm",
    });
  };

  const handleOpenInTraining = async () => {
    if (!user) return;
    updateSearchParams(
      new Map([
        ["load_conversation", `${conversation.id}`],
        ["tab", "training"],
      ])
    );
  };

  const chatWasEnhanced = !!conversation.chats.find((c) => c.enhanced === true);

  const chatHasNoneIntent = !!conversation.chats.find(
    (c) => c.intent.toLocaleLowerCase() === "none"
  );

  const chatNeedsReview = !!conversation.chats.find(
    (c) => c.needs_review === true
  );

  const getFormattedTimeStamp = (timestamp: string) => {
    const date = new Date(timestamp);

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const hoursWithLeadingZero = hours < 10 ? `0${hours}` : hours;
    const minutesWithLeadingZero = minutes < 10 ? `0${minutes}` : minutes;
    const dayOfTheWeek = date.toLocaleDateString("en-US", {
      weekday: "short",
    });
    const month = date.toLocaleDateString("en-US", {
      month: "short",
    });
    const day = date.getDate();
    const year = date.getFullYear();

    return `${hoursWithLeadingZero}:${minutesWithLeadingZero} ${dayOfTheWeek} ${month} ${day}, ${year}`;
  };

  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openedConversation?.id === conversation.id && conversationRef.current) {
      // scroll the ref to the top of the screen
      conversationRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [openedConversation, conversation.id, conversationRef.current]);

  const updateSearchParamsState = useSearchParamsUpdate();

  return (
    <div
      key={conversation.id}
      className={`${styles.conversation_interface} ${
        openedConversation ? styles.conversation_is_open : ""
      }`}
      ref={conversationRef}
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
        onKeyDown={(e) => {
          if (e.key === "Enter") {
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
          }
        }}
        tabIndex={0}
      >
        <h3 className={styles.title}>
          {chatNeedsReview && (
            <span className={styles.warning_icon} title="Needs review.">
              <WarningCircle weight="bold" />
            </span>
          )}
          <Highlight highlight={query}>
            {getFormattedTitle(conversation)}
          </Highlight>
        </h3>
        <Highlight highlight={query} className={styles.bottomtext}>
          {getShortenedText(
            conversation.chats.find((c) =>
              c.message.toLocaleLowerCase().includes(query.toLocaleLowerCase())
            )?.message ||
              conversation.chats[0]?.message ||
              "No messages",
            48
          )}
        </Highlight>
        <div className={styles.tags}>
          {chatWasEnhanced && (
            <div
              className={`${styles.tag} ${styles.tag_enhanced}`}
              title="This conversation has an enhanced chat."
            >
              enhanced
            </div>
          )}
          {conversation.training_copy && (
            <div
              className={`${styles.tag} ${styles.tag_training_copy}`}
              title="This conversation is a for training."
            >
              for training
            </div>
          )}
          {chatHasNoneIntent && (
            <div
              className={`${styles.tag} ${styles.tag_none_intent}`}
              title="This conversation has a chat with the 'None' intent."
            >
              none intent
            </div>
          )}
        </div>
      </div>
      {openedConversation && openedConversation.id === conversation.id && (
        <div className={styles.opened_conversation}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              <Highlight highlight={query}>
                {openedConversation.generated_name || "No Generated Name"}
              </Highlight>
            </h2>
            <div className={styles.metadata}>
              <Highlight highlight={query} className={styles.subtitle}>
                {openedConversation.session_id}
              </Highlight>
              <div className={styles.options}>
                <button
                  className={`${styles.option} ${styles.delete}`}
                  title="Delete this conversation"
                  onClick={() => {
                    if (!conversation.id) return;
                    handleDeleteConversation();
                  }}
                >
                  <TrashSimple />
                </button>
                {!conversation.training_copy && (
                  <button
                    className={`${styles.option} ${styles.copy}`}
                    title="Retry a copy of this conversation"
                    onClick={() => {
                      if (!conversation.id) return;
                      handleCreateTrainingCopy();
                    }}
                  >
                    <ArrowsClockwise />
                  </button>
                )}
                {conversation.training_copy && (
                  <button
                    className={`${styles.option} ${styles.is_copy}`}
                    title="Open in training"
                    onClick={() => {
                      if (!conversation.id) return;
                      handleOpenInTraining();
                    }}
                  >
                    <ArrowRight />
                  </button>
                )}
                <button
                  className={`${styles.option} ${styles.graph}`}
                  title="View conversation graph"
                  onClick={() => {
                    if (!conversation.id) return;
                    updateSearchParamsState(new Map([["tab", "flows"]]));
                  }}
                >
                  <Graph />
                </button>
              </div>
            </div>
          </div>
          <div className={styles.chats}>
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div key={chat.id} className={styles.chatContainer}>
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
                    <Highlight highlight={query} className={styles.content}>
                      {chat.message}
                    </Highlight>
                    {chat.created_at && (
                      <p
                        className={styles.timestamps}
                        onClick={() => {
                          setQuery(chat.created_at);
                        }}
                      >
                        <span className={styles.timestamp}>
                          {getFormattedTimeStamp(chat.created_at)}
                        </span>
                      </p>
                    )}
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
                    {/* {chat.role === "user" && (
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
                  )} */}
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  width: "100%",
                  fontSize: "12px",
                  opacity: 0.5,
                  margin: "18px 0",
                }}
              >
                No chats found.{" "}
              </p>
            )}
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
