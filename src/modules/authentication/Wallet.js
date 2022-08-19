import React, { useEffect, useState } from 'react';
import { Card, Row, CardTitle, Col, Button, Form, FormGroup, Input } from 'reactstrap';
import Logo from '../../assets/images/apix.png';
import './wallet.css';
import { generateOTP, verifyOTP } from '../../services/users';
import { createRandomIdentity } from '../../utils';
import EthCrypto from 'eth-crypto';
import WalletService from '../../utils/blockchain/wallet';
import DataService from '../../services/db';
import { saveUser, saveUserToken } from '../../utils/sessionManager';

import Swal from 'sweetalert2';

const Wallet = () => {
	const [showHide, setShowHide] = useState('d-none');
	const [message, setMessage] = useState('');
	const [email, setEmail] = useState('');
	const [isWalletLogin, setIsWalletLogin] = useState(false);
	const [tempIdentity, setTempIdentity] = useState(null);

	const toggleLogin = e => {
		e.preventDefault();
		setIsWalletLogin(!isWalletLogin);
	};

	const getOtpAndLogin = async e => {
		e.preventDefault();
		setMessage('');
		setShowHide('d-none');
		const result = await generateOTP({ address: email, encryptionKey: tempIdentity.publicKey });
		if (result?.msg && !result?.status) {
			setMessage(result.msg);
			setShowHide('');
		}
		if (result.status) {
			const { value: otp } = await Swal.fire({
				title: 'Enter OTP Code',
				input: 'number',
				inputLabel: 'A 6 Digit Code has been sent to your email address',
				allowOutsideClick: true,
				inputValidator: value => {
					if (!value) {
						return 'Please enter 6 digit code sent to your email';
					}
					if (value.length !== 6) return 'Must be 6 digit';
				}
			});
			if (otp) {
				const isOTPValid = await verifyOTP({ otp, encryptionKey: tempIdentity.publicKey });
				saveUser(isOTPValid.user);
				saveUserToken(isOTPValid.token);
				const encryptedData = EthCrypto.cipher.parse(isOTPValid.key);
				const decryptedKey = await EthCrypto.decryptWithPrivateKey(tempIdentity.privateKey, encryptedData);
				DataService.savePrivateKey(decryptedKey);
				const wallet = await WalletService.loadFromPrivateKey(decryptedKey);
				DataService.save(wallet);
				window.location.replace('/');
			}
		}
	};

	useEffect(() => {
		const identity = createRandomIdentity();
		setTempIdentity(identity);
	}, []);

	return (
		<>
			<Row style={{ height: '100vh' }}>
				<Col className="left-content">
					<div className="text-center">
						<img src="https://assets.rumsan.com/rumsan-group/g20-logo.png" width="400PX" alt="rahat logo"></img>
						<div style={{ width: '410px' }}>
							<p className="description mt-4">
								Distribute and Track cash and mobilize the local community encouraging financial resilience and freedom.
							</p>
						</div>
					</div>
				</Col>
				<Col className="right-content">
					{/* <p className="text-signup">
						Haven’t registered?{' '}
						<Link to={`/sign_up`}>
							<span style={{ color: '#3F9EEB' }}>Sign up</span>
						</Link>
					</p> */}
					<div className=" text-center">
						<p className="text-title">Local Government</p>
						{!isWalletLogin && (
							<div className="mt-4">
								<Row>
									<Col>
										<Card style={{ padding: '20px', width: '25rem' }}>
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
													onClick={getOtpAndLogin}
													style={{ width: 'fit-content' }}
												>
													Log In
												</Button>
											</div>
											{/* <div className="mt-2">
                                                <p className="mt-2">
                                                    Do you use Rumsan Wallet? &nbsp;
                                                    <span type="button" onClick={toggleLogin} style={{ color: '#326481' }}>
                                                        Click Here
                                                    </span>
                                                </p>
                                            </div> */}
										</Card>
									</Col>
								</Row>
							</div>
						)}
					</div>
					<p className="text-privacy">
						<p className="text-copyright" style={{ color: '#ffffff' }}>
							Copyright © 2022 Rumsan Group of Companies | All Rights Reserved.
						</p>
					</p>
				</Col>
			</Row>
		</>
	);
};

export default Wallet;
