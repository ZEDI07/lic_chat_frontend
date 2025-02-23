import Constants from "expo-constants";
import { useContext } from "react";
import { Modal, Platform, Pressable, View, Text } from "react-native";
import { closeIcon } from "../constant/icons";
import { AppContext } from "../context/app";
import { SelectedContactView } from "./message/shareSheet";

const statusBarHeight = Constants.statusBarHeight;

export default ContactView = () => {
  const { Styles, contactView, setContactView, translation } = useContext(AppContext)
  const onClose = () => setContactView(null);
  if (contactView)
    return <Modal
      animationType="fade"
      transparent={true}
      visible={contactView ? true : false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={Styles.modalContainer}>
        <View
          style={Styles.modalmain}
          keyboardVerticalOffset={Platform.OS == "ios" ? statusBarHeight : 0}
          behavior="padding"
        >
          <View style={Styles.modalheader}>
            <Pressable onPress={onClose} style={Styles.modalheaderOption}>
              <View style={Styles.modalheaderOptionicon}>
                <View style={{ ...Styles.icon, ...Styles.icon24 }}>
                  {closeIcon(Styles.icondefault)}
                </View>
              </View>
            </Pressable>
            <View style={Styles.modalheaderinfo}>
              <Text style={Styles.modalheadertitle}>
                {translation.contact}
              </Text>
            </View>
          </View>
          <SelectedContactView view={true} selected={contactView} />
        </View>
      </View>
    </Modal>
  return null;
}