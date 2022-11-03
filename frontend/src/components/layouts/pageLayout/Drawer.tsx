import { useTranslation } from 'react-i18next';

import {
  Box,
  Drawer as MuiDrawer,
} from '@mui/material/';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import Title from 'components/atoms/typography/Title';

import Modal from 'components/molecules/Modal';
import Rooms from 'components/molecules/Rooms';

import AddRoom from 'components/layouts/pageLayout/AddRoom';

interface DrawerProps {
    handleClickDrawerButton: () => void;
    isDrawerOpen: boolean;
}

function Drawer(props: DrawerProps): JSX.Element {
  const { t } = useTranslation();

  const drawer = (
    <>
      <Box className="row border--bottom p--16 height--32 flex--space-between">
        <Title className="line-height--32" variant="room">
          {t('rooms')}
        </Title>
        <Modal
          buttonLabel={<AddIcon />}
          clickableVariant="iconButton"
        >
          <AddRoom />
        </Modal>
      </Box>
      <Rooms />
    </>
  );

  return (
    <>
      <MuiDrawer
        id="drawer"
        variant="temporary"
        open={props.isDrawerOpen}
        onClose={props.handleClickDrawerButton}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: '280px' },
        }}
      >
        {drawer}
      </MuiDrawer>
      <MuiDrawer
        id="drawer"
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: '280px' },
        }}
      >
        {drawer}
      </MuiDrawer>
    </>
  );
}

export default Drawer;
