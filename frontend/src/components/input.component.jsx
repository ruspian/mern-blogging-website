import { useState } from "react";

const InputBox = ({ name, type, id, value, placeholder, icon, disable = false }) => {
  const [passwordShow, setPasswordShow] = useState(false);

  return (
    <div className="relative w-[100%] mb-4">
      <input
        name={name}
        type={type == "password" ? (passwordShow ? "text" : "password") : type}
        defaultValue={value}
        placeholder={placeholder}
        id={id}
        disabled={disable}
        className="input-box"
      />

      <i className={`fi ${icon} input-icon`}></i>

      {type == "password" ? (
        <i
          className={`${!passwordShow ? "fi-sr-eye-crossed" : "fi-sr-eye"}
            input-icon left-[auto] right-4 cursor-pointer`}
          onClick={() => setPasswordShow(!passwordShow)}
        ></i>
      ) : (
        ""
      )}
    </div>
  );
};

export default InputBox;
