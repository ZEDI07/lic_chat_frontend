
import { useContext } from "react";
import { MODE } from "../constant";
import { AppContext } from "../context/app";

export default (props) => {
  let { SafeAreaView, Platform, StatusBar, } = require("react-native");
  const { Styles, mode } = useContext(AppContext)
  if (Platform.OS == "android")
    StatusBar.setBackgroundColor(Styles.bg.backgroundColor)
  StatusBar.setBarStyle(mode == MODE.light ? "dark-content" : "light-content")
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: Styles.bg.backgroundColor,
    }}>
      {props.children}
    </SafeAreaView>
  )
}