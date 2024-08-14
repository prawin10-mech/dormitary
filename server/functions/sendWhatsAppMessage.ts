import request from "request";

export const sendWhatsappMessage = async (
  phoneNumber: string,
  message: string
) => {
  if (phoneNumber.length === 10) {
    phoneNumber = `91${phoneNumber}`;
  }
  const options = {
    method: "POST",
    url: "https://whats-api.rcsoft.in/api/create-message",
    formData: {
      appkey: "2c05d147-dd95-4abe-b596-64f5436d5390",
      authkey: "J8Fp4NxBNcytRyOqzeJTK6G7qielNHYXemIpLD8X6vJem2B383",
      to: phoneNumber,
      message: message,
    },
  };

  request(options, (error: any, response: any) => {
    if (error) {
      return "Error sending message";
    }
    return response;
  });
};
