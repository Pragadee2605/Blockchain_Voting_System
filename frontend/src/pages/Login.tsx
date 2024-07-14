import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { Formik } from "formik";
import { RouteProps } from "react-router";
import LoginLayout from "../layouts/Login";
import * as Yup from "yup";
import axios from "../axios";
import { AuthContext } from "../contexts/Auth";

const schema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(3).required("Required"),
});

const Login = (props: RouteProps): JSX.Element => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const [error, setError] = useState<any>("");
  const [otpError, setOtpError] = useState<string>("");

  const [otp, setOtp] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const generateOtp = () => {
    let generatedOtp = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+=-{}][\|:;?/><,.`~';

    for (let i = 0; i < 6; i++) {
      generatedOtp += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    setOtp(generatedOtp);
    setIsValid(null);
    setOtpError("");
  };

  const validateOtp = () => {
    if (userInput === otp) {
      setIsValid(true);
      setOtpError("");
    } else {
      setIsValid(false);
      setOtpError("");
    }
  };

  return (
    <div>
      <LoginLayout error={error}>
        <div>
          <div className="form-container">
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={schema}
              onSubmit={(values) => {
                if (isValid === null || isValid === false) {
                  setOtpError("Please enter a valid Captcha");
                  return;
                }

                axios
                  .post("/auth/login", { ...values })
                  .then((res) => {
                    authContext.authenticate(res.data.user, res.data.accessToken);
                  })
                  .catch((err) => {
                    let error = err.message;
                    if (err?.response?.data)
                      error = JSON.stringify(err.response.data);
                    setError(error);
                  });
              }}
            >
              {({ errors, touched, getFieldProps, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  <div className="input-container">
                    <input
                      id="email"
                      type="email"
                      placeholder="Email"
                      {...getFieldProps("email")}
                    />
                    <div className="form-error-text">
                      {touched.email && errors.email ? errors.email : null}
                    </div>
                  </div>

                  <div className="input-container">
                    <input
                      id="password"
                      type="password"
                      placeholder="Password"
                      {...getFieldProps("password")}
                    />
                    <div className="form-error-text">
                      {touched.password && errors.password
                        ? errors.password
                        : null}
                    </div>
                  </div>
                  <button className="login-button button-primary" onClick={generateOtp}>Generate Captcha</button>
                    {otp && <div>{otp}</div>}
                  <div className="input-container">
                    <input
                      type="text"
                      placeholder="Enter Captcha"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <button className="login-button button-primary" type="submit" onClick={validateOtp}>Login</button>
                    {isValid === true && <div>Valid Captcha</div>}
                    {isValid === false && <div>Invalid Captcha</div>}
                  </div>
                  
                </form>
              )}
            </Formik>

            <div className="form-error-text">{otpError}</div>

            <div className="form-info-text">Forgot Password?</div>

            <hr />

            <button
              onClick={() => navigate("/signup")}
              className="button-secondary"
            >
              Create a New Account
            </button>
          </div>
        </div>
      </LoginLayout>
    </div>
  );
};

export default Login;
