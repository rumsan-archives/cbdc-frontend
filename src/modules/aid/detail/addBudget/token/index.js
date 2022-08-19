import React, { useState, useContext, useCallback, useEffect } from 'react';
import {
	Row,
	Col,
	FormGroup,
	Label,
	Input,
	Button,
	InputGroup,
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Modal,
	ModalBody
} from 'reactstrap';
import { useToasts } from 'react-toast-notifications';
import { useHistory } from 'react-router-dom';

import { AppContext } from '../../../../../contexts/AppSettingsContext';
import { AidContext } from '../../../../../contexts/AidContext';

import PasscodeModal from '../../../../global/PasscodeModal';
import MaskLoader from '../../../../global/MaskLoader';

import { TOAST } from '../../../../../constants';
import { formatBalanceAndCurrency } from '../../../../../utils';

const Token = ({ projectId }) => {
	const { addToast } = useToasts();
	const history = useHistory();

	const { total_tokens, available_tokens, addProjectBudget } = useContext(AidContext);

	const { wallet, isVerified, appSettings } = useContext(AppContext);
	const [inputTokens, setInputToken] = useState('');

	const [passcodeModal, setPasscodeModal] = useState(false);
	const [masking, setMasking] = useState(false);

	const timeDuration = [
		{ name: 'Week', days: 7 },
		{ name: 'Month', days: 30 },
		{ name: 'Year', days: 365 }
	];
	const timePeriod = [
		{ name: 'Daily', days: 1 },
		{ name: 'Weekly', days: 7 },
		{ name: 'Monthly', days: 30 },
		{ name: 'Yearly', days: 365 }
	];

	const [disbursementTime, setDisbursementTime] = useState(0);
	const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
	const toggleTimeDropDown = () => setTimeDropdownOpen(!timeDropdownOpen);
	const [projectDuration, setProjectDuration] = useState({});
	const [requiredToken, setRequiredToken] = useState(0);
	const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
	const [calculateToken, setCalculateToken] = useState(true);
	const [editToken, setEditToken] = useState(false);

	const handleCalculate = () => {
		setCalculateToken(!calculateToken);
		setEditToken(!editToken);
	};

	const changeProjectDuration = el => {
		setProjectDuration(el);
	};

	const togglePeriodDropDown = () => setPeriodDropdownOpen(!periodDropdownOpen);

	const changeDisbursementAmount = e => {
		const projectDurationInDays = disbursementTime * projectDuration.days;
		const numberOfDisbursements = projectDurationInDays / disbursementPeriod.days;
		setRequiredToken(e.target.value * numberOfDisbursements);
	};

	const [disbursementPeriod, setDisbursementPeriod] = useState({});
	const changeDisbursementPeriod = el => {
		setDisbursementPeriod(el);
	};

	const handleInputChange = e => {
		let { value } = e.target;
		setInputToken(value);
	};

	const togglePasscodeModal = useCallback(() => {
		setPasscodeModal(!passcodeModal);
	}, [passcodeModal]);

	const handleTokenSubmit = e => {
		e.preventDefault();
		togglePasscodeModal();
	};

	const [modal, setModal] = useState(false);

	const toggle = () => setModal(!modal);

	const submitProjectBudget = useCallback(async () => {
		if (isVerified && wallet) {
			try {
				setPasscodeModal(false);
				setMasking(true);
				const { rahat_admin } = appSettings.agency.contracts;
				const res = await addProjectBudget(wallet, projectId, inputTokens, rahat_admin);
				if (res) {
					setInputToken('');
					setMasking(false);
					addToast(`${inputTokens} tokens added to the project`, TOAST.SUCCESS);
					history.push(`/projects/${projectId}`);
				}
			} catch (err) {
				setPasscodeModal(false);
				let err_msg = err.message ? err.message : 'Could not add token!';
				// if (err.code === 4001) err_msg = err.message;
				setMasking(false);
				addToast(err_msg, TOAST.ERROR);
			}
		}
	}, [addProjectBudget, addToast, appSettings.agency, inputTokens, isVerified, projectId, wallet, history]);

	useEffect(() => {
		submitProjectBudget();
	}, [isVerified, submitProjectBudget]);

	return (
		<>
			<MaskLoader message="Adding token, please wait..." isOpen={masking} />
			<PasscodeModal isOpen={passcodeModal} toggleModal={togglePasscodeModal}></PasscodeModal>

			{calculateToken && (
				<div className="spacing-budget">
					<Row>
						<Col md="6" sm="12" className="mb-3">
							<p className="card-font-bold">{formatBalanceAndCurrency(total_tokens)}</p>
							<div className="sub-title">Beneficiaries</div>
						</Col>
						{/* <Col md="6" sm="12">
						<p className="card-font-bold">{formatBalanceAndCurrency(available_tokens)}</p>
						<div className="sub-title">Available Token</div>
					</Col> */}
					</Row>
					<Row>
						<Col md="5" sm="12">
							<FormGroup>
								<Label>Program Period</Label>
								<InputGroup>
									<Input type="number" onChange={e => setDisbursementTime(e.target.value)} />
									<ButtonDropdown isOpen={timeDropdownOpen} toggle={toggleTimeDropDown}>
										<DropdownToggle caret>{projectDuration?.name || 'Time'}</DropdownToggle>
										<DropdownMenu>
											{timeDuration.map((el, i) => (
												<DropdownItem key={i} onClick={() => changeProjectDuration(el)}>
													{' '}
													{el.name}
												</DropdownItem>
											))}
										</DropdownMenu>
									</ButtonDropdown>
								</InputGroup>
							</FormGroup>
						</Col>

						<Col md="5" sm="12">
							<FormGroup>
								<Label>Token Disbursement</Label>
								<InputGroup>
									<ButtonDropdown isOpen={periodDropdownOpen} toggle={togglePeriodDropDown}>
										<DropdownToggle caret>{disbursementPeriod?.name || 'Period'}</DropdownToggle>
										<DropdownMenu>
											{timePeriod.map((el, i) => (
												<DropdownItem key={i} onClick={() => changeDisbursementPeriod(el)}>
													{' '}
													{el.name}
												</DropdownItem>
											))}
										</DropdownMenu>
									</ButtonDropdown>
									<Input placeholder="Disbursement Amount" type="number" onChange={changeDisbursementAmount} />
								</InputGroup>
							</FormGroup>
						</Col>
						<Col md="2" sm="6" className="">
							<br />
							<Button type="button" onClick={handleCalculate} className="btn btn-info mt-2">
								Calculate
							</Button>
						</Col>
					</Row>

					<FormGroup>
						<Label>
							Total Required Token: <strong>{requiredToken}</strong>
						</Label>
					</FormGroup>
				</div>
			)}

			{editToken && (
				<div className="spacing-budget">
					<Row className="mb-3 justify-content-center">
						<Col md="2" sm="12" className="mb-3">
							<p className="card-font-bold">{formatBalanceAndCurrency(total_tokens)}</p>
							<div className="sub-title mt-2">
								{' '}
								Total <br /> Beneficiaries
							</div>
						</Col>
						<Col md="2" sm="12" className="mb-3">
							<p className="card-font-bold">50000</p>
							<div className="sub-title mt-2">
								Disbursement <br /> Amount
							</div>
						</Col>
						<Col md="2" sm="12" className="mb-3">
							<p className="card-font-bold">50000</p>
							<div className="sub-title mt-2">
								Total <br /> Budget
							</div>
						</Col>
						<Col md="3" sm="12" className="mb-3">
							<p className="card-font-bold">2023-02-05</p>
							<div className="sub-title mt-2">End Date</div>
						</Col>
						<Col md="2" sm="12" className="mt-3 mb-3">
							<Button type="button" onClick={handleCalculate} className="btn btn-info mt-2" style={{ width: '130px' }}>
								Edit
							</Button>
						</Col>
					</Row>
					<Row className="text-center">
						<Col md="12" sm="12" lg="12" xs="12" className="">
							<div>
								<Button type="button" onClick={toggle} className="btn btn-info mt-2" style={{ width: '250px' }}>
									Start Program
								</Button>
								<Modal size="md" centered isOpen={modal} toggle={toggle}>
									<ModalBody className="mt-2 mb-2 ml-2 mr-2 text-center" style={{ fontSize: '28px' }}>
										Are you sure you want to start program with given settings?
										<Row className="text-center mt-3 mb-3">
											<Col sm="6" xs="6">
												<Button type="button" className="btn btn-info mt-2" style={{ width: '130px' }}>
													Confirm
												</Button>
											</Col>
											<Col sm="6" xs="6">
												<Button
													type="button"
													className="btn mt-2"
													color="danger"
													style={{
														width: '130px',
														boxShadow: '0px 4px 15px 3px rgb(83 167 216 / 15%)',
														borderRadius: '8px'
													}}
												>
													Cancel
												</Button>
											</Col>
										</Row>
									</ModalBody>
								</Modal>
							</div>
						</Col>
					</Row>
				</div>
			)}
		</>
	);
};

export default Token;
