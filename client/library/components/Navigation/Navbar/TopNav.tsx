import React, { useRef } from "react";
import styles from "./TopNav.module.scss";
import SVG from "../../Utils/SVG";
import { useNavigate } from "react-router-dom";
import { useSearchParamsUpdate } from "../../../hooks/navigation";
import Breadcrumbs from "../Breadcrumbs/Breadcrumbs";
import { ArrowLeft } from "@phosphor-icons/react";

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

  const hasSeenDisclaimer =
    localStorage.getItem("has_seen_disclaimer") === "true";
  if (!hasSeenDisclaimer) {
    localStorage.setItem("has_seen_disclaimer", "true");
  }

  return (
    <div
      className={`${styles.TopNav} ${alwaysScrolled ? styles.scrolled : ""} ${
        !hasSeenDisclaimer ? styles.hasDisclaimer : ""
      }`}
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
        <div className={styles.navigation}>
          <button
            className={styles.backbutton}
            onClick={() => {
              navigate(-1);
            }}
          >
            <ArrowLeft weight="bold" />
            Back
          </button>
          <div className={styles.breadcrumbsContainer}>
            <Breadcrumbs />
          </div>
        </div>
      )}
      {!hasSeenDisclaimer && (
        <div className={`${styles.disclaimer} ${styles.warning}`}>
          <p>
            Work has slowed on AIrtisan as {`I've`} moved to other projects.
            Feel free to{" "}
            <a href="mailto:aidantilgner02@gmail.com">contact me</a> for more
            information or support for any reason.
          </p>
        </div>
      )}
    </div>
  );
}

export default TopNav;
