import moment from "moment";
import { default as React, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Platform, Pressable, Text, View } from "react-native";
import { SCREEN, TOAST_TYPE } from "../../constant";
import { AppContext } from "../../context/app";
import { AuthContext } from "../../context/auth";
import { cancelReqGroupJoin, groupJoin, reqGroupJoin } from "../../services/group";

const GroupJoinDialog = () => {
  const { groupJoinDialog, setGroupJoinDialog } = useContext(AuthContext);
  const [loading, setloading] = useState(false);
  const [data, setData] = useState();
  const { translation, Styles, handleNavigate, setToastNotification } = useContext(AppContext);

  const onClose = () => setGroupJoinDialog(null);

  useEffect(() => {
    if (groupJoinDialog) {
      setloading(true);
      groupJoin(groupJoinDialog)
        .then((response) => {
          if (response.success) setData(response.data);
          else setToastNotification({ type: TOAST_TYPE.error, message: "Group info not found" })
        })
        .finally(() => setloading(false));
    }
  }, [groupJoinDialog]);

  useEffect(() => {
    if (data && data.alreadyMember) {
      handleNavigate(data._id, SCREEN.message);
      onClose();
    }
  }, [data])


  const handleJoin = () => {
    if (data.alreadyRequested)
      cancelReqGroupJoin({
        "group": data._id,
        "link": groupJoinDialog
      }).then((response) => {
        if (response.success) {
          setToastNotification({ type: TOAST_TYPE.success, message: response.message })
        }
      }).finally(() => onClose())
    else
      reqGroupJoin({
        "group": data._id,
        "link": groupJoinDialog
      }).then((response) => {
        if (response.success) {
          if (data.approveMember)
            setToastNotification({ type: TOAST_TYPE.success, message: "Joining Request sendend successfully" })
          else
            handleNavigate(data._id, SCREEN.message)
        }
      }).finally(() => onClose())
  };

  if (groupJoinDialog && (loading || data && !data.alreadyMember)) {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={groupJoinDialog ? true : false}
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Pressable onPress={onClose} style={{ ...Styles.modalContainer }}>
          {Platform.OS !== "web" ? (
            <View style={{ ...Styles.optionsmodalContainer }}>
              <View style={{ ...Styles.optionsmodaloptions }}>
                {loading ? (
                  <View style={{ ...Styles.itemCenter, minHeight: 200 }}>
                    <ActivityIndicator size={"large"} color="#6a6f75" />
                  </View>
                ) : (
                  <>
                    <View style={{ padding: 15 }}>
                      <View style={{ alignItems: "center" }}>
                        <Image
                          style={{
                            ...Styles.image80,
                            ...Styles.thumbImg,
                          }}
                          source={{ uri: data.avatar }}
                        />
                      </View>
                      <View style={{ ...Styles.mtop10 }}>
                        <Text
                          style={{
                            ...Styles.fontsizeheading,
                            ...Styles.fontBold,
                            ...Styles.fontdefault,
                            ...Styles.textcenter,
                          }}
                        >
                          {data.name}
                        </Text>
                        <Text
                          style={{
                            ...Styles.fontlight,
                            ...Styles.textcenter,
                            ...Styles.mtop2,
                          }}
                        >{`${translation.createdBy} ${data.createdBy.name} ${translation.on
                          } ${moment(data.createdAt).format("l")}`}</Text>
                      </View>

                      <View style={{ ...Styles.usershlist, ...Styles.mtop15 }}>
                        {
                          data.members.map((member, index) => {
                            if (index == 0) {
                              return <Image key={`member_id_${member._id}`} style={{ ...Styles.usershlistimg, ...Styles.thumbImg, }} source={{ uri: member.avatar }} />
                            } else {
                              <Image key={`member_id_${member._id}`} style={{ ...Styles.usershlistimg, ...Styles.thumbImg, ...Styles.ml_10 }} source={{ uri: member.avatar }} />
                            }
                          })
                        }
                      </View>
                      {data.approveMember ? <Text style={{ ...Styles.textcenter, ...Styles.fontlight, ...Styles.mtop5 }}>An admin must approve your request</Text> : null}
                      <View style={{ ...Styles.mtop15 }}>
                        <Pressable
                          onPress={handleJoin}
                          style={{ ...Styles.btn, ...Styles.btnPrimary }}
                        >
                          <Text style={{ ...Styles.btnPrimaryTxt, ...Styles.textcenter }}>
                            {data.approveMember
                              ? translation.requestJoin
                              : translation.joinGroup}
                          </Text>
                        </Pressable>
                      </View>
                    </View>

                  </>
                )}
              </View>
              {loading ? (
                <></>
              ) : (
                <Pressable onPress={onClose} style={{ ...Styles.cancelButton }}>
                  <Text style={{ ...Styles.textcenter, ...Styles.fontdefault }}>
                    {translation.cancel}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={{ ...Styles.modalmain, ...Styles.confirmmodalmain }}>
              {loading ? (
                <View style={{ ...Styles.itemCenter, minHeight: 200 }}>
                  <ActivityIndicator size={"large"} color="#6a6f75" />
                </View>
              ) : (
                <>
                  <View style={{ padding: 15 }}>
                    <View style={{ alignItems: "center" }}>
                      <Image
                        style={{
                          ...Styles.image80,
                          ...Styles.thumbImg,
                        }}
                        source={{ uri: data.avatar }}
                      />
                    </View>
                    <View style={{ ...Styles.mtop10 }}>
                      <Text
                        style={{
                          ...Styles.fontsizeheading,
                          ...Styles.fontBold,
                          ...Styles.fontdefault,
                          ...Styles.textcenter,
                        }}
                      >
                        {data.name}
                      </Text>
                      <Text
                        style={{
                          ...Styles.fontlight,
                          ...Styles.textcenter,
                          ...Styles.mtop2,
                        }}
                      >{`${translation.createdBy} ${data.createdBy.name} ${translation.on
                        } ${moment(data.createdAt).format("l")}`}</Text>
                    </View>

                    <View style={{ ...Styles.usershlist, ...Styles.mtop15 }}>
                      {
                        data.members.map((member, index) => {
                          if (index == 0) {
                            return <Image key={`member_id_${member._id}`} style={{ ...Styles.usershlistimg, ...Styles.thumbImg, }} source={{ uri: member.avatar }} />
                          } else {
                            <Image key={`member_id_${member._id}`} style={{ ...Styles.usershlistimg, ...Styles.thumbImg, ...Styles.ml_10 }} source={{ uri: member.avatar }} />
                          }
                        })
                      }
                    </View>
                    {data.approveMember ? <Text style={{ ...Styles.textcenter, ...Styles.fontlight, ...Styles.mtop5 }}>An admin must approve your request</Text> : null}
                    <View style={{ ...Styles.mtop15 }}>
                      <Pressable
                        onPress={handleJoin}
                        style={{ ...Styles.btn, ...Styles.btnPrimary }}
                      >
                        <Text style={{ ...Styles.btnPrimaryTxt, ...Styles.textcenter }}>
                          {data.approveMember
                            ? data.alreadyRequested ? translation.requestCancel : translation.requestJoin
                            : translation.joinGroup}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={onClose}
                        style={{ ...Styles.btn, ...Styles.btnalt, ...Styles.noborder, ...Styles.mtop10 }}
                      >
                        <Text style={{ ...Styles.textcenter, ...Styles.fontdefault }}>
                          {translation.cancel}
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                </>
              )}
            </View>
          )}
        </Pressable>
      </Modal>
    );
  }
};

export default GroupJoinDialog;
