
import { useContext, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { AppContext } from "../context/app";
import { chatMute } from "../services/chat";

const MuteDialog = () => {
  const [selectedOption, setSelectedOption] = useState(2);
  const {
    muteOpen: chat,
    muteOpen,
    setMuteOpen,
    translation,
    Styles
  } = useContext(AppContext);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const onClose = () => {
    setMuteOpen(null);
    setSelectedOption(2);
  };

  const handleOk = () => {
    chatMute({ chat: [chat], duration: selectedOption });
    onClose();
  };

  const Radio = ({ selected }) => (
    <View style={{ ...Styles.radioinput }} >
      {selected && (
        <View style={{ ...Styles.radioinputactive }} />
      )}
    </View>
  );
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={muteOpen ? true : false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable onPress={onClose} style={Styles.mutemodalContainer}>
        <View style={Styles.mutemodalContant}>
          <Text style={{ ...Styles.mutemodalHeading, ...Styles.fontdefault }}>
            {translation.muteNotification}
          </Text>
          <Text style={{ ...Styles.mutemodalDes, ...Styles.fontdefault }}>{translation.muteDescription}</Text>

          <Pressable onPress={() => handleOptionChange(2)}>
            <View style={Styles.muteoptionitem}>
              <Radio selected={selectedOption === 2} />
              <Text style={Styles.fontdefault}>{translation["8hours"]}</Text>
            </View>
          </Pressable>

          <Pressable onPress={() => handleOptionChange(3)}>
            <View style={Styles.muteoptionitem}>
              <Radio selected={selectedOption === 3} />
              <Text style={Styles.fontdefault}>{translation["1week"]}</Text>
            </View>
          </Pressable>

          <Pressable onPress={() => handleOptionChange(1)}>
            <View style={Styles.muteoptionitem}>
              <Radio selected={selectedOption === 1} />
              <Text style={Styles.fontdefault}>{translation.always}</Text>
            </View>
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 20,
              marginRight: 10,
            }}
          >
            <Pressable onPress={onClose}>
              <Text style={{ ...Styles.fontdanger }}>{translation.cancel}</Text>
            </Pressable>
            <Pressable onPress={handleOk}>
              <Text style={{ ...Styles.fontprimary }}>{translation.ok}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default MuteDialog;
