import React from "react";
import { useGetAllAdminTemplates } from "../../hooks/fetching/operations";
import Loaders from "../../components/Utils/Loaders";
import styles from "./index.module.scss";
import TemplateCard from "../../components/Cards/Template/TemplateCard";

function index() {
  const { data: allTemplates, loading } = useGetAllAdminTemplates({
    runOnMount: true,
  });

  if (loading) {
    return (
      <div>
        <Loaders.CenteredSpinner />
      </div>
    );
  }

  return (
    <div className={styles.templates}>
      <div className={styles.templateList}>
        {allTemplates?.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}

export default index;
