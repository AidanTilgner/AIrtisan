import React, { useRef } from "react";
import styles from "./TopNav.module.scss";
import SVG from "../../Utils/SVG";
import { useNavigate } from "react-router-dom";

function TopNav() {
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);

  window.addEventListener("scroll", () => {
    if (window.scrollY > 0 && navRef.current) {
      navRef.current.classList.add(styles.scrolled);
    } else if (navRef.current) {
      navRef.current.classList.remove(styles.scrolled);
    }
  });

  return (
    <div className={styles.TopNav} ref={navRef}>
      <button
        className={styles.logo}
        onClick={() => {
          navigate("/");
        }}
        tabIndex={0}
      >
        <SVG.OnyxLogo width="36" height="36" />
      </button>
    </div>
  );
}

export default TopNav;
