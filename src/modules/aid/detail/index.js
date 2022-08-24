import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Row, Col, Tooltip } from 'reactstrap';
import { useToasts } from 'react-toast-notifications';

import { AidContext } from '../../../contexts/AidContext';
import { AppContext } from '../../../contexts/AppSettingsContext';
import DetailsCard from '../../global/DetailsCard';
import ProjectInfo from './projectInfo';
import PieChart from './pieChart';
// import BarChart from './barChart';
import Tabs from './tab';
import { TOAST, PROJECT_STATUS, ROLES } from '../../../constants';
import BreadCrumb from '../../ui_components/breadcrumb';
import { getUser } from '../../../utils/sessionManager';
import { useHistory } from 'react-router-dom';
import API from '../../../constants/api';
// import Balance from '../../ui_components/balance';

export default function Index(props) {
	const { id } = props.match.params;
	const history = useHistory();
	const { addToast } = useToasts();
	const {
		total_tokens,
		available_tokens,
		getAidDetails,
		changeProjectStatus,
		getProjectCapital,
		getAidBalance,
		getProjectPackageBalance
	} = useContext(AidContext);
	const {
		// loading,
		appSettings
	} = useContext(AppContext);

	const [projectDetails, setProjectDetails] = useState(null);
	const [fetchingBlockchain, setFetchingBlockchain] = useState(false);

	const handleStatusChange = status => {
		const success_label = status === PROJECT_STATUS.CLOSED ? 'Closed' : 'Activated';
		changeProjectStatus(id, status)
			.then(d => {
				setProjectDetails(d);
				addToast(`Program has been ${success_label}`, TOAST.SUCCESS);
			})
			.catch(err => {
				addToast(err.message, TOAST.ERROR);
			});
	};

	const fetchProjectDetails = () => {
		getAidDetails(id)
			.then(res => {
				setProjectDetails(res);
			})
			.catch(err => {
				addToast(err.message, TOAST.ERROR);
			});
	};

	const fetchPackageAndTokenBalance = useCallback(async () => {
		if (!appSettings) return;
		const { agency } = appSettings;
		if (!agency || !agency.contracts) return;
		try {
			setFetchingBlockchain(true);
			const { rahat_admin } = agency.contracts;
			await getProjectCapital(id, rahat_admin);
			await getAidBalance(id, rahat_admin);
		} catch (err) {
			console.log(err);
			addToast(err.message, TOAST.ERROR);
		} finally {
			setFetchingBlockchain(false);
		}
	}, [addToast, appSettings, getAidBalance, getProjectCapital, id]);

	useEffect(fetchProjectDetails, []);

	useEffect(() => {
		fetchPackageAndTokenBalance();
	}, [fetchPackageAndTokenBalance]);


	return (
		<>
			<Row>
				<Col md="9">
					<p className="page-heading">Program</p>
					<BreadCrumb redirect_path="projects" root_label="Programs" current_label="Details" />
				</Col>
			</Row>
			<Row>
				<Col md="7">
					{projectDetails && (
						<DetailsCard
							fetching={fetchingBlockchain}
							title="Program Details"
							button_name="Generate QR Code"
							name="Program Name"
							name_value={projectDetails.name}
							status={projectDetails.status}
							total="Program Budget"
							total_value={total_tokens}
							handleStatusChange={handleStatusChange}
						/>
					)}
					{projectDetails && <ProjectInfo projectDetails={projectDetails} />}
				</Col>
				<Col md="5">
					{projectDetails && (
						<PieChart
							fetching={fetchingBlockchain}
							available_tokens={available_tokens}
							total_tokens={total_tokens}
							projectStatus={projectDetails.status}
							projectId={id}
						/>
					)}

					
				</Col>
			</Row>

			{/* <Row> */}
			{/* <Col md="7">{projectDetails && <ProjectInfo projectDetails={projectDetails} />}</Col> */}
			{/* <Col md="5"> */}
			{/* <PieChart
						fetching={fetchingBlockchain}
						available_tokens={available_tokens}
						total_tokens={total_tokens}
						total_package={totalFiatBalance}
					/> */}

			{/* <BarChart
						fetching={fetchingBlockchain}
						available_tokens={available_tokens}
						total_tokens={total_tokens}
						total_package={totalFiatBalance}
					/> */}
			{/* </Col> */}
			{/* </Row> */}
			<Tabs projectId={id} />
		</>
	);
}
