export const buttonMappings: {
  [key: string]: {
    action: (setMessage: (message: string) => void, metadata: unknown) => void;
    label: string;
    type: string;
  };
} = {
  send_greeting: {
    label: "Say Hello",
    action: (setMessage, metadata) => {
      if (getMessageToSendOrNull(metadata)) {
        setMessage(getMessageToSendOrNull(metadata) as string);
      }
    },
    type: "message",
  },
  see_services: {
    label: "See Services",
    action: () => {
      window.location.href = "https://vvibrant.dev/services";
    },
    type: "action",
  },
  contact_directly: {
    label: "Get in Touch",
    action: () => {
      window.location.href = "https://vvibrant.dev/contact";
    },
    type: "action",
  },
};

function validateMetadataIsNonEmptyObject(metadata: unknown): boolean {
  return typeof metadata === "object" && metadata !== null;
}

function getMessageToSendOrNull(metadata: unknown): string | null {
  if (
    validateMetadataIsNonEmptyObject(metadata) &&
    "message_to_send" in (metadata as Record<string, unknown>) &&
    typeof (metadata as Record<string, unknown>).message_to_send === "string"
  ) {
    return (metadata as Record<string, string>).message_to_send;
  }
  return null;
}
