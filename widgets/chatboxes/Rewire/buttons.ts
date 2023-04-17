export const buttonMappings: {
  [key: string]: {
    action: (setMessage: (message: string) => void, metadata: unknown) => void;
    label: string;
    color: string;
  };
} = {
  play_greeting: {
    label: "Play Greeting",
    action: (setMessage, metadata) => {
      if (getMessageToSendOrNull(metadata)) {
        console.log("Sending message: ", getMessageToSendOrNull(metadata));
        setMessage(getMessageToSendOrNull(metadata) as string);
      }
    },
    color: "secondary",
  },
  see_services: {
    label: "See Services",
    action: () => {
      window.location.href = "https://vvibrant.dev/services";
    },
    color: "primary",
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
