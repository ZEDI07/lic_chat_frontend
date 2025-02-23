
export const BASE_URL = process.env.SERVERURL;
export const EMPLOYEE_ENGAGEMENT_URL = process.env.EMPLOYEE_ENG_URL;
export const url = BASE_URL + "/api";
export const clientId = process.env.CLIENT_ID;
export const clientSecret = process.env.CLIENT_SECRET;
export const RUN_MODE = process.env.MODE || "INTEGRATED";

export const LIMIT = 25;  // It should not be less than 10

export const defaultPeopleImg = `${BASE_URL}/public/assets/defaultPeopleAvatar.png`;

export const MESSAGE_STATUS = Object.freeze({
  pending: 0,
  sent: 1,
  received: 2,
  seen: 3,
  deleted: 4,
  deletedEveryone: 5,
});

export const CONTENT_TYPE = Object.freeze({
  text: "text",
  image: "image",
  video: "video",
  audio: "audio",
  gif: "gif",
  location: "location",
  sticker: "sticker",
  forwarded: "forwarded",
  application: "application",
  deleted: "deleted",
  contact: "contact",
  link: "link",
  notification: "notification",
  poll: "poll",
  hidden: "hidden",
  message: "message",
  audioCall: "audiocall",
  videoCall: "videocall"
});

export const SOCKET_EVENTS = Object.freeze({
  chat_archived: "chat_archived",
  message_deleted_everyone: "message_deleted_everyone",
  message_deleted: "message_deleted",
  chat_deleted: "chat_deleted",
  message_received: "message_received",
  message_seen: "message_seen",
  message_starred: "message_starred",
  new_message: "new_message",
  user_status: "user_status",
  user_action: "user_action",
  message_reaction: "messsage_reaction",
  message_block: "message_block",
  message_edited: "message_edited",
  location_update: "location_update",
  get_active_locations: "get_active_locations",
  group_updates: "group_updates",
  chat_mute: "chat_mute",
  chat_pin: "chat_pin",
  chat_block: "chat_block",
  blocked_me: "blocked_me",
  chat_read: "chat_read",
  chat_unread: "chat_unread",
  permission_updated: "permission_updated",
  privacy_update: "privacy_update",
  initiateCall: "initiate_call",
  notification: "notification",
  call: "call",
  message_update: "message_update"
});

export const SCREEN = Object.freeze({
  login: "Login",
  chat: "Chat",
  profile: "ChatProfile",
  groupProfile: "GroupProfile",
  message: "Message",
  media: "ChatMedia",
  search: "Search",
  starred: "ChatStarred",
  archive: "ArchiveChat",
  newChat: "NewChat",
  account: "AccountSetting",
  notification: "NotificationSetting",
  settingStarred: "SettingStarred",
  groupSetting: "GroupSetting",
  groupMembers: "GroupMembers",
  groupPendingRequest: "GroupPendingRequest",
  privacy: "Privacy",
  privacyOption: "Privacy Option",
  about: "About",
  groupInvite: "GroupInvite",
  groupQR: "GroupQR",
  call: "call"
});

export const ATTACHMENT_TYPES = Object.freeze({
  camera: "camera",
  image: "image",
  document: "document",
  gif: "gif",
  sticker: "sticker",
  location: "location",
  contact: "contact",
  audio: "audio"
});

export const CHAT_TYPE = Object.freeze({
  user: "user",
  group: "group",
});

export const MEDIA_TYPE = Object.freeze({
  media: "media",
  link: "link",
  docs: "doc",
});

export const REPORT_TYPE = Object.freeze({
  message: 1,
  user: 2,
  group: 3,
});

export const NAV_TABS = Object.freeze({
  chat: "chats",
  call: "calls",
  people: "users",
  setting: "settings",
});

export const HEADER_NAME = Object.freeze({
  [SCREEN.account]: "Account Setting",
  [SCREEN.notification]: "Notification Setting",
  [SCREEN.settingStarred]: "Starred Messages",
});

export const PERMISSION = Object.freeze({
  start_audio_call: "start_audio_call",
  start_video_call: "start_video_call",
  share_location: "share_location",
  share_contacts: "share_contacts",
  share_poll: "share_poll",
  share_document: "share_document",
  share_photos_and_videos: "share_photos_and_videos",
  record_and_send_audio: "record_and_send_audio",
  allow_edit_message: "allow_edit_message",
  create_groups: "create_groups",
});

export const VIEW_MORE = Object.freeze({
  chats: "chats",
  messages: "messages",
  starred: "starred",
});

export const GROUP_TYPE = Object.freeze({
  public: 1,
  password_protected: 2,
  private: 3,
});

export const MEMBER_GROUP_ROLE = Object.freeze({
  superAdmin: 1,
  admin: 2,
  member: 3,
});

export const NOTIFICATION_ACTION = Object.freeze({
  block: "block",
  unblock: "unblock",
  newGroup: "new_group",
  added: "member_added",
  left: "member_left",
  removed: "member_removed",
  group_edited: "group_edited",
  group_deleted: "group_deleted",
  made_admin: "made_admin",
  dismiss_admin: "dismiss_admin",
  group_setting_changed: "group_setting_changed",
});

export const USER_STATUS = {
  inactive: 0,
  active: 1,
  deleted: 2,
  invited: 3,
};

export const PRIVACY_STATUS = Object.freeze({
  0: "Nobody",
//  1: "Friends",    /** ................. HIDE privacy Friends Only in Privacy setting (About / Profile Photo) .................. */
  3: "Everyone",
});

export const ONLINE_PRIVACY = Object.freeze({
  0: "Everyone",
  1: "Same as last seen",
});

export const regexMentionSuggestion = /@(\w+)$|@$/;

export const PRIVACY_KEYS = Object.freeze({
  lastSeenOnline: "Last Seen & Online",
  profilePhoto: "Profile Photo",
  group: "Group",
  about: "About",
  status: "Status",
});

export const TOAST_TYPE = Object.freeze({
  success: "success",
  error: "error",
  warning: "warning",
});

export const MODE = Object.freeze({
  light: "light",
  dark: "dark",
});

export const GENERAL_SETTING_KEY = Object.freeze({
  messaging_setting: "messaging_setting",
  domain: "domain",
  agora: "agora",
  group: "group",
});

export const MESSAGING_SETTING = Object.freeze({
  everyone: 1,
  friends: 2,
});

export const CALL_TYPE = Object.freeze({
  audio: "audio",
  video: "video",
});

export const CALL = Object.freeze({
  new_call: "new_call",
  received: "received",
  accept: "accept",
  ended: "ended",
  rejected: "rejected",
  join: "join",
  switch: "switch",
  approved: "approved"
});

export const CALL_MODE = Object.freeze({
  incoming: "incoming",
  outgoing: "outgoing"
});

export const CALL_STATUS = Object.freeze({
  initiated: 1,
  connecting: 2,
  ringing: 3,
  incoming: 4,
  accepted: 5,
  rejected: 6,
  ended: 7,
  busy: 8,
});

export const LOCATION_TYPE = Object.freeze({
  location: "location",
  live_location: "live_location",
});

export const RUN_MODES = Object.freeze({
  INTEGRATED: "INTEGRATED",
  SCRIPT: "SCRIPT",
  INDEPENDENT: "INDEPENDENT",
});
