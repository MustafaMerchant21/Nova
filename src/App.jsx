import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import Orb from "./components/Orb";
import "./App.css";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const Settings_Icon = ({ size = 24 }) => (<svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, { role: "user", content: message }]);
      setMessage("");
      // TODO: Send message to AI
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    onOpenChange();
  };

  return (
    <div className="h-screen w-screen bg-background flex flex-col p-4 gap-4 overflow-hidden">
      {/* Top Menu Bar */}
      <Navbar
        className="rounded-2xl bg-content1/50 backdrop-blur-md border border-default-200/50"
        maxWidth="full"
      >
        <NavbarBrand>
          <p className="font-bold text-inherit">NOVA</p>
        </NavbarBrand>

        <NavbarContent className="gap-4" justify="center">
          <Dropdown>
            <NavbarItem>
              <DropdownTrigger>
                <Button variant="light" className="text-foreground">
                  File
                </Button>
              </DropdownTrigger>
            </NavbarItem>
            <DropdownMenu aria-label="File actions">
              <DropdownItem key="new">New Session</DropdownItem>
              <DropdownItem key="open">Open...</DropdownItem>
              <DropdownItem key="save">Save Chat</DropdownItem>
              <DropdownItem key="export">Export</DropdownItem>
              <DropdownItem key="quit" className="text-danger" color="danger">
                Quit
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <NavbarItem>
              <DropdownTrigger>
                <Button variant="light" className="text-foreground">
                  Edit
                </Button>
              </DropdownTrigger>
            </NavbarItem>
            <DropdownMenu aria-label="Edit actions">
              <DropdownItem key="undo">Undo</DropdownItem>
              <DropdownItem key="redo">Redo</DropdownItem>
              <DropdownItem key="clear">Clear Chat</DropdownItem>
              <DropdownItem key="preferences">Preferences</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <NavbarItem>
              <DropdownTrigger>
                <Button variant="light" className="text-foreground">
                  View
                </Button>
              </DropdownTrigger>
            </NavbarItem>
            <DropdownMenu aria-label="View options">
              <DropdownItem key="fullscreen">Fullscreen</DropdownItem>
              <DropdownItem key="sidebar">Toggle Sidebar</DropdownItem>
              <DropdownItem key="chatlog">Toggle Chat Log</DropdownItem>
              <DropdownItem key="zoom-in">Zoom In</DropdownItem>
              <DropdownItem key="zoom-out">Zoom Out</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <Dropdown>
            <NavbarItem>
              <DropdownTrigger>
                <Button variant="light" className="text-foreground">
                  Help
                </Button>
              </DropdownTrigger>
            </NavbarItem>
            <DropdownMenu aria-label="Help options">
              <DropdownItem key="docs">Documentation</DropdownItem>
              <DropdownItem key="shortcuts">Keyboard Shortcuts</DropdownItem>
              <DropdownItem key="about">About Nova</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button color="primary" variant="flat" startContent={<Settings_Icon size={16} color="#ffffff" />} size="sm">
              Settings
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* Main Content Area - 3 Column Layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Panel - Tasks */}
        <div className="w-80 bg-content1/50 backdrop-blur-md rounded-2xl border border-default-200/50 p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-foreground/80">Tasks</h2>
          <div className="flex-1 flex items-center justify-center text-foreground/40">
            <p>Other tasks...</p>
          </div>
        </div>

        {/* Center Panel - AI Blob */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {/* AI Orb */}
          <div className="w-72 h-72 bg-[#000000]">
            <Orb
              hue={0}
              hoverIntensity={0.35}
              rotateOnHover={false}
              forceHoverState={isListening}
              backgroundColor="#000000"
            />
          </div>

          {/* Start/Stop Button */}
          <Button
            color={isListening ? "danger" : "primary"}
            variant="bordered"
            size="lg"
            className="rounded-xl px-8"
            onPress={toggleListening}
          >
            {isListening ? "Stop" : "Start"}
          </Button>
        </div>

        {/* Right Panel - Chat Logs */}
        <div className="w-96 bg-content1/50 backdrop-blur-md rounded-2xl border border-default-200/50 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground/80">Chat Log</h2>
            {chatHistory.length > 0 && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={onOpen}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </Button>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {chatHistory.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-foreground/40">
                <p className="text-center px-4">Start chatting with Nova...</p>
              </div>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${msg.role === "user"
                    ? "bg-primary/20 ml-auto max-w-[80%]"
                    : "bg-content2/50 mr-auto max-w-[80%]"
                    }`}
                >
                  <p className="text-sm text-foreground">{msg.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onValueChange={setMessage}
              onKeyDown={handleKeyPress}
              classNames={{
                input: "text-foreground",
                inputWrapper: "bg-content2/50 border-default-200/50",
              }}
            />
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              onPress={handleSendMessage}
              isDisabled={!message.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} backdrop="blur" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Clear Chat History</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete all chat messages? This action cannot be undone.</p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={handleClearHistory}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default App;
