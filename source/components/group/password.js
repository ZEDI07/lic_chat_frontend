import { default as React, useContext, useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { checkcircleIcon, eyeIcon, eyeIconcrossed, lockIcon } from "../../constant/icons";
import { AppContext } from "../../context/app";
import { ChatContext } from "../../context/chat";
import { changePassword, forgetPassword, resendOTP, validatePassword, verifyOtp } from "../../services/group";
import { chatPassword } from "../../store/reducer";
import { webStyle } from "../../styles";
import { TOAST_TYPE } from "../../constant";

const PasswordInputView = ({ setForgetPassword }) => {
  const dispatch = useDispatch();
  const { passwordDialog, setPassowordDialog, handleNavigate, Styles, getGroupDetails, translation, setToastNotification } =
    useContext(AppContext);
  const { setOpenOption } = useContext(ChatContext)
  const onClose = () => setPassowordDialog(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const group = useSelector(state => state.groups[passwordDialog.item.chat._id]);

  useEffect(() => {
    if (!group)
      getGroupDetails(passwordDialog.item.chat._id);
  }, [])

  const handleValidated = () => {
    onClose();
    if (passwordDialog.screen == "options") {
      setOpenOption(passwordDialog.item);
    } else {
      handleNavigate(passwordDialog.item.chat._id, passwordDialog.screen);
    }
  }

  const handleSubmit = async () => {
    setProgress(true);
    const response = await validatePassword({
      group: passwordDialog.item.chat._id,
      password: text,
    });
    if (response.success) {
      if (Platform.OS == "web") {
        const localPasswords = JSON.parse(localStorage.getItem("passwords")) || {};
        localPasswords[passwordDialog.item.chat._id] = text;
        localStorage.setItem("passwords", JSON.stringify(localPasswords))
      } else
        dispatch(
          chatPassword({ chat: passwordDialog.item.chat._id, password: text })
        );
      handleValidated();
    } else setToastNotification({ type: TOAST_TYPE.error, message: "incorrect password" })
    setText("");
    setProgress(false);
  };
  return <>
    <View style={{ alignItems: "center" }}>
      <View style={{ ...Styles.centermodalIcon, ...Styles.itemCenter }}>
        <View style={{ ...Styles.icon30 }}>{lockIcon(Styles.iconwhite)}</View>
      </View>
    </View>
    <Text
      style={{
        ...Styles.centermodalTitle,
        ...Styles.textcenter,
        ...Styles.font500,
        ...Styles.fontdefault,
        ...Styles.fontsizenormal,
      }}
    >
      Please enter password to access this group.
    </Text>
    <View style={{ ...Styles.forminput, alignItems: "center" }}>
      <TextInput
        secureTextEntry={showPassword}
        style={{
          ...Styles.forminputText,
          ...webStyle,
          flex: 1,
          width: "100%",
        }}
        onChangeText={(text) => setText(text)}
        onKeyPress={(e) => {
          if (
            Platform.OS == "web" &&
            e.nativeEvent.key == "Enter" &&
            !e.nativeEvent.shiftKey
          ) {
            e.preventDefault();
            handleSubmit();
            return false;
          }
          return true;
        }}
        // style={{ ...Styles.fontlight }}
        placeholder="Enter the password"
        placeholderTextColor={Styles.fontlight.color}
        autoFocus
        value={text}
      ></TextInput>
      <Pressable onPress={() => setShowPassword(prev => !prev)} style={{ ...Styles.forminputIcon, ...Styles.icon18, }}>
        {!showPassword ? eyeIcon(Styles.iconlight) : eyeIconcrossed(Styles.iconlight)}
      </Pressable>
    </View>
    {group && group.admin ?
      <Text onPress={() => setForgetPassword(true)} style={{ ...Styles.mtop5, ...Styles.fontlink }}>
        {translation.forgetPassword}
      </Text> : null}
    {progress ? (
      <View
        style={{
          ...Styles.centermodalBtn,
          ...Styles.btnPrimary,
        }}
      >
        <ActivityIndicator size="small" color="#fff" />
      </View>
    ) : (
      <Pressable
        disabled={!text.length}
        style={{
          ...Styles.centermodalBtn,
          ...Styles.btnPrimary,
        }}
        onPress={handleSubmit}
      >
        <Text
          style={{
            ...Styles.fontwhite,
            ...Styles.textcenter,
            ...Styles.fontsizenormal,
          }}
        >
          {translation.submit}
        </Text>
      </Pressable>
    )}
  </>
}

const ForgetPasswordView = () => {
  const { passwordDialog, setPassowordDialog, Styles, translation, setToastNotification } = useContext(AppContext);
  const [step, setStep] = useState(0);
  const [inputText, setInputText] = useState({ email: "", otp: "", newPassword: "", confirmNewPassword: "" });
  const [progress, setProgress] = useState(false);
  const [showPassword, setShowPassword] = useState(true)

  const handleResend = async () => {
    setProgress(true);
    const response = await resendOTP({ group: passwordDialog.item.chat._id, email: inputText.email });
    if (response.success) {
      setToastNotification({ type: TOAST_TYPE.success, message: response.message });
    } else setToastNotification({ type: TOAST_TYPE.error, message: response.message });
    setProgress(false);
  }

  const handleSubmit = async () => {
    setProgress(true);
    switch (step) {
      case 0: {
        const response = await forgetPassword({ group: passwordDialog.item.chat._id, email: inputText.email });
        if (response.success) {
          setToastNotification({ type: TOAST_TYPE.success, message: response.message });
          setStep(1);
        } else {
          setToastNotification({ type: TOAST_TYPE.error, message: "invalid email id" });
          setInputText(prev => ({ ...prev, email: "" }))
        };
        break;
      }
      case 1: {
        const response = await verifyOtp({ group: passwordDialog.item.chat._id, email: inputText.email, otp: inputText.otp });
        if (response.success) {
          setToastNotification({ type: TOAST_TYPE.success, message: response.message });
          setStep(2);
        } else {
          setToastNotification({ type: TOAST_TYPE.error, message: "incorrect otp" });
          setInputText(prev => ({ ...prev, otp: "" }))
        }
        break;
      }
      case 2: {
        if (inputText.newPassword !== inputText.confirmNewPassword) {
          setToastNotification({ type: TOAST_TYPE.error, message: "New password and confirm password didn't matched." })
          setInputText(prev => ({ ...prev, newPassword: "", confirmNewPassword: "" }))
        } else {
          const response = await changePassword({ group: passwordDialog.item.chat._id, email: inputText.email, otp: inputText.otp, password: inputText.confirmNewPassword });
          if (response.success) {
            setToastNotification({ type: TOAST_TYPE.success, message: response.message });
            setStep(3);
            setTimeout(() => setPassowordDialog(null), 2000)
          } else setToastNotification({ type: TOAST_TYPE.error, message: response.message });
          break;
        }
      }
    }
    setProgress(false);
  };

  switch (step) {
    case 0:
      return <>
        <Text
          style={{
            ...Styles.centermodalTitle,
            ...Styles.textcenter,
            ...Styles.font500,
            ...Styles.fontdefault,
          }}
        >
          {translation.forgetPassword}
        </Text>
        <View style={{ ...Styles.forminput, alignItems: "center" }}>
          <TextInput
            style={{
              ...Styles.forminputText,
              ...webStyle,
              flex: 1,
              width: "100%",
            }}
            onChangeText={(text) => setInputText(prev => ({ ...prev, email: text }))}
            onKeyPress={(e) => {
              if (
                Platform.OS == "web" &&
                e.nativeEvent.key == "Enter" &&
                !e.nativeEvent.shiftKey
              ) {
                e.preventDefault();
                handleSubmit();
                return false;
              }
              return true;
            }}
            value={inputText.email}
            // style={{ ...Styles.fontlight }}
            placeholder="Enter email adress"
            placeholderTextColor={Styles.fontlight.color}
            autoFocus
          ></TextInput>
        </View>
        {
          progress ? (
            <View
              style={{
                ...Styles.centermodalBtn,
                ...Styles.btnPrimary,
              }
              }
            >
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <Pressable
              disabled={!inputText.email.length}
              style={{
                ...Styles.centermodalBtn,
                ...Styles.btnPrimary,
              }}
              onPress={handleSubmit}
            >
              <Text
                style={{
                  ...Styles.fontwhite,
                  ...Styles.textcenter,
                  ...Styles.fontsizenormal,
                }}
              >
                {translation.submit}
              </Text>
            </Pressable>
          )}
      </>
    case 1:
      return <>
        <Text
          style={{
            ...Styles.centermodalTitle,
            ...Styles.textcenter,
            ...Styles.font500,
            ...Styles.fontdefault,
          }}
        >
          {translation.otpVerification}
        </Text>
        <Text
          style={{
            ...Styles.fontsizenormal,
            ...Styles.textcenter,
            ...Styles.fontlight,
            ...Styles.mbot10,
          }}
        >
          {`Enter OTP code sent to ${inputText.email}`}
        </Text>
        <View style={{ ...Styles.forminput, alignItems: "center" }}>
          <TextInput
            style={{
              ...Styles.forminputText,
              ...webStyle,
              flex: 1,
              width: "100%",
            }}
            onChangeText={(text) => setInputText(prev => ({ ...prev, otp: text }))}
            onKeyPress={(e) => {
              if (
                Platform.OS == "web" &&
                e.nativeEvent.key == "Enter" &&
                !e.nativeEvent.shiftKey
              ) {
                e.preventDefault();
                handleSubmit();
                return false;
              }
              return true;
            }}
            // style={{ ...Styles.fontlight }}
            placeholder="Enter OTP"
            placeholderTextColor={Styles.fontlight.color}
            autoFocus
            value={inputText.otp}
          ></TextInput>
        </View>
        <Text style={{ ...Styles.textcenter, ...Styles.fontlight, ...Styles.mtop10 }}>Did’nt  receive code  OTP Code ?</Text>
        {progress ? (
          <View
            style={{
              ...Styles.mtop5,
              ...Styles.textcenter
            }}
          >
            <ActivityIndicator size="small" color="#6a6f75" />
          </View>
        ) : (
          <Pressable
            disabled={progress}
            style={{
              ...Styles.mtop5,
              ...Styles.textcenter
            }}
            onPress={handleResend}
          >
            <Text
              style={{
                ...Styles.fontlink,
                ...Styles.textcenter,
                ...Styles.fontsizenormal,
                ...Styles.fontBold,
              }}
            >
              {translation.resendCode}
            </Text>
          </Pressable>
        )}
        {progress ? (
          <View
            style={{
              ...Styles.centermodalBtn,
              ...Styles.btnPrimary,
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : (
          <Pressable
            disabled={progress || inputText.otp.length !== 4}
            style={{
              ...Styles.centermodalBtn,
              ...Styles.btnPrimary,
            }}
            onPress={handleSubmit}
          >
            <Text
              style={{
                ...Styles.fontwhite,
                ...Styles.textcenter,
                ...Styles.fontsizenormal,
              }}
            >
              {translation.verifyProceed}
            </Text>
          </Pressable>
        )}
      </>
    case 2:
      return <>
        <Text
          style={{
            ...Styles.centermodalTitle,
            ...Styles.textcenter,
            ...Styles.font500,
            ...Styles.fontdefault,
          }}
        >
          {translation.changePassword}
        </Text>
        <View style={{ ...Styles.forminput, alignItems: "center" }}>
          <TextInput
            secureTextEntry={showPassword}
            style={{
              ...Styles.forminputText,
              ...webStyle,
              flex: 1,
              width: "100%",
            }}
            onChangeText={(text) => setInputText(prev => ({ ...prev, newPassword: text }))}
            // style={{ ...Styles.fontlight }}
            placeholder="Enter the new password"
            placeholderTextColor={Styles.fontlight.color}
            autoFocus
            value={inputText.newPassword}
          ></TextInput>
          <Pressable onPress={() => setShowPassword(prev => !prev)} style={{ ...Styles.forminputIcon, ...Styles.icon18, }}>
            {!showPassword ? eyeIcon(Styles.iconlight) : eyeIconcrossed(Styles.iconlight)}
          </Pressable>
        </View>
        <View style={{ ...Styles.forminput, ...Styles.mtop15, alignItems: "center" }}>
          <TextInput
            secureTextEntry={showPassword}
            style={{
              ...Styles.forminputText,
              ...webStyle,
              flex: 1,
              width: "100%",
            }}
            value={inputText.confirmNewPassword}
            onChangeText={(text) => setInputText(prev => ({ ...prev, confirmNewPassword: text }))}
            onKeyPress={(e) => {
              if (
                Platform.OS == "web" &&
                e.nativeEvent.key == "Enter" &&
                !e.nativeEvent.shiftKey
              ) {
                e.preventDefault();
                handleSubmit();
                return false;
              }
              return true;
            }}
            // style={{ ...Styles.fontlight }}
            placeholder="Enter the new confirm password"
            placeholderTextColor={Styles.fontlight.color}
          ></TextInput>
          <Pressable onPress={() => setShowPassword(prev => !prev)} style={{ ...Styles.forminputIcon, ...Styles.icon18, }}>
            {!showPassword ? eyeIcon(Styles.iconlight) : eyeIconcrossed(Styles.iconlight)}
          </Pressable>
        </View>
        {progress ? (
          <View
            style={{
              ...Styles.centermodalBtn,
              ...Styles.btnPrimary,
            }}
          >
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : (
          <Pressable
            disabled={!inputText.newPassword.length || !inputText.confirmNewPassword.length}
            style={{
              ...Styles.centermodalBtn,
              ...Styles.btnPrimary,
            }}
            onPress={handleSubmit}
          >
            <Text
              style={{
                ...Styles.fontwhite,
                ...Styles.textcenter,
                ...Styles.fontsizenormal,
              }}
            >
              {translation.submit}
            </Text>
          </Pressable>
        )}
      </>
    case 3:
      return <>
        <View style={{ alignItems: "center" }}>
          <View style={{ ...Styles.centermodalIcon, ...Styles.itemCenter, backgroundColor: "#0ed00e" }}>
            <View style={{ ...Styles.icon30 }}>{checkcircleIcon(Styles.iconwhite)}</View>
          </View>
        </View>
        <Text style={{ ...Styles.centermodalTitle, ...Styles.textcenter, ...Styles.font500, ...Styles.fontdefault }}>Password Changed</Text>
        <Text style={{ ...Styles.fontlight, ...Styles.textcenter, ...Styles.mtop10 }}>Your password  has been changed successfully. </Text>
      </>
  }
}

const PasswordConfirmation = () => {
  const { passwordDialog, setPassowordDialog, Styles, translation } = useContext(AppContext);
  const onClose = () => setPassowordDialog(null);
  const [forgetPassword, setForgetPassword] = useState(false);

  useEffect(() => {
    return () => setForgetPassword(false)
  }, [passwordDialog])

  return passwordDialog ? (
    <Modal
      animationType="fade"
      transparent={true}
      visible={passwordDialog ? true : false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        // onPress={onClose}
        style={{ ...Styles.centermodalcontainer }}
      >
        <View style={{ ...Styles.centermodalcontent }}>
          <KeyboardAvoidingView behavior="padding">
            {
              forgetPassword ? <ForgetPasswordView /> : <PasswordInputView setForgetPassword={setForgetPassword} />
            }
            <Pressable
              style={{
                ...Styles.btn,
                ...Styles.centermodalBtn,
                ...Styles.btnOutline,
                marginTop: 10,
              }}
              onPress={onClose}
            >
              <Text
                style={{
                  ...Styles.fontdefault,
                  ...Styles.textcenter,
                  ...Styles.fontsizenormal,
                }}
              >
                {translation.cancel}
              </Text>
            </Pressable>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  ) : (
    <></>
  );
};

export default PasswordConfirmation;
