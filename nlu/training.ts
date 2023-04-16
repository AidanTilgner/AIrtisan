// import default_corpus from "./documents/default_corpus.json";
import { readFileSync, writeFileSync } from "fs";
import { prettify_json } from "../utils/prettier";
import {
  getObjectsAlphabetically,
  removeDuplicatesFromObjects,
  removeDuplicatesFromStrings,
} from "../utils/methods";

type corpusDataPoint = {
  intent: string;
  utterances: string[];
  answers: string[];
  buttons?: { type: string }[];
  enhance?: boolean;
};

const getDefaultCorpus = () => {
  const buff = readFileSync("nlu/documents/default_corpus.json");
  const json = JSON.parse(buff.toString());
  return json as unknown as {
    name: string;
    locale: string;
    data: corpusDataPoint[];
  };
};

export const addData = async (data: {
  intent: string;
  utterances: string[];
  answers: string[];
  enhance?: boolean;
  buttons?: { type: string }[];
}) => {
  if (!data.intent) {
    console.error("Intent is required");
    return null;
  }

  const corpusData = getDefaultCorpus().data as corpusDataPoint[];

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

  const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: existingIntent || data,
  };

  return newCorpus;
};

export const addResponseToIntent = async (intent: string, response: string) => {
  const corpusData = getDefaultCorpus().data as corpusDataPoint[];

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

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const removeResponseFromIntent = async (
  intent: string,
  response: string
) => {
  const corpusData = getDefaultCorpus().data as corpusDataPoint[];

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.answers = existingIntent.answers.filter(
      (item) => item !== response
    );
  }

  const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const addOrUpdateUtteranceOnIntent = async (
  old_intent: string,
  new_intent: string,
  utterance: string
) => {
  // check the old intent for this utterance, if it exists, remove it
  const corpusData = getDefaultCorpus().data as corpusDataPoint[];
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

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: corpusData,
  };

  const newDataPoint = newCorpus.data.find(
    (item) => item.intent === new_intent
  );
  return newDataPoint;
};

export const removeUtteranceFromIntent = async (
  intent: string,
  utterance: string
) => {
  const corpusData = getDefaultCorpus().data as corpusDataPoint[];

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.utterances = existingIntent.utterances.filter(
      (item) => item !== utterance
    );
  }

  const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const addUtteranceToIntent = async (
  intent: string,
  utterance: string
) => {
  const corpusData = getDefaultCorpus().data as corpusDataPoint[];

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

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const enhanceIntent = (intent: string, shouldEnhance: boolean) => {
  const corpusData = getDefaultCorpus().data as corpusDataPoint[];

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.enhance = shouldEnhance;
  }

  const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: corpusData,
  };

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const updateButtonsOnIntent = async (
  intent: string,
  buttons: { type: string }[]
) => {
  const corpusData = getDefaultCorpus().data;

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.buttons = buttons;
  }

  const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: corpusData,
  };

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const removeButtonFromIntentByType = async (
  intent: string,
  type: string
) => {
  const corpusData = getDefaultCorpus().data;

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.buttons = existingIntent.buttons?.filter(
      (item) => item.type !== type
    );
  }

  const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const deleteDataPoint = async (intent: string) => {
  const corpusData = getDefaultCorpus().data;

  const newData = corpusData.filter((item) => item.intent !== intent);

  const sortedCorpusData = getObjectsAlphabetically(newData, "intent");

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: newData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  return newCorpus;
};

export const renameIntent = async (old_intent: string, new_intent: string) => {
  const corpusData = getDefaultCorpus().data;

  const existingIntent = corpusData.find((item) => item.intent === old_intent);
  if (existingIntent) {
    existingIntent.intent = new_intent.toLocaleLowerCase();
  }

  const sortedCorpusData = getObjectsAlphabetically(corpusData, "intent");

  writeFileSync(
    "./nlu/documents/default_corpus.json",
    prettify_json(
      JSON.stringify({
        ...getDefaultCorpus(),
        data: sortedCorpusData,
      })
    )
  );

  const newCorpus = {
    ...getDefaultCorpus(),
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find(
    (item) => item.intent === new_intent
  );
  return newDataPoint;
};
