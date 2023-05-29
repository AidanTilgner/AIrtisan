import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Breadcrumbs as MantineBreadcrumbs, Anchor } from "@mantine/core";
import styles from "./Breadcrumbs.module.scss";

type AvailableParams = "username" | "organization_id" | "bot_id";

const getFormattedPathPoint = (pathpoint: string) => {
  // looks something like "organizations" or "device-types"
  const formatted = pathpoint
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
  return formatted;
};

interface BreadcrumbModule {
  name: string;
  parent: AvailableParams | AvailableParams[] | undefined;
  // eslint-disable-next-line no-unused-vars
  endpoint: (params: { [key: string]: string | undefined }) => string;
}

interface ResolvedBreadcrumbModule {
  name: string;
  endpoint: string;
  type: string;
  moduleName: string;
}

interface BreadcrumbModules {
  [key: string]: BreadcrumbModule;
}

function Breadcrumbs() {
  const params = useParams();

  const moduleBreakdown: BreadcrumbModules = {
    username: {
      name: "Profile",
      parent: undefined,
      endpoint: () => `/profile/${params.username}`,
    },
    organization_id: {
      name: "Organization",
      parent: undefined,
      endpoint: () => `/organizations/${params.organization_id}`,
    },
    bot_id: {
      name: "Bot",
      parent: undefined,
      endpoint: () => `/bots/${params.bot_id}`,
    },
  };

  const ignoreParams: string[] = [];

  const getDrilldown = () => {
    const drilldown: ResolvedBreadcrumbModule[] = [];
    Object.keys(params).forEach((key) => {
      if (ignoreParams.includes(key)) {
        return;
      }
      const resolvedBreadcrumbModule: ResolvedBreadcrumbModule = {
        name: moduleBreakdown[key].name,
        endpoint: moduleBreakdown[key].endpoint(params),
        type: key as AvailableParams,
        moduleName: moduleBreakdown[key].name,
      };
      drilldown.push(resolvedBreadcrumbModule);
    });
    return drilldown;
  };

  const resolveDrilldownModules = async () => {
    const drilldown = getDrilldown();
    const promises = drilldown.map(async (dr) => {
      return {
        ...dr,
        name: dr.name,
      };
    });
    setDrilldown(await Promise.all(promises));
  };

  useEffect(() => {
    resolveDrilldownModules();
  }, [params]);

  const [drilldown, setDrilldown] = useState<ResolvedBreadcrumbModule[]>([]);

  const { pathname } = useLocation();

  const rules: {
    [key: string]: {
      show: boolean;
    };
  } = {};

  const [fullPath, setFullPath] = useState<ResolvedBreadcrumbModule[]>([]);

  const showFullPath = false;

  const homePath = {
    name: "Home",
    endpoint: "/",
    type: "home",
    moduleName: "Home",
  };

  const getFullPath = () => {
    if (!showFullPath) {
      return drilldown;
    }
    const drdn = [...drilldown].reverse();
    const fullpath = pathname
      .split("/")
      .filter((p) => p)
      .map((p) => {
        if (Number(p) && drdn.length > 0) {
          return drdn.pop() as ResolvedBreadcrumbModule;
        }

        return {
          name: getFormattedPathPoint(p),
          endpoint: "",
          type: p,
          moduleName: getFormattedPathPoint(p),
        };
      })
      .filter((p) => {
        if (rules[p.type] && !rules[p.type].show) {
          return false;
        }
        return true;
      });

    for (let i = 0; i < fullpath.length; i += 1) {
      const point = fullpath[i];
      if (!point.endpoint) {
        const pathnameUntilPoint = pathname.slice(
          0,
          pathname.indexOf(point.type) + point.type.length + 1
        );
        fullpath[i].endpoint = pathnameUntilPoint;
      }
    }

    return fullPath;
  };

  useEffect(() => {
    setFullPath(getFullPath());
  }, [drilldown]);

  console.log("fullPath", fullPath, getFullPath());

  if (!fullPath.length) {
    return null;
  }

  return (
    <div className={styles.breadcrumbs}>
      <MantineBreadcrumbs>
        {fullPath.map((breadcrumb) => (
          <Anchor
            href={breadcrumb.endpoint}
            key={breadcrumb.name}
            style={{
              position: "relative",
            }}
          >
            {breadcrumb.name}{" "}
            <div
              style={{
                position: "absolute",
                top: "17px",
                right: "0",
                left: "0",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  color: "var(--text-light)",
                  opacity: 0.4,
                  fontWeight: 300,
                }}
              >
                {breadcrumb.moduleName}
              </span>
            </div>
          </Anchor>
        ))}
      </MantineBreadcrumbs>
    </div>
  );
}

export default Breadcrumbs;
