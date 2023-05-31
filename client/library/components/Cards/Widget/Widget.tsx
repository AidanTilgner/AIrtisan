import React from "react";
import styles from "./Widget.module.scss";
import { ArrowRight } from "@phosphor-icons/react";

function Widget({
  children,
  title,
  buttons,
}: {
  children: JSX.Element;
  title: string;
  buttons?: JSX.Element[];
}) {
  return (
    <div className={styles.widget}>
      <div className={styles.widget_title}>
        <h3>{title}</h3>
        {buttons?.length && (
          <div className={styles.widget_title_buttons}>
            {buttons.map((button) => button)}
          </div>
        )}
      </div>
      <div className={styles.widget_body}>{children}</div>
    </div>
  );
}

export default Widget;

Widget.Content = function WidgetContent({
  children,
}: {
  children: JSX.Element;
}) {
  return <div className={styles.widget_content}>{children}</div>;
};

Widget.Grid = function WidgetGrid({
  items,
  fallback,
}: {
  items: {
    label: string;
    icon: JSX.Element;
    onClick: () => void;
    tooltip?: string;
  }[];
  fallback?: JSX.Element | string;
}) {
  return (
    <div className={styles.widget_grid}>
      {items.length > 0 ? (
        <div className={styles.items}>
          {items.map((item) => {
            return (
              <button
                key={item.label}
                className={styles.widget_grid_item}
                onClick={item.onClick}
                title={item.tooltip || item.label}
              >
                <div className={styles.widget_grid_info}>
                  <span className={styles.widget_grid_icon}>{item.icon}</span>
                  <span className={styles.widget_grid_label}>{item.label}</span>
                </div>
                <ArrowRight />
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.fallback}>{fallback}</div>
      )}
    </div>
  );
};
