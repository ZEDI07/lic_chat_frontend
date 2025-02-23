import { Platform, StyleSheet } from "react-native";
import { fontSize } from "../utils/helper";

export default (dark, height, width) => {
  const variables = {
    "call-background-color": "#111",
    "call-foreground-color": "#272727",
    "call-primary-color": "#1877f2",
    "call-bottom-bar-height": 60,
    "call-primary-btn-color": "#1877f2",
    "call-primary-btn-color-hover": "#136de2",
    "call-secondary-btn-color": "#737373",
    "call-secondary-btn-color-hover": "#636363",
    "call-danger-btn-color": "#f44336",
    "call-danger-btn-color-hover": "#da3024",
    "call-font-size-title": fontSize(20),
    "call-font-size": fontSize(14),
    "call-font-size-small": fontSize(12),
    "call-font-color": "#f1f1f1",
    "call-font-color-light": "#b0b3b8",
    "call-user-item-space": 10,
  };
  const style = {
    // Global Styles
    callitemcenter: {
      alignItems: "center",
      justifyContent: "center",
    },
    zindexnone: {
      // zIndex: "initial",
    },
    // Buttons
    callIcon: {
      alignItems: "center",
      justifyContent: "center",
    },
    callIcon24: {
      height: 24,
      width: 24,
    },
    callIconwhite: {
      fill: "#ffffff",
      height: "100%",
      width: "100%",
    },
    callBtnPrimary: {
      backgroundColor: variables["call-primary-btn-color"],
      borderColor: variables["call-primary-btn-color"],
      color: "#fff",
    },
    callBtnPrimaryHover: {
      backgroundColor: variables["call-primary-btn-color-hover"],
      borderColor: variables["call-primary-btn-color-hover"],
    },
    callBtnSecondary: {
      backgroundColor: variables["call-secondary-btn-color"],
      borderColor: variables["call-secondary-btn-color"],
    },
    callBtnSecondaryHover: {
      backgroundColor: variables["call-secondary-btn-color-hover"],
      borderColor: variables["call-secondary-btn-color-hover"],
    },
    callBtnDanger: {
      backgroundColor: variables["call-danger-btn-color"],
      borderColor: variables["call-danger-btn-color"],
      color: "#fff",
    },
    callBtnDangerHover: {
      backgroundColor: variables["call-danger-btn-color-hover"],
      borderColor: variables["call-danger-btn-color-hover"],
    },


    // Background

    webincomingcallContainer: {
      backgroundColor: variables["call-background-color"],
      borderRadius: Platform.OS == "web" ? 10 : 0,
      padding: 20,
      marginLeft: "auto",
      marginRight: "auto",
      minHeight: 400,
      maxHeight: Platform.OS == "web" ? "inherit" : height,
      maxWidth: Platform.OS == "web" ? "inherit" : "100%",
    },
    callContainer: {
      backgroundColor: variables["call-background-color"],
      borderRadius: 10,
      height: height,
      width: width,
    },
    callContainerMain: {
      backgroundColor: variables["call-background-color"],
      height: height,
      width: width
    },
    callContainerMainTop: {
      position: "relative",
      flex: 1,
      zIndex: 1,
    },
    callUserSection: {
      flexDirection: 'row',
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      padding: 3,
    },

    // Bottom Bar
    callContainerBottomBar: {
      backgroundColor: variables["call-foreground-color"],
    },
    callContainerBottomBarInner: {
      justifyContent: "center",
      flexDirection: "row",
    },
    callContainerBottomBarItem: {
      padding: 10,
    },
    callContainerBottomBarItemBtn: {
      borderRadius: 100,
      height: 40,
      width: 40,
      ...Platform.select({ web: { cursor: "pointer" } }),
    },

    // Ongoing Call
    AudioCallBox: {
      alignItems: "center",
      width: width,
      height: height - variables["call-bottom-bar-height"],
      ...Platform.select({
        web: {
          justifyContent: "center",
        }
      }),
    },
    AudioCallBoxUser: {
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        default: {
          marginTop: 20,
        }
      }),
    },
    callUserImgWrap: {
      width: 120,
      height: 120,
      borderRadius: 200,
      marginBottom: 20,
      ...Platform.select({
        web: {
          width: 180,
          height: 180,
        }
      }),
    },
    callUserImg: {
      borderRadius: 200,
      width: "100%",
      height: "100%",
      objectPosition: "center",
      objectFit: "cover",
    },
    AudioCallBoxName: {
      color: variables["call-font-color"],
      fontSize: variables["call-font-size-title"],
      marginBottom: 10,
      fontWeight: "bold",
    },
    AudioCallBoxRing: {
      color: variables["call-font-color-light"],
    },
    // VideoCallSelf: {
    //   position: "absolute",
    //   left: 40,
    //   bottom: 30,
    //   borderRadius: 10,
    //   width: 380,
    //   height: 220,
    //   zIndex: 11,
    // },
    // VideoCallSelfMedia: {
    //   borderRadius: 10,
    //   width: "100%",
    //   objectFit: "cover",
    //   objectPosition: "center",
    //   height: "100%",
    // },
    incomingCallButtons: {
      marginTop: 30,
      flexDirection: "row",
      width: 350,
    },
    incomingCallButtonsItem: {
      paddingHorizontal: 5,
      width: "50%",
    },
    incomingCallButtonsbtn: {
      borderRadius: 5,
      borderWidth: 1,
      padding: 10,
      width: "100%",
      ...Platform.select({ web: { cursor: "pointer" } }),
    },
    incomingCallButtonsbtntxt: {
      whiteSpace: "nowrap",
    },
    // Call Video
    callgroupcontainer: {
      flexWrap: 'wrap',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: "center",
      // gap: 10,
      height: height - variables["call-bottom-bar-height"],
      width: width - 6,
      // justifyContent: "center",
      //padding: 3,
    },
    callsingleuser: {
      backgroundColor: variables["call-background-color"],
      flex: 1,
      height: "100%",
      width: "100%",
    },
    callUserItem: {
      borderRadius: 10,
      padding: 3,
      height: "50%",
      // flexDirection: "row"
    },
    callUserItemMedia: {
      backgroundColor: variables["call-foreground-color"],
      borderRadius: 10,
      objectFit: "contain",
      height: "100%",
      width: "100%"
    },
    callUserItemThumb: {
      width: 60,
      height: 60,
      borderRadius: 200,
      marginBottom: 20,
      ...Platform.select({
        web: {
          width: 80,
          height: 80,
        }
      }),
    },
    callUserName: {
      position: "absolute",
      left: 15,
      bottom: 15,
      ...Platform.select({
        web: {
          left: 10,
          bottom: 10,
        }
      }),
      color: "#fff",
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: -1, height: 1 },
      textShadowRadius: 10,
    },
    callUserItemOptions: {
      position: "absolute",
      bottom: 0,
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 5,
      zIndex: 11,
    },
    callUserItemOptionsIcon: {
      margin: 5
    }
  };
  return StyleSheet.create(style);
}