import React, { useState } from "react";
import styles from "./Autogenerate.module.scss";
import { Button, Flex, Grid, Loader, TextInput } from "@mantine/core";
import {
  useGenerateBotContextForPages,
  useGetPageLinks,
} from "../../../hooks/fetching/common";
import { showNotification } from "@mantine/notifications";
import { Info, TrashSimple } from "@phosphor-icons/react";

interface AutogenerateContextProps {
  afterSubmit: () => void;
  onClose: () => void;
}

function AutogenerateContext({
  afterSubmit,
  onClose,
}: AutogenerateContextProps) {
  const [formState, setFormState] = useState({
    url: "",
    exclude: "",
  });

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const [pageLinks, setPageLinks] = useState<string[] | undefined>();

  const formattedExclude =
    formState.exclude
      .split(",")
      .map((l) => {
        return l.trim();
      })
      .filter((e) => {
        return e !== "";
      }) || [];

  const { getPageLinks, loading } = useGetPageLinks(
    {
      url: formState.url,
      exclude: formattedExclude,
    },
    {
      dependencies: [formState],
      onSuccess: (data) => {
        setPageLinks(data);
      },
    }
  );

  const handleSubmitUrl = async () => {
    const res = await getPageLinks();
    if (!res?.data) {
      showNotification({
        title: "Error",
        message: "Something went wrong.",
        color: "red",
      });
      return;
    }
  };

  const { generateBotContextForPages, loading: loadingContext } =
    useGenerateBotContextForPages(
      {
        pages: pageLinks || [],
      },
      {
        dependencies: [pageLinks],
      }
    );

  const handleSubmit = async () => {
    const res = await generateBotContextForPages();
    if (!res?.data) {
      showNotification({
        title: "Error",
        message: "Something went wrong.",
        color: "red",
      });
      return;
    }
    showNotification({
      title: "Success",
      message: "Context generated.",
    });
    afterSubmit();
    onClose();
  };

  return (
    <div className={styles.Autogenerate}>
      <p className={styles.resources}>
        If you have questions, consider reading up on{" "}
        <a href="https://docs.airtisan.app" target="_blank" rel="noreferrer">
          the documentation
        </a>
        .
      </p>
      <Grid>
        <Grid.Col span={12}>
          <h2>
            Autogenerate Context <span className="beta">Beta</span>
          </h2>
          <p className="disclaimer">
            This is an experimental feature. It may not work as expected, and
            the results may not be accurate. We appreciate your patience and any
            feedback you can provide.
          </p>
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="Website URL"
            description="Enter the URL of the website you want to generate context for, and we'll find the pages."
            placeholder="https://example.com"
            required
            value={formState.url}
            onChange={(event) => {
              setFormState({ ...formState, url: event.currentTarget.value });
            }}
            error={
              isValidUrl(formState.url) || formState.url === ""
                ? false
                : "Please enter a valid URL."
            }
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="Excluded URLs"
            description="Enter a comma-separated list of page identifiers to exclude specific URLs from being crawled."
            placeholder="Enter excluded page identifiers (comma-separated)"
            value={formState.exclude}
            onChange={(event) => {
              setFormState({
                ...formState,
                exclude: event.currentTarget.value,
              });
            }}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <Flex align="center" gap={14}>
            <Button
              onClick={handleSubmitUrl}
              disabled={!isValidUrl(formState.url) || loading || loadingContext}
            >
              {pageLinks ? "Retry" : "Get Pages"}
            </Button>
            {loading && <Loader />}
          </Flex>
        </Grid.Col>
        <Grid.Col span={12} />
        {pageLinks && pageLinks.length > 0 ? (
          <>
            <Grid.Col span={12}>
              <h2>Pages Found {pageLinks.length >= 25 && "(Limited 25)"}</h2>
            </Grid.Col>
            <Grid.Col span={12}>
              <ul className={styles.links}>
                {pageLinks.map((link) => {
                  return (
                    <div key={link} className={styles.link}>
                      <a href={link} target="_blank" rel="noreferrer">
                        {link}
                      </a>
                      <div className={styles.link_buttons}>
                        <button
                          className={styles.link_buttons_delete}
                          onClick={() => {
                            if (pageLinks.length === 1) {
                              showNotification({
                                icon: <Info />,
                                title: "Info",
                                message: "You must have at least one page.",
                              });
                              return;
                            }
                            setPageLinks(pageLinks.filter((l) => l !== link));
                          }}
                          title="Remove from sources"
                        >
                          <TrashSimple />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </ul>
            </Grid.Col>
            <Grid.Col span={12}>
              <Flex align="center" gap={14}>
                <Button
                  onClick={handleSubmit}
                  disabled={pageLinks.length === 0 || loadingContext || loading}
                >
                  Generate Context
                </Button>
                {loadingContext && <Loader />}
              </Flex>
            </Grid.Col>
            {loadingContext && (
              <Grid.Col span={12}>
                <p className="disclaimer">
                  This could take a while. Maybe take a break, you deserve it!
                  You can always check back up later.
                </p>
              </Grid.Col>
            )}
          </>
        ) : (
          pageLinks && (
            <Grid.Col span={12}>
              <p>No pages found.</p>
            </Grid.Col>
          )
        )}
      </Grid>
    </div>
  );
}

export default AutogenerateContext;
