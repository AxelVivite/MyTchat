import React from 'react';
import { useTranslation } from 'react-i18next';

import TextField from '@mui/material/TextField';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

import { sendMessage } from '../../utils/roomsManagment';
import { useGlobalState } from '../../utils/globalStateManager/globalStateInit';
import IconButton from '../atoms/buttons/IconButton';
import { Post } from '../../utils/globalStateManager/globalStateObjects';

interface InputBarMessageProps {
  onSubmit: () => void | undefined,
  messages: Post[],
  setMessages: React.Dispatch<React.SetStateAction<Post[]>>,

}

const InputBarMessage = function InputBarMessage({
  // eslint-disable-next-line no-unused-vars
  onSubmit,
  messages,
  setMessages,
}: InputBarMessageProps) {
  const { t } = useTranslation();
  const { state } = useGlobalState();
  const [formData, setFormData] = React.useState<string>('');

  const handleSubmit = () => {
    if (formData === '') {
      return;
    }

    sendMessage(
      state.token as string,
      formData,
      state.activeRoom as string,
    ).then(() => {
      const msgTmp = messages;
      const newMsg: Post = {
        message: formData,
        sender: {
          username: state.user?.username as string,
          userId: state.user?.userId as string,
        },
        messageDate: new Date().toString(),
      };

      msgTmp.push(newMsg);
      setMessages(msgTmp);
    })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="row">
      <TextField
        className="flex-grow--1"
        multiline
        maxRows={4}
        placeholder={t('Message')}
        variant="outlined"
        onChange={(event) => setFormData(event.target.value)}
      />
      <IconButton
        className="input-bar--btn"
        onClick={handleSubmit}
        type="button"
        variant="outlined"
      >
        <KeyboardReturnIcon />
      </IconButton>
    </div>
  );
};

export default InputBarMessage;
