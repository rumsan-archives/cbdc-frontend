import React, { useState, useEffect, useContext } from 'react';
import { useToasts } from 'react-toast-notifications';
import {
	Card,
	CardBody,
	Row,
	Col,
	Form,
	FormGroup,
	Label,
	Input,
	Button,
	InputGroup,
	ButtonDropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem
} from 'reactstrap';

import { TOAST, APP_CONSTANTS, ROLES } from '../../../constants';
import { AidContext } from '../../../contexts/AidContext';
import { AppContext } from '../../../contexts/AppSettingsContext';
import { UserContext } from '../../../contexts/UserContext';
import { History } from '../../../utils/History';
import SelectWrapper from '../../global/SelectWrapper';
import GrowSpinner from '../../../modules/global/GrowSpinner';
import BreadCrumb from '../../ui_components/breadcrumb';

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

const AddProject = () => {
	const { addToast } = useToasts();
	const { listFinancialInstitutions, addAid } = useContext(AidContext);
	const { loading, setLoading } = useContext(AppContext);
	const { listUsersByRole } = useContext(UserContext);

	const [financialInstitutions, setFinancialInstitutions] = useState([]);
	const [projectManagers, setProjectManagers] = useState([]);
	const [benefUploadFile, setBenefUploadFile] = useState('');

	const [formData, setFormData] = useState({
		name: '',
		location: '',
		description: ''
	});
	const [selectedInstitutions, setSelectedInstitutions] = useState([]);
	const [selectedManager, setSelectedManager] = useState('');
	const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
	const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
	const [requiredToken, setRequiredToken] = useState(0);
	const [projectDuration, setProjectDuration] = useState({});
	const [disbursementPeriod, setDisbursementPeriod] = useState({});
	const [disbursementTime, setDisbursementTime] = useState(0);
	// const [disbursementamount, setDisbursementAmount] = useState(0);

	const toggleTimeDropDown = () => setTimeDropdownOpen(!timeDropdownOpen);

	const togglePeriodDropDown = () => setPeriodDropdownOpen(!periodDropdownOpen);

	const changeProjectDuration = el => {
		setProjectDuration(el);
	};

	const changeDisbursementPeriod = el => {
		setDisbursementPeriod(el);
	};

	const changeDisbursementAmount = e => {
		const projectDurationInDays = disbursementTime * projectDuration.days;
		const numberOfDisbursements = projectDurationInDays / disbursementPeriod.days;
		setRequiredToken(e.target.value * numberOfDisbursements);
	};

	const handleInputChange = e => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleFileChange = e => {
		setBenefUploadFile(e.target.files[0]);
	};

	const handleInstitutionChange = data => {
		const institution_values = data.map(d => d.value);
		setSelectedInstitutions(institution_values);
	};

	const handleProjectManagerChange = e => {
		setSelectedManager(e.value);
	};

	const handleFormSubmit = e => {
		e.preventDefault();
		if (!selectedManager) return addToast('Please select program manager', TOAST.ERROR);
		const form_payload = createFormData(formData);
		setLoading(true);
		addAid(form_payload)
			.then(res => {
				setLoading(false);
				addToast(`program created with ${res.uploaded_beneficiaries} beneficiary upload`, TOAST.SUCCESS);
				History.push('/programs');
			})
			.catch(err => {
				setLoading(false);
				let err_msg = err.message;
				if (err_msg === 'Request failed with status code 500') {
					addToast('program has been created', TOAST.SUCCESS);
					err_msg = 'Upload failed due to duplicate data!';
					addToast(err_msg, TOAST.ERROR);
					History.push('/programs');
				} else addToast(err_msg, TOAST.ERROR);
			});
	};

	const createFormData = payload => {
		const form_data = new FormData();
		for (let property in payload) {
			form_data.append(property, payload[property]);
		}
		if (selectedInstitutions.length) form_data.append('financial_institutions', selectedInstitutions.toString());
		if (benefUploadFile) form_data.append('file', benefUploadFile);
		form_data.append('project_manager', selectedManager);
		return form_data;
	};

	const handleCancelClick = () => History.push('/projects');

	useEffect(() => {
		async function fetchData() {
			const users = await listUsersByRole(ROLES.ADMIN);
			const institutions = await listFinancialInstitutions({ limit: APP_CONSTANTS.FETCH_LIMIT });
			if (institutions && institutions.data.length) loadFinancialInstiturions(institutions.data);
			if (users && users.data.length) loadProjectManagers(users.data);
		}

		fetchData();
	}, [listUsersByRole, listFinancialInstitutions]);

	const loadFinancialInstiturions = data => {
		const populate_institutions = data.map(d => {
			return { label: d.name, value: d._id };
		});
		setFinancialInstitutions(populate_institutions);
	};

	const loadProjectManagers = users => {
		const populate_managers = users.map(u => {
			return { label: u.fullname, value: u.wallet_address };
		});
		setProjectManagers(populate_managers);
	};

	return (
		<div>
			<p className="page-heading">Programs</p>
			<BreadCrumb redirect_path="projects" root_label="Programs" current_label="Add" />

			<Row>
				<Col md="12">
					<Card>
						<CardBody>
							<Form onSubmit={handleFormSubmit} style={{ color: '#6B6C72' }}>
								<FormGroup>
									<Label>Program Name</Label>
									<Input type="text" value={formData.name} name="name" onChange={handleInputChange} required />
								</FormGroup>

								<FormGroup>
									<Label>Program Manager</Label>
									<SelectWrapper
										id="project_manager"
										onChange={handleProjectManagerChange}
										maxMenuHeight={200}
										currentValue={[]}
										data={projectManagers}
										placeholder="--Select Manager--"
									/>
								</FormGroup>

								<FormGroup>
									<Label>Location</Label>
									<Input type="text" value={formData.location} name="location" onChange={handleInputChange} required />
								</FormGroup>

								<FormGroup>
									<Label>Description</Label>
									<Input
										type="textarea"
										onChange={handleInputChange}
										value={formData.description}
										name="description"
										rows="4"
									/>
								</FormGroup>

								{/* <Row>
									<Col md="6" sm="12">
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

									<Col md="6" sm="12">
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
								</Row>

								<FormGroup>
									<Label>
										Total Required Token: <strong>{requiredToken}</strong>
									</Label>
								</FormGroup> */}

								{/* <FormGroup>
									<Label>Financial Institution</Label>
									<SelectWrapper
										multi={true}
										onChange={handleInstitutionChange}
										maxMenuHeight={130}
										currentValue={[]}
										data={financialInstitutions}
										placeholder="--Select Institution--"
									/>
								</FormGroup> */}
								{/* <FormGroup>
									<Label htmlFor="benefUpload">Beneficiary Upload(.xlxs file)</Label>
									<Input
										id="benefUpload"
										type="file"
										name="file"
										onChange={handleFileChange}
										accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
									/>
								</FormGroup> */}

								<CardBody style={{ paddingLeft: 0 }}>
									{loading ? (
										<GrowSpinner />
									) : (
										<div>
											<Button type="submit" className="btn btn-info">
												<i className="fa fa-check"></i> Submit
											</Button>
											<Button
												type="button"
												onClick={handleCancelClick}
												style={{ borderRadius: 8 }}
												className="btn btn-dark ml-2"
											>
												Cancel
											</Button>
										</div>
									)}
								</CardBody>
							</Form>
						</CardBody>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default AddProject;
