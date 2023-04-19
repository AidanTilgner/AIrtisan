import { config } from "dotenv";
import { useOnyxCore } from "../utils/axios";
import { Logger } from "../utils/logger";
import { getTriggers } from "./metadata";
import { getSessionIfExists } from "../sessions/index";

config();

const triggerLogger = new Logger({
  name: "triggers",
});

export const activateTrigger = async (
  actionString: string,
  args: { [key: string]: any }
): Promise<{ success: boolean }> => {
  const response = await useOnyxCore()?.post(
    `/procedures/trigger/${actionString}`,
    {
      args,
    }
  );

  if (!response) {
    return { success: false };
  }

  const { data } = response;
  return data;
};

export const detectAndActivateTriggers = async (
  id: number,
  intent: string,
  session_id: string
) => {
  const triggers:
    | undefined
    | {
        type: string;
        args: { [key: string]: any };
        attachments: string[];
      }[] = (await getTriggers(id))[intent];

  if (!triggers) {
    return;
  }

  const triggersReturned: { [type: string]: boolean } = {};
  triggers.forEach(async (trigger) => {
    try {
      const { type, args, attachments } = trigger;

      const promisedAttachments = attachments.map((a) => {
        return triggerAttachmentMethods[a]({ session_id });
      });

      const attached = await Promise.all(promisedAttachments);

      args.attachments = attached;

      const triggerRes = await activateTrigger(type, args);
      const success = triggerRes.success;
      if (!success) {
        triggerLogger.error(`Trigger ${type} failed to activate`);
      } else {
        triggerLogger.info(
          `Trigger ${type} activated with args ${JSON.stringify(args)}`
        );
      }

      triggersReturned[type] = success;
    } catch (err) {
      triggerLogger.error(`Error completing trigger "${trigger.type}": `, err);
    }
  });

  return triggersReturned;
};

interface TriggerAttachmentArgs {
  session_id: string;
}
export const triggerAttachmentMethods: {
  [key: string]: (
    args: TriggerAttachmentArgs
  ) => Promise<{ [key: string]: any }>;
} = {
  session_ip_address: async ({ session_id }: TriggerAttachmentArgs) => {
    const session = getSessionIfExists(session_id);
    if (!session) {
      return {
        ip: "unknown",
      };
    }
    return { ip: session.getIpIfSet() };
  },
};
