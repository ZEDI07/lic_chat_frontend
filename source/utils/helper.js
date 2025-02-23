import { Dimensions, Platform, PixelRatio, Alert } from "react-native";
const moment = require("moment");

const { width, height } = Dimensions.get("window");

export const Size = width > 350 ? 350 : width;

export function fontSize(size, webFontSize, multiplier = 2) {
  const scale = (width / height) * multiplier;

  if (Platform.OS == "web" && webFontSize) return webFontSize;

  const newSize = size * (Platform.OS == "web" ? 1 : scale);

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export const formatDate = (date, translationYesterday) => {
  const today = moment().startOf("day");
  const yesterday = moment().subtract(1, "days").startOf("day");
  if (moment(date).isSame(today, "d")) {
    return moment(date).format("LT");
  } else if (moment(date).isSame(yesterday, "d")) {
    return translationYesterday;
  } else {
    return moment(date).format("L");
  }
};

export const formatDuration = ({ startTime, endTime }) => {
  const differenceInSeconds = moment(endTime).diff(moment(startTime), 'seconds');

  // Convert total seconds to minutes and seconds
  const minutes = Math.floor(differenceInSeconds / 60);
  const seconds = differenceInSeconds % 60;

  // Format the result as MM:SS
  const formattedDifference = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return formattedDifference;
}


export const profanityCheck = (inputText) => {
  const restricted_words = localStorage.getItem("OffensiveWords").split(',');
  // console.log('read localstorage ..............>',restricted_words)
  // const textWords = inputText.toLowerCase().replace(/[^a-zA-Z\s]/g, "").split(" ");  // replace >> Remove non-alphanumeric characters (@ ,digits) into empty string 
  const textWords = inputText.toLowerCase().replace(/["'`]/g, "")
  .split(/[\s,;.!?]+/)                                                                  // Remove quotes and split by whitespace
  .map(word => word.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ""));  

  const foundAbusingWord = textWords.find(word => restricted_words.includes(word));
  return foundAbusingWord;
}
/*
export const profanityCheck = (inputText) => {
  // Function to get the value of a specific cookie by name
  console.log(document.cookie);
  const getCookie = (cookieName) => {
    const cookies = document.cookie.split("; ");
    console.log("cookies", cookies);
    const cookie = cookies.find((c) => c.startsWith(`${cookieName}=`));
    return cookie ? cookie.split("=")[1] : null;
  };

  // Retrieve the "badWordsFile" cookie
  const badWordsFile = getCookie("offensivewords");
  if (!badWordsFile) {
    console.error("Bad words file not found in cookies.");
    return null;
  }

  // Parse the bad words list
  const restricted_words = badWordsFile.split(",");
  console.log("restricted_words", restricted_words);

  // Process the input text and check for profanity
  const textWords = inputText.toLowerCase().split(" ");
  const foundAbusingWord = textWords.find((word) =>
    restricted_words.includes(word)
  );

  return foundAbusingWord;
};
*/