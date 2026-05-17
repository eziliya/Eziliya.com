//validate username,contactNumber,mobileOtp,password
const validateContactNumber=(contactNumber)=>{
  const regex=/^\d{10}$/;
  return regex.test(String(contactNumber));
};
const validateUsername = (username) => {
const minLength = 3;
const maxLength = 15;
const hasInvalidChars=/[^a-zA-Z0-9]/.test(username);
return(username.length >= minLength && username.length <= maxLength && !hasInvalidChars);
};
const validateRegisterMobile = (registerMobile) => {
    const minLength = 10;
    const maxLength = 10;
    const regex=/^\d{10}$/;
    return regex.test(String(registerMobile));
};
const validateMobileOtp = (mobileOtp) => {
    const minLength = 6;
    const maxLength = 6;
    const regex=/^\d{6}$/;
    return regex.test(String(mobileOtp));
};
const validatePassword = (password) => {
    const minLength = 3;
    const maxLength = 15;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    return(
        password.length>=minLength&&
        password.length<=maxLength&&
        hasUppercase&&
        hasLowercase&&
        hasNumber&&
        hasSpecialChar
    );
};
export {validateContactNumber,validatePassword,validateMobileOtp,validateRegisterMobile,validateUsername}