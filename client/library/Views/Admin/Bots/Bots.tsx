import React from "react";
import styles from "./Bots.module.scss";
import { useGetAllBots } from "../../../hooks/fetching/bot";
import { useSearch } from "../../../contexts/Search";
import { getFormattedBotOwner } from "../../../helpers/formating";
import { useNavigate } from "react-router-dom";
import { Grid, Title } from "@mantine/core";
import Search from "../../../components/Search/Search";
import BotCard from "../../../components/Cards/Bot/BotCard";

function Bots() {
  const { data: allBots } = useGetAllBots({
    runOnMount: true,
  });

  const { query } = useSearch();

  // const [showSuperAdmins, setShowSuperAdmins] = React.useState(false);

  const filteredBots = allBots?.filter((bot) => {
    const passesQuery = () => {
      if (!query) return true;
      const passes = [
        bot.name,
        bot.slug,
        bot.id,
        getFormattedBotOwner(bot),
      ].some((field) => {
        return (
          field && String(field)?.toLowerCase().includes(query.toLowerCase())
        );
      });
      return passes;
    };

    return passesQuery();
  });

  const navigate = useNavigate();

  return (
    <div className={styles.Bots}>
      <Grid>
        <Grid.Col span={12}>
          <Title order={2}>Bots</Title>
        </Grid.Col>
        <Grid.Col span={12}>
          <Search />
        </Grid.Col>
        <Grid.Col span={12} />
        <Grid.Col span={12} />
        <Grid.Col span={12}>
          {filteredBots && filteredBots?.length > 0 ? (
            <div className={styles.Bots__container}>
              {filteredBots.map((bot) => {
                return (
                  <BotCard
                    bot={bot}
                    key={bot.id}
                    onClick={() => navigate(`/bot/${bot.id}`)}
                  />
                );
              })}
            </div>
          ) : (
            <p>There are no bots to display.</p>
          )}
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default Bots;
