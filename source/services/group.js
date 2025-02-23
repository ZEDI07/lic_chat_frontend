
import { MEMBER_GROUP_ROLE } from "../constant";
import axiosInstance from "../utils/axios";

export const getGroupInfo = async (id) => {
  try {
    const response = await axiosInstance.get(`/group/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false };
  }
};

export const createGroup = async (data) => {
  try {
    const response = await axiosInstance.post("/group/create", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return { success: false };
  }
};

export const updateSetting = async (data) => {
  try {
    const response = await axiosInstance.put("/group/setting", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false };
  }
};

export const exitGroup = async (data) => {
  try {
    const response = await axiosInstance.post("/group/leave", data);
    return { success: true, ...response.data };
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

export const addMember = async (data) => {
  try {
    const response = await axiosInstance.post("/group/add-user", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const makeAdmin = async (data) => {
  try {
    const response = await axiosInstance.post("/group/change-member-role", {
      ...data,
      role: MEMBER_GROUP_ROLE.admin,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const dismissAdmin = async (data) => {
  try {
    const response = await axiosInstance.post("/group/change-member-role", {
      ...data,
      role: MEMBER_GROUP_ROLE.member,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const removeMember = async (data) => {
  try {
    const response = await axiosInstance.post("/group/remove", data);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const groupMembers = async (data) => {
  try {
    const config = {
      method: "GET",
      url: `/group/members/${data.id}`,
      params: {
        page: data.page,
        limit: data.limit,
      },
    };
    const response = await axiosInstance(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const validatePassword = async (data) => {
  try {
    const response = await axiosInstance.post("/group/validate-password", data);
    if (response.data.success)
      return { success: true, message: "Valid Password" };
    return { success: false, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const pendingMembers = async (id) => {
  try {
    const response = await axiosInstance.get(`/group/pending/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const changePendingStatus = async (data) => {
  try {
    await axiosInstance.post("/group/pending", data);
    return { success: true, message: "status updated" };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const groupLink = async (id) => {
  try {
    const response = await axiosInstance.get(`/group/link/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const groupResetLink = async (id) => {
  try {
    const response = await axiosInstance.get(`/group/reset-link/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const groupJoin = async (id) => {
  try {
    const response = await axiosInstance.get(`/group/join/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};
export const reqGroupJoin = async (data) => {
  try {
    const response = await axiosInstance.post(`/group/join-req`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const cancelReqGroupJoin = async (data) => {
  try {
    const response = await axiosInstance.post(`/group/join-req-cancel`, data);
    return { success: true, ...response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const groupQR = async (id) => {
  try {
    const response = await axiosInstance.get(`/group/qr/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const forgetPassword = async (data) => {
  try {
    const response = await axiosInstance.post(`/group/forgot-password`, data);
    return { ...response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const resendOTP = async (data) => {
  try {
    const response = await axiosInstance.post(`/group/resend-otp`, data);
    return { ...response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const verifyOtp = async (data) => {
  try {
    const response = await axiosInstance.post(`/group/verify-otp`, data);
    return { ...response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const changePassword = async (data) => {
  try {
    const response = await axiosInstance.post(`/group/change-password`, data);
    return { ...response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.message || error.message,
    };
  }
};

export const createGroupUser = async (search) => {
  try {
    const config = {
      method: "GET",
      url: `/group/create`,
      params: {
        search,
      },
    };
    const response = await axiosInstance(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};

export const addNewMember = async (id, search) => {
  try {
    const config = {
      method: "GET",
      url: `/group/add-user/${id}`,
      params: {
        search,
      },
    };
    const response = await axiosInstance(config);
    return { success: true, data: response.data };
  } catch (error) {
    console.log(error);
    return { success: false, message: error.message };
  }
};
