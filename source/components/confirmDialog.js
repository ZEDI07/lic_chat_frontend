
import { default as React, useContext } from "react";
import { Modal, Platform, Pressable, Text, View } from "react-native";
import { closeIcon } from "../constant/icons";
import { AppContext } from "../context/app";

const ConfirmationDialog = () => {
  const { confirmationDialog, setConfimationDialog, Styles } = useContext(AppContext);
  const onClose = () => setConfimationDialog(null);
  return <Modal
    animationType="fade"
    transparent={true}
    visible={confirmationDialog ? true : false}
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <Pressable
      onPress={onClose}
      style={{ ...Styles.modalContainer, margin: 0 }}
    >
      {Platform.OS !== "web" ? (
        <View style={{ ...Styles.optionsmodalContainer }}>
          <View style={{ ...Styles.optionsmodaloptions }}>
            <View style={Styles.optionsmodalheader}>
              <Text style={{ ...Styles.optionsmodalTitle }}>
                {confirmationDialog.heading}
              </Text>
            </View>
            <View
              style={{ ...Styles.confirmmodalcontent, paddingVertical: 0 }}
            >
              <Text
                style={{ ...Styles.optionsmodaldes, ...Styles.textcenter }}
              >
                {confirmationDialog.message}
              </Text>
              <Pressable
                onPress={() => {
                  confirmationDialog.callback(confirmationDialog.chat);
                  onClose();
                }}
                style={{ ...Styles.optionsmodalitem, ...Styles.btn, ...Styles.btnPrimary, ...Styles.mtop5 }}
              >
                <Text
                  style={{
                    ...Styles.optionsmodalitemtext,
                    ...Styles.fontwhite,
                    ...Styles.textcenter,
                  }}
                >
                  Confirm
                </Text>
              </Pressable>
            </View>
          </View>
          <Pressable onPress={onClose} style={{ ...Styles.cancelButton }}>
            <Text style={{ ...Styles.cancelButtonText, ...Styles.textcenter }}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ ...Styles.modalmain, ...Styles.confirmmodalmain }}>
          <View style={Styles.modalheader}>
            <View style={{ ...Styles.modalheaderOptionicon }}></View>
            <View style={Styles.modalheaderinfo}>
              <Text style={Styles.modalheadertitle}>
                {confirmationDialog.heading}
              </Text>
            </View>
            <View style={{ ...Styles.modalheaderOption, ...Styles.itemCenter }}>
              <Pressable
                onPress={onClose}
                style={{
                  ...Styles.modalheaderOptionicon,
                  ...Styles.itemCenter,
                }}
              >
                <View style={Styles.icon18}>{closeIcon(Styles.icondefault)}</View>
              </Pressable>
            </View>
          </View>
          <View style={{ ...Styles.confirmmodalcontent }}>
            <Text style={{ ...Styles.optionsmodaldes, ...Styles.textcenter }}>
              {confirmationDialog.message}
            </Text>

            <Pressable
              onPress={() => {
                confirmationDialog.callback(confirmationDialog.chat);
                onClose();
              }}
              style={{ ...Styles.optionsmodalitem, ...Styles.btn, ...Styles.btnPrimary, ...Styles.mtop10 }}
            >
              <Text
                style={{
                  ...Styles.optionsmodalitemtext,
                  ...Styles.fontwhite,
                  ...Styles.textcenter,
                }}
              >
                Confirm
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  </Modal>
};

export default ConfirmationDialog;
