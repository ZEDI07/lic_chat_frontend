/* eslint-disable react-hooks/exhaustive-deps */

import { useFonts } from "expo-font";
import { Suspense, lazy, useState } from "react";
import { ActivityIndicator, Dimensions, Platform } from "react-native";
import { MenuProvider } from "react-native-popup-menu";
import { Provider } from "react-redux";
import Call from "./source/components/call/app";
import { AppProvider } from "./source/context/app";
import { AuthProvider } from "./source/context/auth";
import { SocketProvider } from "./source/context/socket";
import IndexImports from "./source/index";
import Screen from "./source/pages/screen";
import WebView from "./source/pages/web";
import store from "./source/store";
import Socket from "./source/utils/socket";
// import Notification from "./source/notification";

const ChatOpen = lazy(() => import("./source/pages/chatOpen"));

const App = (props) => {
  const { token, user, chat_id, call: callDetails } = props;
  const mobileView = Platform.OS == "web" && Dimensions.get("screen").width < 767 ? true : false;
  const [call, setCall] = useState(callDetails);
  const [fontsLoaded, fontError] = useFonts({
    Roboto: require("./assets/fonts/Roboto/Roboto-Regular.ttf"),
    "Roboto-Bold": require("./assets/fonts/Roboto/Roboto-Bold.ttf"),
  });

  if (!fontsLoaded || fontError) {
    return null;
  }

  if (call && Platform.OS == "web") {
    window.top.postMessage(
      {
        type: "iframeFullSize",
      },
      "*"
    );
  }

  return (
    <Provider store={store}>
      <AuthProvider clientToken={token} client={user} setCall={setCall}>
        {/* <Notification /> */}
        <SocketProvider>
          <AppProvider mobileView={mobileView}>
            <MenuProvider>
              <Socket setCall={setCall}>
                {
                  Platform.OS != "web" ? (<>
                    <Screen chat_id={chat_id} call={call} setCall={setCall} />
                    {call && !call?.ended && !call?.fullView ? <Call call={call} fullView={call?.fullView} setCall={setCall} /> : null}
                  </>
                  ) :
                    call ?
                      <Call {...call} />
                      : mobileView ?
                        <Suspense fallback={<ActivityIndicator />}>
                          <ChatOpen />
                        </Suspense>
                        : <WebView />
                }
                <IndexImports />
              </Socket>
            </MenuProvider>
          </AppProvider>
        </SocketProvider>
      </AuthProvider>
    </Provider>
  );
};

export default App;
