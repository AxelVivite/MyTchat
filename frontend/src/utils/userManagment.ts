import axios from 'axios';
import { Friend } from './globalStateManager/globalStateObjects';

const devUrl = 'http://13.68.235.186:8080';

export const register = async (email: string, password: string, username: string) => {
  const { data, status } = await axios.post<undefined>(
    `${devUrl}/login/register`,
    { email, password, username },
  );
  return { data, status };
};

export const login = async (email: string, password: string) => {
  const { data, status } = await axios.get<object>(
    `${devUrl}/login/signin/${email}`,
    {
      headers: {
        Authorization: `Basic ${password}`,
      },
    },
  );
  if (status === 200) {
    return { data, status };
  }
  return { data, status };
};

interface getUsernameInterface {
  username: string;
}

interface usersInterface {
  username: string;
  userId: string;
  key: number;
}

const matchUsernameAndId = async (usersName: [string], me?: string) => {
  try {
    const users: usersInterface[] = [];
    await Promise.all(usersName.map(async (value, index) => {
      const { data, status } = await axios.get(
        `${devUrl}/login/userId/${value}`,
      );

      if (status === 200) {
        if ((me !== null && me !== value) || (me === null)) {
          const newUser: usersInterface = {
            username: value,
            userId: data.userId,
            key: index,
          };
          users.push(newUser);
        }
      }
    }));
    return users;
  } catch (err) {
    return null;
  }
};

export const getAllUsers = async (me?: string) => {
  try {
    const { data, status } = await axios.get(
      `${devUrl}/login/users`,
    );
    if (status === 200) {
      if (me !== null) {
        return matchUsernameAndId(data.users, me);
      }
      return matchUsernameAndId(data.users);
    }
  } catch (err) {
    return [];
  }
  return [];
};

export const getAllUsernames = async (username: string | undefined) => {
  try {
    const allUsers = await getAllUsers(username);
    if (allUsers === null) {
      return [];
    }
    return allUsers;
  } catch (err) {
    return [];
  }
};

export const getUsername = async (userId: string, token: string) => {
  try {
    const { data, status } = await axios.get<getUsernameInterface>(
      `${devUrl}/login/username/${userId}`,
      {
        headers: {
          token: `Bearer ${token}`,
        },
      },
    );
    if (status === 200) {
      return data.username;
    }
  } catch (err) {
    return null;
  }
  return null;
};

export const getFriendsList = async (token: string, friendsId: string[], userId: string) => {
  const friends: Friend[] = [];
  if (friendsId.length === 0) { return []; }
  friendsId.forEach(async (value) => {
    if (value !== userId) {
      const friendName = await getUsername(value, token);
      const friend: Friend = {
        userId: value,
        username: friendName as string,
      };
      friends.push(friend);
    }
  });

  return friends;
};
