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
import { formatBalanceAndCurrency,dateToSeconds,secondsToDate } from '../../../../../utils';

const Token = ({ projectId }) => {
	const { addToast } = useToasts();
	const history = useHistory();

	const { total_tokens, available_tokens, addProjectBudget,setDisbursementData,disbursementData,beneficiary_pagination,beneficiaryByAid,allocateProjectBudget } = useContext(AidContext);

	const { wallet, isVerified, appSettings } = useContext(AppContext);
	const [inputTokens, setInputToken] = useState('');

	const [passcodeModal, setPasscodeModal] = useState(false);
	const [masking, setMasking] = useState(false);

	const timeDuration = [
		{ name: 'Week', days: 7, seconds:604800 },
		{ name: 'Month', days: 30 , seconds: 2628000},
		{ name: 'Year', days: 365 , seconds: 31536000}
	];
	const timePeriod = [
		{ name: 'Every Minute', days: 0 , seconds:60},
		{ name: 'Hourly', days: 0 , seconds:3600},
		{ name: 'Daily', days: 1 , seconds:86400},
		{ name: 'Weekly', days: 7 , seconds:604800},
		{ name: 'Monthly', days: 30 , seconds:2628000},
		{ name: 'Yearly', days: 365 ,seconds:31536000}
	];

	const [disbursementTime, setDisbursementTime] = useState(0);
	const [disbursementAmount,setDisburementAmount] = useState(0);
	const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
	const toggleTimeDropDown = () => setTimeDropdownOpen(!timeDropdownOpen);
	const [projectDuration, setProjectDuration] = useState({});
	const [requiredToken, setRequiredToken] = useState(0);
	const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
	const [calculateToken, setCalculateToken] = useState(true);
	const [editToken, setEditToken] = useState(false);
	const [startDate,setStartDate] = useState(0);
	const [endDate,setEndDate] = useState(0);


	const handleCalculate = () => {
		//if(!)
		setCalculateToken(!calculateToken);
		setEditToken(!editToken); 
		setDisbursementData({disbursementAmount:disbursementAmount,
				disbursementFrequency:disbursementPeriod.seconds,
				startDate:startDate,
				endDate:endDate,
				totalDisbursementAmount:requiredToken
			})
	};

	const changeProjectDuration = el => {
		setProjectDuration(el);
	};

	const togglePeriodDropDown = () => setPeriodDropdownOpen(!periodDropdownOpen);

	const changeDisbursementAmount = e => {
		setDisburementAmount(e.target.value);
		const projectDurationInSeconds = disbursementTime * projectDuration.seconds;
		const projectEndDateInSeconds = dateToSeconds(startDate) + projectDurationInSeconds;
		const numberOfDisbursements = projectDurationInSeconds / disbursementPeriod.seconds;
		setRequiredToken(e.target.value * numberOfDisbursements * beneficiary_pagination.total);
		setEndDate(secondsToDate(projectEndDateInSeconds))
	};

	const [disbursementPeriod, setDisbursementPeriod] = useState({});
	const changeDisbursementPeriod = el => {
		setDisbursementPeriod(el);
	};

	const handleInputChange = e => {
		if(e.target.name === 'startDate') setStartDate(e.target.value)
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

	const allocateBudgetToProject = async() => {
		if(!wallet) return;
		if(!appSettings?.agency?.contracts) return;
		try{
		console.log(wallet)
		const { rahat_admin } = appSettings.agency.contracts;
		console.log({rahat_admin})
		setMasking(true);
		const res = await allocateProjectBudget(wallet,projectId,rahat_admin)
		if (res) {
			setInputToken('');
			setMasking(false);
			addToast(`${inputTokens} tokens added to the project`, TOAST.SUCCESS);
			history.push(`/projects/${projectId}`);
		}
	}
	catch(err){
				let err_msg = err.message ? err.message : 'Could not add token!';
				setMasking(false);
				addToast(err_msg, TOAST.ERROR);
	}
		
	}

	// const submitProjectBudget = useCallback(async () => {
	// 	if (isVerified && wallet) {
	// 		try {
	// 			setPasscodeModal(false);
	// 			setMasking(true);
	// 			const { rahat_admin } = appSettings.agency.contracts;
	// 			const res = await addProjectBudget(wallet, projectId, inputTokens, rahat_admin);
	// 			if (res) {
	// 				setInputToken('');
	// 				setMasking(false);
	// 				addToast(`${inputTokens} tokens added to the project`, TOAST.SUCCESS);
	// 				history.push(`/projects/${projectId}`);
	// 			}
	// 		} catch (err) {
	// 			setPasscodeModal(false);
	// 			let err_msg = err.message ? err.message : 'Could not add token!';
	// 			// if (err.code === 4001) err_msg = err.message;
	// 			setMasking(false);
	// 			addToast(err_msg, TOAST.ERROR);
	// 		}
	// 	}
	// }, [addProjectBudget, addToast, appSettings.agency, inputTokens, isVerified, projectId, wallet, history]);

	// useEffect(() => {
	// 	submitProjectBudget();
	// }, [isVerified, submitProjectBudget]);

	const fetchTotalRecords = useCallback(async () => {
		try {
			await beneficiaryByAid(projectId);
		} catch (err) {
			addToast('Something went wrong!', {
				appearance: 'error',
				autoDismiss: true
			});
		}
	}, [addToast, beneficiaryByAid, projectId]);

	useEffect(() => {
		fetchTotalRecords();
	}, [fetchTotalRecords]);

	return (
		<>
			<MaskLoader message="Allocating Tokens, please wait..." isOpen={masking} />
			<PasscodeModal isOpen={passcodeModal} toggleModal={togglePasscodeModal}></PasscodeModal>

			{calculateToken && (
				<div className="spacing-budget">
					<Row>
						<Col md="6" sm="12" className="mb-3">
							<p className="card-font-bold">{beneficiary_pagination.total}</p>
							<div className="sub-title">Beneficiaries</div>
						</Col>
						{/* <Col md="6" sm="12">
						<p className="card-font-bold">{formatBalanceAndCurrency(available_tokens)}</p>
						<div className="sub-title">Available Token</div>
					</Col> */}
					</Row>
					<Row>
						<Col md="5" sm="12" className='mb-3'>
									
							<Label className="mr-3">Start Date:</Label>
							<Input className="mr-3" name="startDate" type="date" onChange={handleInputChange} />
													
					</Col>
					
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
					
					<Row className='mt-3'>
					<Col>
					<Label>
							Total Required Token: <strong>{requiredToken}</strong>
						</Label>
					</Col>
						
						<Col>
					<Label>
							Project End Date: <strong>{endDate}</strong>
						</Label>
					</Col>
					</Row>
				</div>
			)}

			{editToken && (
				<div className="spacing-budget">
					<Row className="mb-3 justify-content-center">
						<Col md="2" sm="12" className="mb-3">
							<p className="card-font-bold">{beneficiary_pagination.total}</p>
							<div className="sub-title mt-2">
								{' '}
								Total <br /> Beneficiaries
							</div>
						</Col>
						<Col md="2" sm="12" className="mb-3">
							<p className="card-font-bold">{disbursementData.disbursementAmount}</p>
							<div className="sub-title mt-2">
								Disbursement <br /> Amount
							</div>
						</Col>
						<Col md="2" sm="12" className="mb-3">
							<p className="card-font-bold">{Math.round(disbursementData.totalDisbursementAmount)}</p>
							<div className="sub-title mt-2">
								Total <br /> Budget
							</div>
						</Col>
						<Col md="3" sm="12" className="mb-3">
							<p className="card-font-bold">{endDate}</p>
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
												<Button onClick={allocateBudgetToProject} type="button" className="btn btn-info mt-2" style={{ width: '130px' }}>
													Confirms
												</Button>
											</Col>
											<Col sm="6" xs="6">
												<Button
													type="button"
													className="btn mt-2"
													color="danger"
													onClick={toggle}
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
