import { generateRefreshToken } from "../../utils/crypto";
import { entities, dataSource } from "..";

export const createRefreshToken = async (id: number) => {
  const token = await dataSource.manager.save(entities.Token, {
    token: generateRefreshToken(id),
    admin_id: id,
  });
  return token;
};

export const getRefreshToken = async (token: string) => {
  const tokenEntity = await dataSource.manager.findOne(entities.Token, {
    where: { token },
  });
  return tokenEntity;
};

export const deleteRefreshToken = async (token: string) => {
  const result = await dataSource.manager.delete(entities.Token, {
    token,
  });
  return result;
};

export const deleteAllRefreshTokensForAdmin = async (id: number) => {
  const result = await dataSource.manager.delete(entities.Token, {
    admin_id: id,
  });

  return result;
};
