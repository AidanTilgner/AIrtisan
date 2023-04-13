import React, { useLayoutEffect } from "react";
import styles from "./Corpus.module.scss";
import { getDefaultCorpus } from "../../helpers/fetching";
import {
  CorpusDataPoint,
  Corpus as CorpusType,
} from "../../../documentation/main";
import { showNotification } from "@mantine/notifications";
import Search from "../../components/Search/Search";
import { useSearch } from "../../contexts/Search";
import { Highlight } from "@mantine/core";

function Corpus() {
  const { query } = useSearch();

  const [fullCorpus, setFullCorpus] = React.useState<CorpusType>();

  React.useEffect(() => {
    getDefaultCorpus().then(({ success, data }) => {
      if (!success || !data) {
        console.error("Error fetching corpus");
        showNotification({
          title: "Error fetching corpus",
          message: "Please try again later",
        });
        return;
      }
      setFullCorpus(data);
    });
  }, []);

  const getFilteredData = () => {
    return fullCorpus?.data?.filter((dataPoint) => {
      const intentPassesQuery = dataPoint.intent.includes(query);
      const utterancesPassQuery = dataPoint.utterances.some((utterance) =>
        utterance.includes(query)
      );
      const answersPassQuery = dataPoint.answers.some((answer) =>
        answer.includes(query)
      );
      const enhancePassQuery =
        dataPoint.enhance && query.toLowerCase() === "enhance";
      const buttonsPassQuery = dataPoint.buttons?.some((button) =>
        button.type.includes(query)
      );

      const passesQuery =
        intentPassesQuery ||
        utterancesPassQuery ||
        answersPassQuery ||
        buttonsPassQuery ||
        enhancePassQuery;

      return passesQuery;
    });
  };

  useLayoutEffect(() => {
    (
      [
        ...document.getElementsByClassName(styles.intentContainer),
      ] as HTMLElement[]
    ).forEach((c, i) => {
      c.style.animationDelay = `${i * 0.1}s`;
    });
  }, [getFilteredData()]);

  const [openIntent, setOpenIntent] = React.useState<string | null>(null);

  return (
    <div className={styles.Corpus}>
      <header>
        <h1>
          {fullCorpus?.name || "Corpus"}
          <span>{fullCorpus?.locale}</span>
        </h1>
      </header>
      <div className={styles.searchArea}>
        <div className={styles.searchContainer}>
          <Search />
        </div>
      </div>
      <div className={styles.data}>
        {getFilteredData()?.length ? (
          getFilteredData()?.map((dataPoint, index) => (
            <div className={styles.intentContainer} key={index}>
              <Intent
                intent={dataPoint.intent}
                utterances={dataPoint.utterances}
                answers={dataPoint.answers}
                buttons={dataPoint.buttons}
                enhance={dataPoint.enhance}
                setOpenIntent={setOpenIntent}
                openIntent={openIntent}
              />
            </div>
          ))
        ) : (
          <p className={styles.disclaimer}>No data yet.</p>
        )}
      </div>
    </div>
  );
}

export default Corpus;

interface IntentProps extends CorpusDataPoint {
  setOpenIntent: (intent: string | null) => void;
  openIntent: string | null;
}

export const Intent = ({
  intent,
  utterances,
  answers,
  buttons,
  enhance,
  setOpenIntent,
  openIntent,
}: IntentProps) => {
  const { query } = useSearch();

  const getTopText = () => {
    const intentString = intent;
    const shortedIntentString = intentString.substring(0, 24);
    const shortedIntentStringWithEllipsis =
      shortedIntentString + (intentString.length > 24 ? "..." : "");
    return shortedIntentStringWithEllipsis;
  };

  const getBottomText = () => {
    const utteranceString = utterances.join(", ");
    const shortedUtteranceString = utteranceString.substring(0, 36);
    const shortedUtteranceStringWithEllipsis =
      shortedUtteranceString + (utteranceString.length > 36 ? "..." : "");
    return shortedUtteranceStringWithEllipsis;
  };

  return (
    <div className={styles.intentContainer}>
      <div
        className={styles.intent}
        tabIndex={0}
        onClick={() => {
          if (openIntent === intent) {
            setOpenIntent(null);
          } else {
            setOpenIntent(intent);
          }
        }}
      >
        <h3 className={styles.toptext}>
          <Highlight highlight={query.toLocaleLowerCase()}>
            {getTopText().toLocaleLowerCase()}
          </Highlight>
        </h3>
        <div className={styles.bottomtext}>
          <Highlight highlight={query.toLocaleLowerCase()}>
            {getBottomText().toLocaleLowerCase()}
          </Highlight>
        </div>
      </div>
      {openIntent === intent && <div className={styles.intentOpen}>opened</div>}
    </div>
  );
};
