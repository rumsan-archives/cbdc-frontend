import React, { useContext, useState, useEffect,useCallback } from 'react';
import { Row, Col } from 'reactstrap';
import { useToasts } from 'react-toast-notifications';
import TokenByProject from './tokens_by_project';
import BeneficiaryByProject from './beneficiary_by_project';
import { StatsCard } from '../ui_components/cards';
import { TOAST } from '../../constants';
import { UserContext } from '../../contexts/UserContext';
import {AppContext} from '../../contexts/AppSettingsContext';
import TransactionChart from '../ui_components/chart';
import { fetchAllocatedandUsedTokens } from '../../services/agency';

const Dashboard = () => {
	const { addToast } = useToasts();

	const { getDashboardStats } = useContext(UserContext);
	const { appSettings } = useContext(AppContext);
	const [stats, setStats] = useState({
		totalProjects: 0,
		totalVendors: 0,
		totalBeneficiaries: 0,
		totalMobilizers: 0,
		totalAllocation: 0,
		redeemedTokens: 0,
		beneficiariesByProject: [],
		tokensByProject: [],
		totalInstitutions: 0
	});
	const [exportData, setExportData] = useState({
		tokens_by_project: [],
		benef_by_project: []
	});
	const [cbdcPool,setCbdcPool] = useState({allocated:0,remaining:0})

	const getUsedTokens =  useCallback (async () => {
		if (!appSettings) return;
		const { agency } = appSettings;
		if (!agency || !agency.contracts) return;
		const { rahat_erc20,rahat } = agency.contracts;
		const {totalAllocated,used} = await fetchAllocatedandUsedTokens(rahat_erc20,rahat);
		const remainingToken = totalAllocated - used;
		setCbdcPool({allocated:used,remaining:remainingToken})
	},[appSettings])

	const fetchDashboardStats = () => {
		getDashboardStats()
			.then(d => {
				const {
					projectCount,
					vendorCount,
					beneficiary,
					mobilizerCount,
					tokenAllocation,
					institutionCount,
					tokenRedemption
				} = d;
				if (beneficiary && beneficiary.project.length) setBeneficiaryByProjectExport(beneficiary.project);
				if (tokenAllocation && tokenAllocation.projectAllocation.length)
					setTokensByProjectExport(tokenAllocation.projectAllocation);
				setStats(prevState => ({
					...prevState,
					totalProjects: projectCount,
					totalVendors: vendorCount,
					totalBeneficiaries: beneficiary.totalCount,
					totalMobilizers: mobilizerCount,
					totalAllocation: tokenAllocation.totalAllocation,
					redeemedTokens: tokenRedemption.totalTokenRedemption,
					beneficiariesByProject: beneficiary.project,
					tokensByProject: tokenAllocation.projectAllocation,
					totalInstitutions: institutionCount
				}));
			})
			.catch(() => {
				addToast('Internal server error!', TOAST.ERROR);
			});
	};

	const setBeneficiaryByProjectExport = data => {
		const export_data = data.map(d => {
			return { Project: d.name, Count: d.count };
		});
		setExportData(prevState => ({
			...prevState,
			benef_by_project: export_data
		}));
	};

	const setTokensByProjectExport = data => {
		const export_data = data.map(d => {
			return { Project: d.name, Tokens: d.token };
		});
		setExportData(prevState => ({
			...prevState,
			tokens_by_project: export_data
		}));
	};

	useEffect(fetchDashboardStats, []);
	useEffect(() => {
		getUsedTokens();
	}, [getUsedTokens]);

	return (
		<>
			<Row>
				<Col lg="3" md="6" sm="6">
					<StatsCard
						title="Program"
						subTitle="Total Programs"
						title_color="#2b7ec1"
						icon_color="#2b7ec1"
						icon_name="fas fa-clone"
						data={stats.totalProjects}
					/>
				</Col>
				<Col lg="3" md="6" sm="6">
					<StatsCard
						title="Beneficiaries"
						subTitle="Total Beneficiaries"
						title_color="#80D5AA"
						icon_color="#80D5AA"
						icon_name="fas fa-users"
						data={stats.totalBeneficiaries}
					/>
				</Col>
				<Col lg="3" md="6" sm="6">
					<StatsCard
						title="Vendors"
						subTitle="Total Vendors"
						title_color="#F49786"
						icon_color="#F49786"
						icon_name="fas fa-anchor"
						data={stats.totalVendors}
					/>
				</Col>
				<Col lg="3" md="6" sm="6">
					<BeneficiaryByProject
						releasedToken={cbdcPool.allocated}
						redeemedTokens={cbdcPool.remaining}
						data={stats.beneficiariesByProject}
						exportData={exportData.benef_by_project || []}
					/>
				</Col>
			</Row>
			<Row>
				<Col md="12">
					<TokenByProject data={stats.tokensByProject} exportData={exportData.tokens_by_project || []} />
				</Col>
				{/* <Col md="4">
					<BeneficiaryByProject
						releasedToken={stats.totalAllocation}
						redeemedTokens={stats.redeemedTokens}
						data={stats.beneficiariesByProject}
						exportData={exportData.benef_by_project || []}
					/>
				</Col> */}
			</Row>
		</>
	);
};

export default Dashboard;
