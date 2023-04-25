import React from "react";
import styles from "./Profile.module.scss";
import { PencilSimple, User } from "@phosphor-icons/react";
import { useUser } from "../../contexts/User";
import { useGetMyOrganizations } from "../../hooks/fetching/common";

function Profile() {
  const { user } = useUser();
  const { data: organizations = [] } = useGetMyOrganizations({
    runOnMount: true,
  });

  console.log("User", user);
  console.log("Organizations", organizations);

  return (
    <div className={styles.Profile}>
      <div className={styles.left}>
        <div className={styles.iconContainer}>
          <div className={styles.icon}>
            <User weight="thin" />
          </div>
        </div>
        <div className="organizations">
          {organizations?.map((organization) => (
            <div key={organization.id}>{organization.name}</div>
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.name}>
          <span>{user?.username}</span>
          <button title="Edit username">
            <PencilSimple weight="regular" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
