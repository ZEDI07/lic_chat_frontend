import { LIMIT } from "../constant";
import axiosInstance from "../utils/axios";

export const initiateCall = async (data) => {
    try {
        const response = await axiosInstance.post("/call", data);
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, message: error?.response?.data?.message || error.message }
    }
}

export const callDetails = async (id) => {
    try {
        const response = await axiosInstance.get(`/call/${id}`);
        return { success: true, data: response.data }
    } catch (error) {
        console.log('errror while calldetails', error)
        return {
            success: false, message: error?.response?.message || error.message
        }
    }
}

export const channelDetails = async (id) => {
    try {
        const response = await axiosInstance.get(`/call/channel/${id}`);
        return { success: true, data: response.data }
    } catch (error) {
        console.log('errror while calldetails', error)
        return {
            success: false, message: error?.response?.message || error.message
        }
    }
}

export const callLog = async ({ lastCall, search }) => {
    try {
        const response = await axiosInstance.get("/call", { params: { lastCall, search, limit: LIMIT } });
        return { success: true, data: response.data }
    } catch (error) {
        return { success: false, message: error?.response?.message || error.message }
    }
}