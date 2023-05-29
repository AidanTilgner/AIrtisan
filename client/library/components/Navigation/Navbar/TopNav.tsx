import React, { useRef } from "react";
import styles from "./TopNav.module.scss";
import SVG from "../../Utils/SVG";
import { useNavigate } from "react-router-dom";
import { useSearchParamsUpdate } from "../../../hooks/navigation";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";

function TopNav({ alwaysScrolled }: { alwaysScrolled?: boolean }) {
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);

  window.addEventListener("scroll", () => {
    if (alwaysScrolled) return;
    if (window.scrollY > 0 && navRef.current) {
      navRef.current.classList.add(styles.scrolled);
    } else if (navRef.current) {
      navRef.current.classList.remove(styles.scrolled);
    }
  });

  const updateParams = useSearchParamsUpdate();

  const isMobile = window.innerWidth < 768;

  return (
    <div
      className={`${styles.TopNav} ${alwaysScrolled ? styles.scrolled : ""}`}
      ref={navRef}
    >
      <button
        className={styles.logo}
        onClick={() => {
          updateParams(null);
          navigate("/");
        }}
        tabIndex={0}
      >
        <SVG.OnyxLogo width="36" height="36" />
      </button>
      {isMobile ? null : (
        <div className={styles.breadcrumbsContainer}>
          <Breadcrumbs />
        </div>
      )}
    </div>
  );
}

export default TopNav;
