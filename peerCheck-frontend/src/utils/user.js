import axiosClient from "@/api/axiosClient";
import { getAuthToken } from "./auth"

export const getUserData = async () => {
    const token = getAuthToken();
    if (token === null){
        console.error("Not authorized!");
    }
    const res = await axiosClient.get("/user/me", {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });
    console.log("api response: ", res.data?.user);

    return res.data?.user;


} 