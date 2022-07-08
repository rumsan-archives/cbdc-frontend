import React, { useEffect, useState } from 'react';
import { Card, Row, CardTitle, Col, Button, Form, FormGroup, Input } from 'reactstrap';
import Logo from '../../assets/images/rahat-logo-blue.png';
import './wallet.css';

const Wallet = () => {
    const [showHide, setShowHide] = useState('d-none');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isWalletLogin, setIsWalletLogin] = useState(false);
    const [tempIdentity, setTempIdentity] = useState(null);
    const [otpLogin, setOtpLogin] = useState(false);
    const [otp, setOtp] = useState(null);
    const toggleLogin = e => {
        e.preventDefault();
        setIsWalletLogin(!isWalletLogin);
    };
    // const getOtpAndLogin = async e => {
    //     e.preventDefault();
    //     setMessage('');
    //     setShowHide('d-none');
    //     const result = await generateOTP({ address: email, encryptionKey: tempIdentity.publicKey });
    //     if (result?.msg && !result?.status) {
    //         setMessage(result.msg);
    //         setShowHide('');
    //     }
    //     if (result.status) {
    //         setOtpLogin(true);
    //         setCounter(59);
    //     }
    //     // if (result.status) {
    //     //  // const { value: otp } = await Swal.fire({
    //     //  //  title: 'Enter OTP Code',
    //     //  //  input: 'number',
    //     //  //  inputLabel: 'A 6 Digit Code has been sent to your email address',
    //     //  //  allowOutsideClick: true,
    //     //  //  inputValidator: value => {
    //     //  //      if (!value) {
    //     //  //          return 'Please enter 6 digit code sent to your email';
    //     //  //      }
    //     //  //      if (value.length !== 6) return 'Must be 6 digit';
    //     //  //  }
    //     //  // });
    //     //  if (otp) {
    //     //      const isOTPValid = await verifyOTP({ otp, encryptionKey: tempIdentity.publicKey });
    //     //      saveUser(isOTPValid.user);
    //     //      saveUserToken(isOTPValid.token);
    //     //      const encryptedData = EthCrypto.cipher.parse(isOTPValid.key);
    //     //      const decryptedKey = await EthCrypto.decryptWithPrivateKey(tempIdentity.privateKey, encryptedData);
    //     //      DataService.savePrivateKey(decryptedKey);
    //     //      const wallet = await WalletService.loadFromPrivateKey(decryptedKey);
    //     //      DataService.save(wallet);
    //     //      window.location.replace('/');
    //     //  }
    //     // }
    // };
    const [min, setMin] = React.useState(4);
    const [counter, setCounter] = React.useState(null);
    React.useEffect(() => {
        if (counter === 0) {
            if (min === 0) return;
            setCounter(59);
            setMin(min - 1);
        }
        const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
        return () => clearInterval(timer);
    }, [counter, min]);
    // useEffect(() => {
    //     const identity = createRandomIdentity();
    //     setTempIdentity(identity);
    // }, []);
    // const handleVerify = async () => {
    //     if (otp) {
    //         const isOTPValid = await verifyOTP({ otp, encryptionKey: tempIdentity.publicKey });
    //         saveUser(isOTPValid.user);
    //         saveUserToken(isOTPValid.token);
    //         const encryptedData = EthCrypto.cipher.parse(isOTPValid.key);
    //         const decryptedKey = await EthCrypto.decryptWithPrivateKey(tempIdentity.privateKey, encryptedData);
    //         DataService.savePrivateKey(decryptedKey);
    //         const wallet = await WalletService.loadFromPrivateKey(decryptedKey);
    //         DataService.save(wallet);
    //         window.location.replace('/');
    //     }
    // };
    // const handleOtpInput = e => {
    //     setOtp(e.target.value);
    // };
    return (
        <>
            <Row style={{ height: '100vh' }}>
                <Col className="left-content">
                    <div className="text-center">
                        <img src={Logo} height="200" width="460" alt="rahat logo"></img>
                        <div style={{ width: '410px' }}>
                            <p className="description">
                                Supporting vulnerable communities with a simple and efficient relief distribution platform.
                            </p>
                        </div>
                    </div>
                    <p className="text-copyright">Copyright © 2021 Rumsan Group of Companies | All Rights Reserved.</p>
                </Col>
                <Col className="right-content">
                    {/* <p className="text-signup">
                        Haven’t registered?{' '}
                        <Link to={`/sign_up`}>
                            <span style={{ color: '#3F9EEB' }}>Sign up</span>
                        </Link>
                    </p> */}
                    <div className=" text-center">
                        <p className="text-title">Rahat Palika App</p>
                        {!isWalletLogin && !otpLogin && (
                            <div className="mt-4">
                                <Row>
                                    <Col>
                                        <Card style={{ padding: '20px', width: '23rem' }}>
                                            <CardTitle className="text-left">
                                                <h5>Sign In</h5>
                                            </CardTitle>
                                            <p className={`mt-2 ${showHide}`} style={{ color: 'red' }}>
                                                {message}
                                            </p>
                                            <Form>
                                                <FormGroup className="mt-2">
                                                    <Input
                                                        type="email"
                                                        name="email"
                                                        placeholder="Your Email"
                                                        onChange={e => setEmail(e.target.value)}
                                                    />
                                                </FormGroup>
                                            </Form>
                                            <div className="text-center">
                                                <Button
                                                    color="primary"
                                                    type="button"
                                                    size="md"
                                                    style={{ width: 'fit-content' }}
                                                >
                                                    Log In
                                                </Button>
                                            </div>
                                            <div className="mt-2">
                                                <p className="mt-2">
                                                    Do you use Rumsan Wallet? &nbsp;
                                                    <span type="button" onClick={toggleLogin} style={{ color: '#326481' }}>
                                                        Click Here
                                                    </span>
                                                </p>
                                            </div>
                                        </Card>
                                    </Col>
                                </Row>
                            </div>
                        )}
                        {/* {isWalletLogin && !otpLogin && <WalletComponent toggleLogin={toggleLogin} />} */}
                        {otpLogin && (
                            <>
                                <Card style={{ padding: '20px', width: '23rem' }}>
                                    <p>
                                        <b>If you didn't receive a code, Resend</b>
                                    </p>
                                    <div className="p-2">
                                        <Input className="mt-2 custom-number-input" type="number" name="number" />
                                    </div>
                                    <div className="mt-2">
                                        <p fontWeight={500} align="center" color="textSecondary">
                                            {' '}
                                            Resend OTP in{' '}
                                            <span style={{ color: '#217EC2', fontWeight: 'bold' }}>
                                                {' '}
                                                0{min}:{counter}
                                            </span>{' '}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <Button
                                            type="button"
                                            size="md"
                                            style={{ width: '90%', backgroundColor: '#326481' }}
                                        >
                                            Verify
                                        </Button>
                                    </div>
                                    <p className="mt-2" style={{ color: '#326481' }}>
                                        <a href="#">
                                            <u>Resend OTP</u>
                                        </a>
                                    </p>
                                </Card>
                            </>
                        )}
                    </div>
                    <p className="text-privacy">
                        By signing up you acknowledge the{' '}
                        <a href="https://docs.rahat.io/privacy-policy" className="privacy-policy">
                            Privacy Policy
                        </a>{' '}
                        .
                    </p>
                </Col>
            </Row>
        </>
    );
};
export default Wallet;