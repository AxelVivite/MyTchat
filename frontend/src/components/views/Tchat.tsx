import React from 'react';
import Box from '@mui/material/Box';

import useWebSocket from 'react-use-websocket';
import PageLayout from '../layouts/pageLayout/PageLayout';
import WelcomeBack from '../molecules/WelcomeBack';
import Message from '../molecules/Message';
import InputMessage from '../molecules/InputBarMessage';
import { Post, Room, Friend } from '../../utils/globalStateManager/globalStateObjects';
import { getMessages } from '../../utils/roomsManagment';
import { useGlobalState } from '../../utils/globalStateManager/globalStateInit';

function Tchat() {
  const { state, setState } = useGlobalState();
  const [messages, setMessages] = React.useState([] as Post[]);
  const [socketUrl] = React.useState(`ws://13.68.235.186:8080/room/websocket?token=${state.token}`);
  const { lastMessage } = useWebSocket(socketUrl);

  React.useEffect(() => {
    if (lastMessage !== null) {
      const msg = JSON.parse(lastMessage.data);
      if (msg.type === 'NewPost' && msg.roomId === state.activeRoom) {
        const actRoom: Room | undefined = state.rooms?.filter(
          (room) => room.roomId === state.activeRoom,
        )[0];
        const newMsgSender = actRoom?.friends?.filter((friend) => friend.userId === msg.userId)[0];
        const newMsg: Post = {
          message: msg.content,
          messageDate: msg.createdAt,
          sender: newMsgSender as Friend,
        };
        setMessages([...messages.concat(newMsg)]);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessage]);

  React.useEffect(() => {
    (async () => {
      const messagesHere = await getMessages(state.token as string, state.activeRoom as string);
      setMessages(messagesHere);
    })();

    if (localStorage.getItem('darkTheme') === 'true') {
      document.body.classList.add('dark-theme');
      localStorage.setItem('darkTheme', 'true');
      setState((prev) => ({ ...prev, darkModeIsOn: true }));
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('darkTheme', 'false');
      setState((prev) => ({ ...prev, darkModeIsOn: false }));
    }
  }, [state.token, state.activeRoom, setState]);

  React.useEffect(() => {
    const element = document.getElementById('tchat');

    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  return (
    <PageLayout>
      <Box
        sx={{ minHeight: 'calc(100vh - 96px)', maxHeight: 'calc(100vh - 96px)' }}
        className="col"
      >
        {state.activeRoom ? (
          <>
            <Box
              id="tchat"
              sx={{ maxHeight: 'calc(100vh - 96px - 72px)' }}
              className="pl--8 mr--8 tchat__scrollbar flex-grow--1 mb--16 tchat"
            >
              {
                !messages ? <div /> : messages.map((value: Post) => (
                  <Message
                    key={`key-message-${value?.sender?.username}-${value?.messageDate}-${value?.message}`}
                    username={value?.sender?.username as string}
                    datetime={value?.messageDate}
                    message={value?.message}
                  />
                ))
              }
            </Box>
            <InputMessage
              messages={messages}
              setMessages={setMessages}
            />
          </>
        ) : (
          <WelcomeBack />
        )}
      </Box>
    </PageLayout>
  );
}

export default Tchat;
