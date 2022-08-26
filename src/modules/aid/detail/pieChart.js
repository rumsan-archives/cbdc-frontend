import React from 'react';
import { useHistory } from 'react-router-dom';
import { Card, CardBody, CardTitle, Col, Label, Row } from 'reactstrap';
import { Pie } from 'react-chartjs-2';
import Loading from '../../global/Loading';
import { getUser } from '../../../utils/sessionManager';
import { ROLES, PROJECT_STATUS, TOAST } from '../.../../../../constants';
import { useToasts } from 'react-toast-notifications';

export default function Chart({ available_tokens, total_tokens, total_package, available_package, fetching, projectStatus, projectId,enableBudgetAdd }) {
	const history = useHistory();
	const { addToast } = useToasts();

	const pieDataToken = {
		labels: ['Remaining', 'Disbursed'],
		datasets: [
			{
				data: [available_tokens, total_tokens - available_tokens],
				backgroundColor: ['#2b7ec1', '#fd7e14'],
				hoverBackgroundColor: ['#2b7ec1', '#fd7e14']
			}
		]
	};


	const handleClick = () => {
		const currentUser = getUser();
		const isManager = currentUser && currentUser.roles.includes(ROLES.MANAGER);
		if (isManager || projectStatus === PROJECT_STATUS.SUSPENDED)
			return addToast('Access denied for this operation!', TOAST.ERROR);
		history.push(`/add-budget/${projectId}`);
	};
	return (
		<div>
			<Card>
				<CardBody>
					<Row>
						<Col>
							<CardTitle className="title">Balance</CardTitle>
						</Col>
						<Col>
						{enableBudgetAdd ? (<button
								type="button"
								className="btn waves-effect waves-light btn-outline-info"
								style={{ borderRadius: '8px', float: 'right' }}
								onClick={handleClick}
							>
								Add Budget
							</button>):
							(
								<button
								type="button"
								className="btn waves-effect waves-light btn-info"
								style={{ borderRadius: '8px', float: 'right' }}
								onClick={handleClick}
								disabled
							>
								Budget Activated
							</button>
							)
							}
							
						</Col>
					</Row>
					{fetching ? (
						<Loading />
					) : (
						<div>
							<div
								className="chart-wrapper"
								style={{ width: '100%', marginBottom: '50px', marginTop: '10px', height: 160 }}
							>
								<Label style={{ marginBottom: '10px' }}>Tokens</Label>
								<Pie
									data={pieDataToken}
									options={{
										maintainAspectRatio: false,
										legend: {
											display: true,
											position: 'bottom',
											labels: {
												fontFamily: 'Be Vietnam',
												fontColor: '#9B9B9B'
											}
										}
									}}
								/>
							</div>
					
						</div>
					)}
				</CardBody>
			</Card>
		</div>
	);
}
