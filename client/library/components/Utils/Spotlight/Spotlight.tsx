import React from "react";
import { SpotlightProvider, SpotlightAction } from "@mantine/spotlight";
import {
  House,
  MagnifyingGlass,
  PaintBrush,
  Robot,
  User,
} from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/User";
import { useSettings } from "../../../contexts/Settings";

interface SpotlightProps {
  children: JSX.Element | JSX.Element[];
}

function Spotlight({ children }: SpotlightProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useUser();
  const {
    theme: { toggle: toggleTheme },
  } = useSettings();

  const actions: (SpotlightAction & { showIf?: () => boolean })[] = [
    {
      title: "Go Home",
      description: "Go to the home page",
      onTrigger: () => {
        navigate("/");
      },
      icon: <House />,
      showIf: () => {
        return !(location.pathname === "/");
      },
    },
    {
      title: "My Profile",
      description: "View your profile",
      onTrigger: () => {
        navigate(`/profile/${user?.username}`);
      },
      icon: <User />,
    },
    {
      title: "New Bot",
      description: "Create a new bot",
      onTrigger: () => {
        navigate("/bots/create");
      },
      icon: <Robot />,
    },
    {
      title: "Toggle Theme",
      description: "Toggle between light and dark mode",
      onTrigger: () => {
        toggleTheme();
      },
      icon: <PaintBrush />,
    },
  ];

  const filteredActions = actions.filter((action) => {
    if (action.showIf) {
      return action.showIf();
    }
    return true;
  });

  return (
    <div>
      <SpotlightProvider
        actions={filteredActions}
        searchIcon={<MagnifyingGlass />}
        searchPlaceholder="Search AIrtisan..."
        shortcut="mod + shift + k"
        nothingFoundMessage="No results..."
        styles={{
          action: {
            fontWeight: 500,
          },
          searchInput: {
            fontWeight: 500,
          },
        }}
      >
        <div>{children}</div>
      </SpotlightProvider>
    </div>
  );
}

export default Spotlight;
