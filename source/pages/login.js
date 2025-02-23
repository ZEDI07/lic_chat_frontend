import { useState } from "react";
import { Button, Text, View } from "react-native";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import { loginWithUid } from "../services/user";

export default ({ setToken, SET_USER_ID, setUser }) => {
    const [uid, setUid] = useState(23);

    const handleLogin = async () => {
        const response = await loginWithUid(uid);
        if (response.success) {
            const { token, user } = response.data
            setToken(token)
            SET_USER_ID(user._id);
            setUser(user)
        }
    }
    return <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, height: "100%", width: "100%" }}>
            <Text>Enter Uid</Text>
            <TextInput autoFocus style={{
                borderBlockColor: "black",
                color: "black",
                borderWidth: 0,
                fontSize: 14,
                width: "auto"
            }} placeholder="input uid" onChangeText={(uid) => setUid(uid)}></TextInput>
            <Text>After</Text>
            <Button onPress={handleLogin} title="LOGIN" />
        </View>
    </GestureHandlerRootView>
}