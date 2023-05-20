import React, { useEffect, useRef } from "react";
import styles from "./Floating.module.scss";
import { Chat } from "@phosphor-icons/react";

function Index() {
  const [clicked, setClicked] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout>();
  const [elementPosition, setElementPosition] = React.useState<number>();

  const onyxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("mousemove", (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    });
  }, []);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const newTimeout = setTimeout(() => {
      if (mousePosition.x < window.innerWidth - 100) {
        setElementPosition(mousePosition.y - 28);
      }
    }, 500);

    setTimeoutId(newTimeout);
  }, [mousePosition]);

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  window.addEventListener("resize", () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  });

  const getElementPosition = () => {
    if (isMobile) {
      return "calc(100vh - 92px)";
    }
    if (elementPosition) {
      if (elementPosition < 82 || elementPosition > window.innerHeight - 82) {
        return "calc(100vh - 92px)";
      } else {
        return `${elementPosition}px`;
      }
    }
    return "calc(100vh - 92px)";
  };

  return (
    <div
      className={`${styles.onyx} ${clicked ? styles.clicked : ""}`}
      onClick={() => {
        setClicked(true);
        setTimeout(() => {
          setClicked(false);
        }, 300);
      }}
      ref={onyxRef}
      style={{
        top: getElementPosition(),
      }}
    >
      <div className={styles.backgroundCircleOne} />
      <div className={styles.backgroundCircleTwo} />
      <div className={styles.backgroundCircleThree} />
      <div className={styles.backgroundCircleFour} />
      <div className={styles.container}>
        <Chat />
      </div>
    </div>
  );
}

export default Index;
