import React from 'react';

import {
  Box,
  ListItemButton,
  List,
  ListItem,
} from '@mui/material';
// import { useTranslation } from 'react-i18next';
import { useGlobalState } from '../../utils/globalStateManager/globalStateInit';

import TextDate from '../atoms/typography/TextDate';
import Avatar from '../atoms/Avatar';
import Text from '../atoms/typography/Text';

// here add gsm for the rooms

interface RoomProps {
  name: string,
  date: string,
  message: string,
}

export const RoomBox = function RoomBox({
  name,
  date,
  message,
}: RoomProps) {
  // const { t } = useTranslation();

  return (
    <Box className="row width--full">
      <Avatar name={name} className="roomsClass" />
      <Box className="col pl--8" sx={{ width: 'calc(100% - 48px)' }}>
        <Box className="row mb--4">
          <Text variant="name" className="flex-grow--1 width--150">{name}</Text>
          <TextDate className="date">{date}</TextDate>
        </Box>
        <Text>{message}</Text>
        {/* dont know why but the translation make text non print on screen */}
        {/* <Text>{message === '' ? t('any_message_historic') : message}</Text> */}
      </Box>
    </Box>
  );
};

// const example = [
//   {
//     name: 'Groupe révision pour le bac',
//     date: '11/22/2021',
//     message: "Salut, c'est pour avoir des infos sur le dernier devoir! Que faut-il faire ?",
//   },
//   {
//     name: 'Alexis',
//     date: '10/22/2021',
//     message: 'Salut, comment va ?',
//   },
//   {
//     name: 'Marie',
//     date: '09/22/2021',
//     message: 'Répond b****t',
//   },
//   {
//     name: 'Les zinzolins',
//     date: '05/22/2021',
//     message: 'Ca cuve ce soir ??',
//   },
// ];

function Rooms() {
  const { state, setState } = useGlobalState();

  const changeRoom = (roomId: string) => {
    const newState = state;
    newState.activeRoom = roomId;

    setState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <List disablePadding>
      {state?.rooms?.map((item?) => (
        <ListItem
          disablePadding
          className="border--bottom border--contrast"
          key={`room-${item?.name}`}
        >
          <ListItemButton onClick={() => changeRoom(item?.roomId)} className="p--8">
            <RoomBox
              name={item?.name as string}
              date={item?.lastMessage?.messageDate as string}
              message={item?.lastMessage?.message as string}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}

export default Rooms;
