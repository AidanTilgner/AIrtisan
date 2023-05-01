import React from "react";
import { useModal } from "../../contexts/Modals";
import { Box, Button, Flex, Modal } from "@mantine/core";

function GlobalModal() {
  const { modal, resetModal } = useModal();

  const Content = modal.content;

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
      <Box>
        <Content />
      </Box>
      <br />
      <Flex align="center" justify="flex-end" gap={14}>
        {modal.buttons
          .filter((b) => {
            return !!b.visible;
          })
          .map((button) => (
            <Button
              onClick={() => {
                resetModal();
                button.onClick();
              }}
              variant={button.variant}
              key={button.text}
              color={button.color}
              disabled={button.disabled}
            >
              {button.text}
            </Button>
          ))}
      </Flex>
    </Modal>
  );
}

export default GlobalModal;
