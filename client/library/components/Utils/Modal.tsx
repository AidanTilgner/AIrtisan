import React from "react";
import { useModal } from "../../contexts/Modals";
import { Box, Button, Flex, Modal } from "@mantine/core";

function GlobalModal() {
  const { modal, resetModal } = useModal();

  return (
    <Modal
      opened={modal.open}
      title={modal.title}
      onClose={() => {
        resetModal();
        modal.onClose();
      }}
      size={modal.size}
    >
      <Box>{modal.content}</Box>
      <br />
      <Flex align="center" justify="flex-end" gap={14}>
        {modal.buttons.map((button) => (
          <Button
            onClick={() => {
              resetModal();
              button.onClick();
            }}
            variant={button.variant}
            key={button.text}
            color={button.color}
          >
            {button.text}
          </Button>
        ))}
      </Flex>
    </Modal>
  );
}

export default GlobalModal;
