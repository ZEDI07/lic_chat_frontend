/* eslint-disable react-hooks/exhaustive-deps */


import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext, useEffect, useRef } from "react";
import { LogBox, NativeEventEmitter, NativeModules, Platform } from "react-native";
import { useDispatch } from "react-redux";
import Call from "../components/call/app";
import People from "../components/people";
import About from "../components/setting/about";
import AccountSetting from "../components/setting/account";
import NotificationSetting from "../components/setting/notification";
import PrivacySetting from "../components/setting/privacy";
import PrivacySettingOption from "../components/setting/privacyOptions";
import { SCREEN } from "../constant";
import { AppContext } from "../context/app";
import { chatPassword } from "../store/reducer";
import SafeArea from "../utils/SafeArea";
import Main, { Chat, ChatMedia, ChatProfile, ChatStarred, GroupInvite, GroupMembers, GroupPendingRequest, GroupQR, GroupSetting, Message, SettingStarred } from "./index";

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications
const Stack = createNativeStackNavigator();

export default ({ chat_id, call, setCall }) => {
  const { fetchChatDetails, getChatId } = useContext(AppContext);
  const navigationRef = useNavigationContainerRef();
  const previousRouteRef = useRef();
  const dispatch = useDispatch()

  // const [id, setId] = useState(null);
  // const [uid, setUid] = useState(null);

  const getId = async (uid) => {
    const data = getChatId(uid);
    if (data) {
      return data;
    } else {
      const response = await fetchChatDetails(uid);
      if (response.success) {
        return response.data;
      } else {
        return;
      }
    }
  };

  // useEffect(() => {
  //   console.log("use effect uid", uid);
  //   if (uid) getId();
  //   else {
  //     navigationRef.current.navigate(SCREEN.chat);
  //   }
  // }, [uid]);

  const handleRedirect = async (id, uid) => {
    if (!id && !uid) {
      navigationRef.current.navigate(SCREEN.chat);
      return;
    }
    let newID = id;
    if (uid && !id) {
      const data = await getId(uid);
      console.log(data, " ----- DATA ---");
      if (data) {
        newID = data.chat._id;
      }
    }
    if (newID)
      navigationRef.current.navigate(SCREEN.message, {
        id: newID,
        redirect: id ? false : true,
      });
    if (!newID) navigationRef.current.navigate(SCREEN.chat);
  };

  useEffect(() => {
    if (chat_id) {
      handleRedirect(chat_id, null);
    }

    if (Platform.OS != "web" && NativeModules?.CircuitChat) {
      const eventEmitter = new NativeEventEmitter(NativeModules?.CircuitChat);
      eventEmitter.addListener("CircuitChatEvents", (body) => {
        handleRedirect(body.chat._id, null);
      });
      eventEmitter.addListener("OpenUserChatScreen", (body) => {
        console.log("open user chat screen", body);
        handleRedirect(null, body.uid);
      });
      return () => {
        eventEmitter.removeAllListeners(() => { });
      }
    }
  }, []);

  useEffect(() => {
    if (call && !call?.ended && navigationRef.current && call?.fullView) {
      navigationRef.current.navigate(SCREEN.call, call)
      // return () => navigationRef.current.goBack()
    } else if (call && call?.ended && navigationRef.current) {
      const current = navigationRef.getCurrentRoute();
      console.log("inside go back", current)
      if (current.name == SCREEN.call) {
        navigationRef.current.goBack();
        setCall(null)
      }
    }
  }, [call])

  return (
    <SafeArea>
      <NavigationContainer ref={navigationRef}
        onStateChange={() => {
          const current = navigationRef.getCurrentRoute();
          if (current.name == SCREEN.chat && [SCREEN.message, SCREEN.groupProfile].includes(previousRouteRef.current.name) && previousRouteRef.current.params?.id) {
            dispatch(chatPassword({ chat: previousRouteRef.current.params.id }))
          };
          previousRouteRef.current = current;
        }}>
        <Stack.Navigator initialRouteName={SCREEN.chat}>
          <Stack.Screen
            name={SCREEN.chat}
            component={Main}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.message}
            component={Message}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.archive}
            component={Chat}
            initialParams={{ archive: true }}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.profile}
            component={ChatProfile}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.groupProfile}
            component={ChatProfile}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.media}
            component={ChatMedia}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.starred}
            component={ChatStarred}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.newChat}
            component={People}
            options={{ headerShown: false }}
            initialParams={{ newChat: true }}
          />
          <Stack.Screen
            name={SCREEN.account}
            component={AccountSetting}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.privacy}
            component={PrivacySetting}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.about}
            component={About}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.notification}
            component={NotificationSetting}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.settingStarred}
            component={SettingStarred}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.groupSetting}
            component={GroupSetting}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.groupMembers}
            component={GroupMembers}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.groupPendingRequest}
            component={GroupPendingRequest}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={SCREEN.privacyOption}
            component={PrivacySettingOption}
            options={{ headerShown: false }}
          />
          <Stack.Screen name={SCREEN.groupInvite}
            component={GroupInvite}
            options={{ headerShown: false }} />
          <Stack.Screen name={SCREEN.groupQR}
            component={GroupQR}
            options={{ headerShown: false }} />
          <Stack.Screen name={SCREEN.call}
            component={Call}
            options={{ headerShown: false }} initialParams={call} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeArea>
  );
};
