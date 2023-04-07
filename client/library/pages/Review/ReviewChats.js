import React from "react";
import withStyles from "react-css-modules";
import styles from "./ReviewChats.module.scss";
import { getChatsThatNeedReview } from "../../helpers/fetching/chats";

function ReviewChats() {
  const [chats, setChats] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const chats = await getChatsThatNeedReview();
      setChats(chats);
    })();
  }, []);

  return (
    <div className={styles.ReviewChats}>
      <h1>Review Chats</h1>
      <div className={styles.chats}>
        {chats.length ? (
          chats.map((chat) => (
            <div className={styles.chat} key={chat.id}>
              <h2>{chat.id}</h2>
              <p>{chat.text}</p>
            </div>
          ))
        ) : (
          <p>No chats to review.</p>
        )}
      </div>
    </div>
  );
}

export default withStyles(styles)(ReviewChats);
