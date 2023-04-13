import default_corpus from "./documents/default_corpus.json";
import { writeFileSync } from "fs";
import { prettify_json } from "../utils/prettier";

type corpusDataPoint = {
  intent: string;
  utterances: string[];
  answers: string[];
  buttons?: { type: string }[];
  enhance?: boolean;
};

export const addData = async (data: {
  intent: string;
  utterances: string[];
  answers: string[];
}) => {
  const corpusData = default_corpus.data as corpusDataPoint[];

  const existingIntent = corpusData.find(
    (intent) => intent.intent === data.intent
  );
  if (existingIntent) {
    existingIntent.utterances.push(...(data.utterances || []));
    existingIntent.answers.push(...(data.answers || []));
  } else {
    corpusData.push(data);
  }

  const newCorpus = {
    ...default_corpus,
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  return newCorpus;
};

export const addResponseToIntent = async (intent: string, response: string) => {
  const corpusData = default_corpus.data as corpusDataPoint[];

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

  const newCorpus = {
    ...default_corpus,
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
  const corpusData = default_corpus.data as corpusDataPoint[];

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.answers = existingIntent.answers.filter(
      (item) => item !== response
    );
  }

  const newCorpus = {
    ...default_corpus,
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
  const corpusData = default_corpus.data as corpusDataPoint[];
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

  const newCorpus = {
    ...default_corpus,
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find(
    (item) => item.intent === new_intent
  );
  return newDataPoint;
};

export const removeUtteranceFromIntent = async (
  intent: string,
  utterance: string
) => {
  const corpusData = default_corpus.data as corpusDataPoint[];

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.utterances = existingIntent.utterances.filter(
      (item) => item !== utterance
    );
  }

  const newCorpus = {
    ...default_corpus,
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
  const corpusData = default_corpus.data as corpusDataPoint[];

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

  const newCorpus = {
    ...default_corpus,
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const enhanceIntent = (intent: string, shouldEnhance: boolean) => {
  const corpusData = default_corpus.data as corpusDataPoint[];

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.enhance = shouldEnhance;
  }

  const newCorpus = {
    ...default_corpus,
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const updateButtonsOnIntent = async (
  intent: string,
  buttons: { type: string }[]
) => {
  const corpusData = default_corpus.data;

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.buttons = buttons;
  }

  const newCorpus = {
    ...default_corpus,
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};

export const removeButtonFromIntentByType = async (
  intent: string,
  type: string
) => {
  const corpusData = default_corpus.data;

  const existingIntent = corpusData.find((item) => item.intent === intent);
  if (existingIntent) {
    existingIntent.buttons = existingIntent.buttons?.filter(
      (item) => item.type !== type
    );
  }

  const newCorpus = {
    ...default_corpus,
    data: corpusData,
  };

  const formatted = prettify_json(JSON.stringify(newCorpus));

  writeFileSync("./nlu/documents/default_corpus.json", formatted);

  const newDataPoint = newCorpus.data.find((item) => item.intent === intent);
  return newDataPoint;
};
