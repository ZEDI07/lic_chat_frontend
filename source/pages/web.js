
import { lazy, useContext } from "react";
import { View } from "react-native";
import { AppContext } from "../context/app";
const MainLazy = lazy(() => import("./index"));
const ChatOpenLazy = lazy(() => import("./chatOpen"));

export default () => {
    const { Styles } = useContext(AppContext)
    return <View style={Styles.chatBubbleMain}>
        {/* <Chat /> */}
        {/* <Suspense fallback={<ActivityIndicator />}> */}
        <MainLazy />
        <ChatOpenLazy />
        {/* </Suspense> */}
    </View>
}