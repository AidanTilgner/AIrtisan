// import default_corpus from "./documents/default_corpus.json";
import {
  getObjectsAlphabetically,
  removeDuplicatesFromObjects,
  removeDuplicatesFromStrings,
} from "../utils/methods";
import { getBotCorpus, updateBotCorpus } from "../database/functions/bot";

type corpusDataPoint = {
  intent: string;
  utterances: string[];
  answers: string[];
  buttons?: { type: string }[];
  enhance?: boolean;
};

const getDefaultCorpus = async (id: number) => {
  try {
    const botFile = await getBotCorpus(id);
    return botFile as unknown as {
      name: string;
      locale: string;
      data: corpusDataPoint[];
    };
  } catch (error) {
    console.error(error);
  }
};

export const addData = async (newData: {
  id: number;
  intent: string;
  utterances: string[];
  answers: string[];
  enhance?: boolean;
  buttons?: { type: string }[];
}) => {
  try {
    const { id, ...data } = newData;

    if (!data.intent) {
      console.error("Intent is required");
      return null;
    }

    const corpusData = (await getDefaultCorpus(id))?.data as corpusDataPoint[];

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const existingIntent = corpusData.find(
      (intent) => intent.intent === data.intent
    );
    if (existingIntent) {
      const cleanedUtterances = removeDuplicatesFromStrings([
        ...data.utterances,
        ...existingIntent.utterances,
      ]);
      existingIntent.utterances = cleanedUtterances;

      const cleanedAnswers = removeDuplicatesFromStrings([
        ...data.answers,
        ...existingIntent.answers,
      ]);
      existingIntent.answers = cleanedAnswers;

      const cleanedButtons = removeDuplicatesFromObjects(
        [...(data.buttons || []), ...(existingIntent.buttons || [])],
        "type"
      );
      existingIntent.buttons = cleanedButtons;
      existingIntent.enhance = data.enhance || existingIntent.enhance;
    } else {
      corpusData.push({
        ...data,
        intent: data.intent.toLocaleLowerCase(),
      });
    }

    const sortedCorpusData = getObjectsAlphabetically(
      corpusData,
      "intent"
    ) as corpusDataPoint[];

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    return newCorpus;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const addResponseToIntent = async (
  id: number,
  intent: string,
  response: string
) => {
  try {
    const corpusData = (await getDefaultCorpus(id))?.data as corpusDataPoint[];

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const existingIntent = corpusData.find((item) => item.intent === intent);
    if (existingIntent) {
      existingIntent.answers
        ? existingIntent.answers.push(response)
        : (existingIntent.answers = [response]);
    } else {
      corpusData.push({
        intent,
        utterances: [],
        answers: [response],
      });
    }

    const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    if (!newCorpus) {
      console.error("Corpus not found");
      return null;
    }

    const newDataPoint = newCorpus.data.find(
      (item: any) => item.intent === intent
    );
    return newDataPoint;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const removeResponseFromIntent = async (
  id: number,
  intent: string,
  response: string
) => {
  try {
    const corpusData = (await getDefaultCorpus(id))?.data as corpusDataPoint[];

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const existingIntent = corpusData.find((item) => item.intent === intent);
    if (existingIntent) {
      existingIntent.answers = existingIntent.answers.filter(
        (item) => item !== response
      );
    }

    const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    if (!newCorpus) {
      console.error("Corpus not found");
      return null;
    }

    const newDataPoint = newCorpus.data.find(
      (item: any) => item.intent === intent
    );
    return newDataPoint;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const addOrUpdateUtteranceOnIntent = async (
  botId: number,
  old_intent: string,
  new_intent: string,
  utterance: string
) => {
  try {
    // check the old intent for this utterance, if it exists, remove it
    const corpusData = (await getDefaultCorpus(botId))
      ?.data as corpusDataPoint[];

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const oldIntent = corpusData.find((item) => item.intent === old_intent);
    if (oldIntent) {
      oldIntent.utterances = oldIntent.utterances.filter(
        (item) => item !== utterance && item !== utterance.toLocaleLowerCase()
      );
    }

    // check the new intent for this utterance, if it exists, do nothing, if it doesn't, add it
    const newIntent = corpusData.find((item) => item.intent === new_intent);
    if (newIntent) {
      newIntent.utterances
        ? newIntent.utterances.push(utterance)
        : (newIntent.utterances = [utterance]);
    } else {
      corpusData.push({
        intent: new_intent,
        utterances: [utterance],
        answers: [],
      });
    }

    const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

    const newCorpus = await updateBotCorpus(botId, {
      ...getDefaultCorpus(botId),
      data: sortedCorpusData,
    });

    if (!newCorpus) {
      console.error("Corpus not found");
      return null;
    }

    const newDataPoint = newCorpus.data.find(
      (item: any) => item.intent === new_intent
    );
    return newDataPoint;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const removeUtteranceFromIntent = async (
  id: number,
  intent: string,
  utterance: string
) => {
  try {
    const corpusData = (await getDefaultCorpus(id))?.data as corpusDataPoint[];

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const existingIntent = corpusData.find((item) => item.intent === intent);
    if (existingIntent) {
      existingIntent.utterances = existingIntent.utterances.filter(
        (item) => item !== utterance
      );
    }

    const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    if (!newCorpus) {
      console.error("Corpus not found");
      return null;
    }

    const newDataPoint = newCorpus.data.find(
      (item: any) => item.intent === intent
    );
    return newDataPoint;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const addUtteranceToIntent = async (
  id: number,
  intent: string,
  utterance: string
) => {
  try {
    const corpusData = (await getDefaultCorpus(id))?.data as corpusDataPoint[];

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const existingIntent = corpusData.find((item) => item.intent === intent);
    if (existingIntent) {
      existingIntent.utterances?.length
        ? existingIntent.utterances.push(utterance)
        : (existingIntent.utterances = [utterance]);
    } else {
      corpusData.push({
        intent,
        utterances: [utterance],
        answers: [],
      });
    }

    const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    if (!newCorpus) {
      console.error("Corpus not found");
      return null;
    }

    const newDataPoint = newCorpus.data.find(
      (item: any) => item.intent === intent
    );
    return newDataPoint;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const enhanceIntent = async (
  id: number,
  intent: string,
  shouldEnhance: boolean
) => {
  try {
    const corpusData = (await getDefaultCorpus(id))?.data as corpusDataPoint[];

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const existingIntent = corpusData.find((item) => item.intent === intent);
    if (existingIntent) {
      existingIntent.enhance = shouldEnhance;
    }

    const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    if (!newCorpus) {
      console.error("Corpus not found");
      return null;
    }

    const newDataPoint = newCorpus.data.find(
      (item: any) => item.intent === intent
    );
    return newDataPoint;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateButtonsOnIntent = async (
  id: number,
  intent: string,
  buttons: { type: string }[]
) => {
  try {
    const corpusData = (await getDefaultCorpus(id))?.data;

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const existingIntent = corpusData.find((item) => item.intent === intent);
    if (existingIntent) {
      existingIntent.buttons = buttons;
    }

    const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    if (!newCorpus) {
      console.error("Corpus not found");
      return null;
    }

    const newDataPoint = newCorpus.data.find(
      (item: any) => item.intent === intent
    );
    return newDataPoint;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const removeButtonFromIntentByType = async (
  id: number,
  intent: string,
  type: string
) => {
  try {
    const corpusData = (await getDefaultCorpus(id))?.data;

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const existingIntent = corpusData.find((item) => item.intent === intent);
    if (existingIntent) {
      existingIntent.buttons = existingIntent.buttons?.filter(
        (item) => item.type !== type
      );
    }

    const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    if (!newCorpus) {
      console.error("Corpus not found");
      return null;
    }

    const newDataPoint = newCorpus.data.find(
      (item: any) => item.intent === intent
    );
    return newDataPoint;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteDataPoint = async (id: number, intent: string) => {
  try {
    const corpusData = (await getDefaultCorpus(id))?.data;

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const newData = corpusData.filter((item) => item.intent !== intent);

    const sortedCorpusData = getObjectsAlphabetically(newData, "intent");

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    return newCorpus;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const renameIntent = async (
  id: number,
  old_intent: string,
  new_intent: string
) => {
  try {
    const corpusData = (await getDefaultCorpus(id))?.data;

    if (!corpusData) {
      console.error("Corpus data not found");
      return null;
    }

    const existingIntent = corpusData.find(
      (item) => item.intent === old_intent
    );
    if (existingIntent) {
      existingIntent.intent = new_intent.toLocaleLowerCase();
    }

    const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

    const newCorpus = await updateBotCorpus(id, {
      ...getDefaultCorpus(id),
      data: sortedCorpusData,
    });

    if (!newCorpus) {
      console.error("Corpus not found");
      return null;
    }

    const newDataPoint = newCorpus.data.find(
      (item: any) => item.intent === new_intent
    );
    return newDataPoint;
  } catch (error) {
    console.error(error);
    return null;
  }
};
